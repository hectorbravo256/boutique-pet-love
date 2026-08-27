global.WebSocket = require("ws");

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  try {
    // ============================================================
    // 1. LEER WEBHOOK DE MERCADO PAGO
    // ============================================================

    const body = event.body
      ? JSON.parse(event.body)
      : {};

    console.log("WEBHOOK BODY:", body);

    // Solo procesamos notificaciones de pagos
    if (body.type !== "payment") {
      return {
        statusCode: 200,
        body: "ok",
      };
    }

    // ============================================================
    // 2. OBTENER PAYMENT ID
    // ============================================================

    const paymentId =
      body.data?.id ||
      body.resource;

    if (!paymentId) {
      console.log("No paymentId");

      return {
        statusCode: 200,
        body: "ok",
      };
    }

    // ============================================================
    // 3. CONECTAR CON SUPABASE
    // ============================================================

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          enabled: false,
        },
      }
    );

    // ============================================================
    // 4. CONSULTAR EL PAGO DIRECTAMENTE EN MERCADO PAGO
    // ============================================================

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await response.json();

    if (!response.ok) {
      console.log("ERROR MP:", payment);

      return {
        statusCode: 500,
        body: "Error Mercado Pago",
      };
    }

    console.log("PAYMENT:", payment);

    // ============================================================
    // 5. VERIFICAR METADATA
    // ============================================================

    if (
      !payment.metadata ||
      !payment.metadata.order_data
    ) {
      console.log("No metadata");

      return {
        statusCode: 200,
        body: "ok",
      };
    }

    // ============================================================
    // 6. SOLO PROCESAR PAGOS APROBADOS
    // ============================================================

    if (payment.status !== "approved") {
      console.log(
        "PAYMENT NO APROBADO:",
        payment.status
      );

      return {
        statusCode: 200,
        body: "ok",
      };
    }

    console.log(
      "PAYMENT APROBADO:",
      payment.id
    );

    // ============================================================
    // 7. OBTENER ORDER_DATA
    // ============================================================

    let orderData;

    try {
      orderData =
        typeof payment.metadata.order_data === "string"
          ? JSON.parse(payment.metadata.order_data)
          : payment.metadata.order_data;
    } catch (parseError) {
      console.log(
        "ERROR PARSEANDO order_data:",
        parseError
      );

      return {
        statusCode: 500,
        body: "Error leyendo order_data",
      };
    }

    if (
      !orderData ||
      typeof orderData !== "object"
    ) {
      console.log("order_data inválido");

      return {
        statusCode: 500,
        body: "order_data inválido",
      };
    }

    const items = Array.isArray(orderData.items)
      ? orderData.items
      : [];

    const formData =
      orderData.form_data || {};

    if (items.length === 0) {
      console.log(
        "La venta no contiene productos"
      );

      return {
        statusCode: 500,
        body: "Venta sin productos",
      };
    }

    // ============================================================
    // 8. CONFIRMAR VENTA MEDIANTE LA RPC TRANSACCIONAL
    //
    // IMPORTANTE:
    // Desde este punto webhook.js NO:
    //
    // ❌ inserta directamente en orders
    // ❌ modifica product_variants.stock
    // ❌ llama descontar-stock
    // ❌ llama descontar_stock()
    // ❌ inserta inventory_movements
    //
    // Todo eso lo realiza confirmar_venta_online()
    // ============================================================

    const {
      data: rpcData,
      error: rpcError,
    } = await supabase.rpc(
      "confirmar_venta_online",
      {
        p_payment_id: String(payment.id),
        p_order_data: orderData,
      }
    );

    if (rpcError) {
      console.log(
        "ERROR RPC confirmar_venta_online:",
        rpcError
      );

      return {
        statusCode: 500,
        body: "Error confirmando venta",
      };
    }

    console.log(
      "RESULTADO confirmar_venta_online:",
      rpcData
    );

    // ============================================================
    // 9. VALIDAR RESPUESTA DE LA RPC
    // ============================================================

    if (
      !Array.isArray(rpcData) ||
      rpcData.length === 0
    ) {
      console.log(
        "La RPC no devolvió resultado"
      );

      return {
        statusCode: 500,
        body: "RPC sin resultado",
      };
    }

    const result = rpcData[0];

    const orderId = result.order_id;
    const numeroVenta = result.numero_venta;
    const finalTotal = Number(result.total || 0);
    const alreadyProcessed =
      result.already_processed === true;

    console.log(
      "ORDER ID:",
      orderId
    );

    console.log(
      "NUMERO VENTA:",
      numeroVenta
    );

    console.log(
      "TOTAL FINAL:",
      finalTotal
    );

    console.log(
      "ALREADY PROCESSED:",
      alreadyProcessed
    );

    // ============================================================
    // 10. IDEMPOTENCIA
    //
    // Si Mercado Pago vuelve a enviar exactamente el mismo pago,
    // la RPC devuelve already_processed = true.
    //
    // En ese caso NO enviamos nuevamente el correo.
    // ============================================================

    if (alreadyProcessed) {
      console.log(
        "VENTA YA PROCESADA:",
        payment.id
      );

      return {
        statusCode: 200,
        body: "already processed",
      };
    }

    // ============================================================
    // 11. CALCULAR INFORMACIÓN SOLO PARA EL CORREO
    //
    // IMPORTANTE:
    // El total oficial NO se obtiene de aquí.
    //
    // El total oficial es result.total entregado por la RPC.
    //
    // Este cálculo solamente permite mostrar el shipping
    // de manera informativa en el correo.
    // ============================================================

    const productosSubtotal = items.reduce(
      (sum, item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 1);

        return sum + price * qty;
      },
      0
    );

    const shipping =
      Math.max(
        0,
        finalTotal - productosSubtotal
      );

    // ============================================================
    // 12. CONFIGURAR CORREO
    // ============================================================

    const transporter =
      nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    // ============================================================
    // 13. CONSTRUIR LISTA DE PRODUCTOS
    // ============================================================

    const productosHTML = items
      .map(
        (item) => `
          <li>
            ${item.name || "Producto"}
            (${item.size || ""})
            x${item.qty || 1}
            - $${Number(item.price || 0).toLocaleString(
              "es-CL"
            )}
          </li>
        `
      )
      .join("");

    // ============================================================
    // 14. HTML DEL CORREO
    // ============================================================

    const html = `
      <h2>🐾 Nueva compra confirmada</h2>

      <h3>Información del cliente</h3>

      <p>
        <strong>Nombre:</strong>
        ${formData.nombre || ""}
      </p>

      <p>
        <strong>RUT:</strong>
        ${formData.rut || ""}
      </p>

      <p>
        <strong>Correo:</strong>
        ${formData.correo || ""}
      </p>

      <p>
        <strong>Teléfono:</strong>
        ${formData.telefono || ""}
      </p>

      <p>
        <strong>Dirección:</strong>
        ${formData.direccion || ""}
      </p>

      <p>
        <strong>Comuna:</strong>
        ${formData.comuna || ""}
      </p>

      <p>
        <strong>Región:</strong>
        ${formData.region || ""}
      </p>

      <p>
        <strong>Observación:</strong>
        ${formData.observacion || "Sin observaciones"}
      </p>

      <h3>Productos</h3>

      <ul>
        ${productosHTML}
      </ul>

      ${
        shipping > 0
          ? `
            <p>
              <strong>Envío:</strong>
              $${shipping.toLocaleString("es-CL")}
            </p>
          `
          : ""
      }

      <h2>
        Total:
        $${finalTotal.toLocaleString("es-CL")}
      </h2>

      <p>
        <strong>Número de venta:</strong>
        ${numeroVenta || ""}
      </p>

      <p>
        <strong>ID de pago Mercado Pago:</strong>
        ${payment.id}
      </p>
    `;

    // ============================================================
    // 15. ENVIAR CORREO
    // ============================================================

    try {
      await transporter.sendMail({
        from:
          `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,

        to:
          `${formData.correo || ""}, ventas@boutiquepetlove.cl`,

        subject:
          "Compra confirmada 🐾",

        html,
      });

      console.log(
        "EMAIL ENVIADO"
      );

    } catch (emailError) {
      // El pago y la venta YA fueron confirmados.
      // Un error de correo no debe revertir la venta.

      console.log(
        "ERROR EMAIL:",
        emailError
      );
    }

    // ============================================================
    // 16. RESPUESTA FINAL
    // ============================================================

    return {
      statusCode: 200,
      body: "ok",
    };

  } catch (error) {
    // ============================================================
    // ERROR GENERAL
    // ============================================================

    console.log(
      "WEBHOOK ERROR:",
      error
    );

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};

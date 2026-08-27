global.WebSocket = require("ws");

const {
  obtenerPagoMercadoPago,
} = require("./webhook/mercadoPago");

const {
  confirmarVenta,
} = require("./webhook/confirmarVenta");

const {
  generarPDF,
} = require("./webhook/generarPDF");

const {
  enviarCorreo,
} = require("./webhook/enviarCorreo");

exports.handler = async (event) => {
  try {
    // ============================================================
    // 1. LEER WEBHOOK
    // ============================================================

    const body = event.body
      ? JSON.parse(event.body)
      : {};

    console.log("WEBHOOK BODY:", body);

    // Solo procesamos notificaciones de pago
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
    // 3. CONSULTAR MERCADO PAGO
    // ============================================================

    const payment =
      await obtenerPagoMercadoPago(
        paymentId
      );

    if (!payment) {
      return {
        statusCode: 500,
        body: "Error consultando Mercado Pago",
      };
    }

    // ============================================================
    // 4. VALIDAR METADATA
    // ============================================================

    if (
      !payment.metadata ||
      !payment.metadata.order_data
    ) {
      console.log(
        "Pago sin metadata.order_data"
      );

      return {
        statusCode: 200,
        body: "ok",
      };
    }

    // ============================================================
    // 5. SOLO PAGOS APROBADOS
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
    // 6. PARSEAR ORDER DATA
    // ============================================================

    let orderData;

    try {
      orderData =
        typeof payment.metadata.order_data === "string"
          ? JSON.parse(
              payment.metadata.order_data
            )
          : payment.metadata.order_data;
    } catch (error) {
      console.log(
        "ERROR PARSEANDO order_data:",
        error
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
      return {
        statusCode: 500,
        body: "order_data inválido",
      };
    }

    const items =
      Array.isArray(orderData.items)
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
    // 7. CONFIRMAR VENTA EN SUPABASE
    // ============================================================

    const result =
      await confirmarVenta({
        paymentId: payment.id,
        orderData,
      });

    if (!result.success) {
      return {
        statusCode: 500,
        body: "Error confirmando venta",
      };
    }

    console.log(
      "RESULTADO RPC:",
      result
    );

    // ============================================================
    // 8. IDEMPOTENCIA
    // ============================================================

    if (result.alreadyProcessed) {
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
    // 9. GENERAR PDF
    // ============================================================

    let pdfBuffer;

    try {
      pdfBuffer =
        await generarPDF({
          numeroVenta:
            result.numeroVenta,

          paymentId:
            payment.id,

          formData,

          items,

          finalTotal:
            result.finalTotal,
        });

      console.log(
        "PDF GENERADO CORRECTAMENTE"
      );

    } catch (error) {
      console.log(
        "ERROR GENERANDO PDF:",
        error
      );

      // La venta ya está confirmada.
      // No se revierte stock ni order.

      return {
        statusCode: 200,
        body:
          "venta confirmada - error generando PDF",
      };
    }

    // ============================================================
    // 10. ENVIAR CORREO
    // ============================================================

    try {
      await enviarCorreo({
        numeroVenta:
          result.numeroVenta,

        payment,

        formData,

        items,

        finalTotal:
          result.finalTotal,

        pdfBuffer,
      });

      console.log(
        "EMAIL + PDF ENVIADOS CORRECTAMENTE"
      );

    } catch (error) {
      console.log(
        "ERROR EMAIL + PDF:",
        error
      );

      // La venta permanece confirmada.
    }

    // ============================================================
    // 11. RESPUESTA FINAL
    // ============================================================

    return {
      statusCode: 200,
      body: "ok",
    };

  } catch (error) {

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

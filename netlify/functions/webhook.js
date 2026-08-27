global.WebSocket = require("ws");

const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
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
    // 3. SUPABASE
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
    // 4. CONSULTAR PAGO EN MERCADO PAGO
    // ============================================================

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization:
            `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
    // 6. SOLO PAGOS APROBADOS
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
    // 7. ORDER DATA
    // ============================================================

    let orderData;

    try {
      orderData =
        typeof payment.metadata.order_data === "string"
          ? JSON.parse(
              payment.metadata.order_data
            )
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
    // 8. CONFIRMAR VENTA MEDIANTE RPC
    // ============================================================

    const {
      data: rpcData,
      error: rpcError,
    } = await supabase.rpc(
      "confirmar_venta_online",
      {
        p_payment_id:
          String(payment.id),

        p_order_data:
          orderData,
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
    // 9. VALIDAR RESULTADO RPC
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

    const orderId =
      result.order_id;

    const numeroVenta =
      result.numero_venta;

    const finalTotal =
      Number(result.total || 0);

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
    // 11. CALCULAR SUBTOTAL Y SHIPPING
    //     SOLO PARA PRESENTACIÓN
    // ============================================================

    const productosSubtotal =
      items.reduce(
        (sum, item) => {

          const price =
            Number(item.price || 0);

          const qty =
            Number(item.qty || 1);

          return (
            sum +
            price * qty
          );
        },
        0
      );

    const shipping =
      Math.max(
        0,
        finalTotal -
          productosSubtotal
      );

    // ============================================================
    // 12. CONFIGURAR TRANSPORTER
    // ============================================================

    const transporter =
      nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,

        auth: {
          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASS,
        },
      });

    // ============================================================
    // 13. FUNCIONES AUXILIARES
    // ============================================================

    const money = (value) =>
      Number(value || 0).toLocaleString(
        "es-CL"
      );

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // ============================================================
    // 14. PRODUCTOS HTML
    // ============================================================

    const productosHTML =
      items
        .map((item) => {

          const price =
            Number(item.price || 0);

          const qty =
            Number(item.qty || 1);

          return `
            <tr>
              <td style="
                padding:12px 8px;
                border-bottom:1px solid #eee;
              ">
                <strong>
                  ${escapeHtml(
                    item.name ||
                    "Producto"
                  )}
                </strong>
                <br>
                <span style="
                  color:#777;
                  font-size:13px;
                ">
                  Talla:
                  ${escapeHtml(
                    item.size || "-"
                  )}
                </span>
              </td>

              <td style="
                padding:12px 8px;
                text-align:center;
                border-bottom:1px solid #eee;
              ">
                ${qty}
              </td>

              <td style="
                padding:12px 8px;
                text-align:right;
                border-bottom:1px solid #eee;
              ">
                $${money(price)}
              </td>

              <td style="
                padding:12px 8px;
                text-align:right;
                border-bottom:1px solid #eee;
              ">
                $${money(
                  price * qty
                )}
              </td>
            </tr>
          `;
        })
        .join("");

    // ============================================================
    // 15. CORREO PROFESIONAL
    // ============================================================

    const customerName =
      escapeHtml(
        formData.nombre ||
        "Cliente"
      );

    const html = `
<!DOCTYPE html>

<html lang="es">

<head>
  <meta charset="UTF-8">

  <meta name="viewport"
        content="width=device-width,
                 initial-scale=1.0">
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f5f5;
  font-family:Arial,
               Helvetica,
               sans-serif;
  color:#333;
">

  <div style="
    max-width:680px;
    margin:30px auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:
      0 3px 15px
      rgba(0,0,0,0.08);
  ">

    <!-- ENCABEZADO -->

    <div style="
      padding:30px;
      text-align:center;
      background:#ffffff;
      border-bottom:1px solid #eee;
    ">

      <div style="
        font-size:28px;
        font-weight:bold;
        letter-spacing:0.5px;
      ">
        🐾 Boutique Pet Love
      </div>

      <div style="
        margin-top:6px;
        color:#888;
        font-size:14px;
      ">
        Moda y accesorios para mascotas
      </div>

    </div>


    <!-- CONTENIDO -->

    <div style="
      padding:30px;
    ">

      <h1 style="
        margin-top:0;
        font-size:23px;
      ">
        ¡Compra confirmada!
      </h1>

      <p style="
        font-size:16px;
        line-height:1.6;
      ">
        Hola
        <strong>
          ${customerName}
        </strong>,
      </p>

      <p style="
        font-size:15px;
        line-height:1.6;
        color:#555;
      ">
        Hemos recibido y confirmado
        correctamente tu pago.
        Muchas gracias por comprar
        en Boutique Pet Love.
      </p>


      <!-- RESUMEN PEDIDO -->

      <div style="
        margin:25px 0;
        padding:18px;
        background:#fafafa;
        border-radius:8px;
      ">

        <div style="
          font-size:14px;
          color:#777;
        ">
          Número de venta
        </div>

        <div style="
          margin-top:5px;
          font-size:20px;
          font-weight:bold;
        ">
          ORD-${numeroVenta}
        </div>

        <div style="
          margin-top:12px;
          font-size:14px;
          color:#777;
        ">
          ID Mercado Pago
        </div>

        <div style="
          margin-top:4px;
          font-size:13px;
        ">
          ${escapeHtml(
            payment.id
          )}
        </div>

      </div>


      <!-- PRODUCTOS -->

      <h2 style="
        font-size:18px;
        margin-bottom:12px;
      ">
        Detalle de tu compra
      </h2>

      <table width="100%"
             cellpadding="0"
             cellspacing="0"
             style="
               border-collapse:collapse;
               font-size:14px;
             ">

        <thead>

          <tr style="
            background:#f7f7f7;
          ">

            <th style="
              padding:10px 8px;
              text-align:left;
            ">
              Producto
            </th>

            <th style="
              padding:10px 8px;
              text-align:center;
            ">
              Cant.
            </th>

            <th style="
              padding:10px 8px;
              text-align:right;
            ">
              Precio
            </th>

            <th style="
              padding:10px 8px;
              text-align:right;
            ">
              Total
            </th>

          </tr>

        </thead>

        <tbody>
          ${productosHTML}
        </tbody>

      </table>


      <!-- TOTALES -->

      <div style="
        margin-top:20px;
        border-top:1px solid #ddd;
        padding-top:15px;
      ">

        <table width="100%"
               style="
                 font-size:15px;
               ">

          <tr>
            <td style="
              padding:5px 0;
            ">
              Subtotal productos
            </td>

            <td style="
              text-align:right;
            ">
              $${money(
                productosSubtotal
              )}
            </td>
          </tr>

          <tr>
            <td style="
              padding:5px 0;
            ">
              Envío
            </td>

            <td style="
              text-align:right;
            ">
              $${money(
                shipping
              )}
            </td>
          </tr>

          <tr>
            <td style="
              padding-top:12px;
              font-size:19px;
              font-weight:bold;
            ">
              Total pagado
            </td>

            <td style="
              padding-top:12px;
              text-align:right;
              font-size:19px;
              font-weight:bold;
            ">
              $${money(
                finalTotal
              )}
            </td>
          </tr>

        </table>

      </div>


      <!-- DESPACHO -->

      <h2 style="
        margin-top:30px;
        font-size:18px;
      ">
        Datos de despacho
      </h2>

      <div style="
        padding:15px;
        background:#fafafa;
        border-radius:8px;
        font-size:14px;
        line-height:1.7;
      ">

        <strong>
          ${escapeHtml(
            formData.nombre || ""
          )}
        </strong>
        <br>

        ${escapeHtml(
          formData.direccion || ""
        )}
        <br>

        ${escapeHtml(
          formData.comuna || ""
        )}
        <br>

        ${escapeHtml(
          formData.region || ""
        )}

        ${
          formData.telefono
            ? `
              <br>
              Teléfono:
              ${escapeHtml(
                formData.telefono
              )}
            `
            : ""
        }

      </div>


      <!-- PDF -->

      <div style="
        margin-top:25px;
        padding:15px;
        background:#f7f7f7;
        border-radius:8px;
        text-align:center;
        color:#555;
        font-size:14px;
      ">
        Adjuntamos a este correo
        el comprobante PDF de tu compra.
      </div>


      <p style="
        margin-top:30px;
        line-height:1.6;
        color:#555;
      ">
        Gracias por confiar en
        <strong>
          Boutique Pet Love
        </strong>.
        🐾
      </p>

    </div>


    <!-- PIE -->

    <div style="
      padding:20px 30px;
      background:#fafafa;
      text-align:center;
      color:#888;
      font-size:12px;
    ">

      Boutique Pet Love<br>
      Gracias por preferirnos.

    </div>

  </div>

</body>

</html>
`;

    // ============================================================
    // 16. GENERAR PDF
    // ============================================================

    const generatePDF =
      () =>
        new Promise(
          (resolve, reject) => {

            const doc =
              new PDFDocument({
                size: "A4",
                margin: 50,
                info: {
                  Title:
                    `Comprobante Boutique Pet Love - ORD-${numeroVenta}`,

                  Author:
                    "Boutique Pet Love",

                  Subject:
                    "Comprobante de compra",
                },
              });

            const chunks = [];

            doc.on(
              "data",
              (chunk) =>
                chunks.push(chunk)
            );

            doc.on(
              "end",
              () => {

                const pdfBuffer =
                  Buffer.concat(
                    chunks
                  );

                resolve(
                  pdfBuffer
                );
              }
            );

            doc.on(
              "error",
              reject
            );


            // ----------------------------------------------------
            // ENCABEZADO
            // ----------------------------------------------------

            doc
              .fontSize(22)
              .font("Helvetica-Bold")
              .text(
                "Boutique Pet Love",
                {
                  align:"center",
                }
              );

            doc
              .moveDown(0.3)
              .fontSize(11)
              .font("Helvetica")
              .text(
                "Comprobante de compra",
                {
                  align:"center",
                }
              );

            doc
              .moveDown(1);

            doc
              .moveTo(50, doc.y)
              .lineTo(
                545,
                doc.y
              )
              .stroke();

            doc
              .moveDown(1);


            // ----------------------------------------------------
            // INFORMACIÓN DE VENTA
            // ----------------------------------------------------

            doc
              .fontSize(12)
              .font("Helvetica-Bold")
              .text(
                `Orden: ORD-${numeroVenta}`
              );

            doc
              .fontSize(10)
              .font("Helvetica")
              .text(
                `ID Mercado Pago: ${payment.id}`
              );

            doc
              .text(
                `Estado: Pago aprobado`
              );

            doc
              .moveDown(1);


            // ----------------------------------------------------
            // CLIENTE
            // ----------------------------------------------------

            doc
              .fontSize(13)
              .font("Helvetica-Bold")
              .text(
                "Datos del cliente"
              );

            doc
              .moveDown(0.4)
              .fontSize(10)
              .font("Helvetica");

            doc.text(
              `Nombre: ${
                formData.nombre || "-"
              }`
            );

            doc.text(
              `RUT: ${
                formData.rut || "-"
              }`
            );

            doc.text(
              `Correo: ${
                formData.correo || "-"
              }`
            );

            doc.text(
              `Teléfono: ${
                formData.telefono || "-"
              }`
            );

            doc.text(
              `Dirección: ${
                formData.direccion || "-"
              }`
            );

            doc.text(
              `Comuna: ${
                formData.comuna || "-"
              }`
            );

            doc.text(
              `Región: ${
                formData.region || "-"
              }`
            );

            doc
              .moveDown(1);


            // ----------------------------------------------------
            // PRODUCTOS
            // ----------------------------------------------------

            doc
              .fontSize(13)
              .font("Helvetica-Bold")
              .text(
                "Detalle de la compra"
              );

            doc
              .moveDown(0.5);


            items.forEach(
              (item, index) => {

                const price =
                  Number(
                    item.price || 0
                  );

                const qty =
                  Number(
                    item.qty || 1
                  );

                doc
                  .fontSize(10)
                  .font(
                    "Helvetica-Bold"
                  )
                  .text(
                    `${index + 1}. ${
                      item.name ||
                      "Producto"
                    }`
                  );

                doc
                  .font(
                    "Helvetica"
                  )
                  .text(
                    `   Talla: ${
                      item.size || "-"
                    }`
                  );

                doc
                  .text(
                    `   Cantidad: ${qty}`
                  );

                doc
                  .text(
                    `   Precio unitario: $${money(
                      price
                    )}`
                  );

                doc
                  .text(
                    `   Total: $${money(
                      price * qty
                    )}`
                  );

                doc
                  .moveDown(0.5);
              }
            );


            // ----------------------------------------------------
            // TOTALES
            // ----------------------------------------------------

            doc
              .moveDown(0.5)
              .moveTo(
                50,
                doc.y
              )
              .lineTo(
                545,
                doc.y
              )
              .stroke();

            doc
              .moveDown(0.8)
              .fontSize(11)
              .font("Helvetica");

            doc.text(
              `Subtotal productos: $${money(
                productosSubtotal
              )}`,
              {
                align:"right",
              }
            );

            doc.text(
              `Envío: $${money(
                shipping
              )}`,
              {
                align:"right",
              }
            );

            doc
              .moveDown(0.3)
              .fontSize(15)
              .font(
                "Helvetica-Bold"
              )
              .text(
                `TOTAL PAGADO: $${money(
                  finalTotal
                )}`,
                {
                  align:"right",
                }
              );


            // ----------------------------------------------------
            // OBSERVACIONES
            // ----------------------------------------------------

            if (
              formData.observacion
            ) {

              doc
                .moveDown(1)
                .fontSize(11)
                .font(
                  "Helvetica-Bold"
                )
                .text(
                  "Observaciones"
                );

              doc
                .moveDown(0.3)
                .fontSize(10)
                .font(
                  "Helvetica"
                )
                .text(
                  formData.observacion
                );
            }


            // ----------------------------------------------------
            // PIE
            // ----------------------------------------------------

            doc
              .moveDown(2)
              .fontSize(9)
              .font("Helvetica")
              .fillColor("#666666")
              .text(
                "Boutique Pet Love",
                {
                  align:"center",
                }
              );

            doc
              .text(
                "Gracias por preferirnos.",
                {
                  align:"center",
                }
              );

            doc.end();
          }
        );

    // ============================================================
    // 17. GENERAR PDF
    // ============================================================

    let pdfBuffer;

    try {

      pdfBuffer =
        await generatePDF();

      console.log(
        "PDF GENERADO CORRECTAMENTE"
      );

    } catch (pdfError) {

      console.log(
        "ERROR GENERANDO PDF:",
        pdfError
      );

      // La venta YA está confirmada.
      // No revertimos nada.

      return {
        statusCode: 200,
        body: "venta confirmada - error generando PDF",
      };
    }

    // ============================================================
    // 18. DESTINATARIOS
    // ============================================================

    const recipients = [];

    if (formData.correo) {
      recipients.push(
        formData.correo
      );
    }

    recipients.push(
      "ventas@boutiquepetlove.cl"
    );

    // Eliminar duplicados
    const uniqueRecipients =
      [
        ...new Set(
          recipients.filter(Boolean)
        ),
      ];

    // ============================================================
    // 19. ENVIAR CORREO + PDF
    // ============================================================

    try {

      await transporter.sendMail({

        from:
          `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,

        to:
          uniqueRecipients.join(", "),

        subject:
          `Compra confirmada — ORD-${numeroVenta}`,

        html,

        attachments: [
          {
            filename:
              `Comprobante_Boutique_Pet_Love_ORD-${numeroVenta}.pdf`,

            content:
              pdfBuffer,

            contentType:
              "application/pdf",
          },
        ],
      });

      console.log(
        "EMAIL + PDF ENVIADOS:",
        uniqueRecipients
      );

    } catch (emailError) {

      // ========================================================
      // IMPORTANTE:
      //
      // La venta ya fue confirmada.
      // El error de correo NO revierte:
      //
      // - orders
      // - stock
      // - inventory_movements
      // ========================================================

      console.log(
        "ERROR EMAIL + PDF:",
        emailError
      );
    }

    // ============================================================
    // 20. RESPUESTA FINAL
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
        error:
          error.message,
      }),
    };
  }
};

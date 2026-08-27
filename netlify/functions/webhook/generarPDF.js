const PDFDocument =
  require("pdfkit");

const {
  money,
} = require("../utils/formato");

const generarPDF = ({
  numeroVenta,
  paymentId,
  formData,
  items,
  finalTotal,
}) =>
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
        () =>
          resolve(
            Buffer.concat(chunks)
          )
      );

      doc.on(
        "error",
        reject
      );

      // ==========================================================
      // ENCABEZADO
      // ==========================================================

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(
          "Boutique Pet Love",
          {
            align: "center",
          }
        );

      doc
        .moveDown(0.3)
        .fontSize(11)
        .font("Helvetica")
        .text(
          "Comprobante de compra",
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown();

      // ==========================================================
      // ORDEN
      // ==========================================================

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
          `ID Mercado Pago: ${paymentId}`
        )
        .text(
          "Estado: Pago aprobado"
        );

      doc.moveDown();

      // ==========================================================
      // CLIENTE
      // ==========================================================

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(
          "Datos del cliente"
        );

      doc
        .moveDown(0.4)
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Nombre: ${formData.nombre || "-"}`
        )
        .text(
          `RUT: ${formData.rut || "-"}`
        )
        .text(
          `Correo: ${formData.correo || "-"}`
        )
        .text(
          `Teléfono: ${formData.telefono || "-"}`
        )
        .text(
          `Dirección: ${formData.direccion || "-"}`
        )
        .text(
          `Comuna: ${formData.comuna || "-"}`
        )
        .text(
          `Región: ${formData.region || "-"}`
        );

      doc.moveDown();

      // ==========================================================
      // PRODUCTOS
      // ==========================================================

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(
          "Detalle de la compra"
        );

      doc.moveDown(0.5);

      let productosSubtotal = 0;

      items.forEach(
        (item, index) => {

          const price =
            Number(item.price || 0);

          const qty =
            Number(item.qty || 1);

          const itemTotal =
            price * qty;

          productosSubtotal +=
            itemTotal;

          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(
              `${index + 1}. ${
                item.name ||
                "Producto"
              }`
            );

          doc
            .font("Helvetica")
            .text(
              `   Talla: ${
                item.size || "-"
              }`
            )
            .text(
              `   Cantidad: ${qty}`
            )
            .text(
              `   Precio unitario: $${money(price)}`
            )
            .text(
              `   Total: $${money(itemTotal)}`
            );

          doc.moveDown(0.5);
        }
      );

      // ==========================================================
      // SHIPPING
      // ==========================================================

      const shipping =
        Math.max(
          0,
          Number(finalTotal) -
            productosSubtotal
        );

      doc
        .moveDown(0.5)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
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
          align: "right",
        }
      );

      doc.text(
        `Envío: $${money(
          shipping
        )}`,
        {
          align: "right",
        }
      );

      doc
        .moveDown(0.3)
        .fontSize(15)
        .font("Helvetica-Bold")
        .text(
          `TOTAL PAGADO: $${money(
            finalTotal
          )}`,
          {
            align: "right",
          }
        );

      // ==========================================================
      // OBSERVACIONES
      // ==========================================================

      if (
        formData.observacion
      ) {

        doc
          .moveDown(1)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(
            "Observaciones"
          );

        doc
          .moveDown(0.3)
          .fontSize(10)
          .font("Helvetica")
          .text(
            formData.observacion
          );
      }

      // ==========================================================
      // PIE
      // ==========================================================

      doc
        .moveDown(2)
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#666666")
        .text(
          "Boutique Pet Love",
          {
            align: "center",
          }
        );

      doc.text(
        "Gracias por preferirnos.",
        {
          align: "center",
        }
      );

      doc.end();
    }
  );

module.exports = {
  generarPDF,
};

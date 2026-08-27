const nodemailer =
  require("nodemailer");

const {
  crearEmailHTML,
} = require("./emailTemplate");

const enviarCorreo = async ({
  numeroVenta,
  payment,
  formData,
  items,
  finalTotal,
  pdfBuffer,
}) => {

  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {

    throw new Error(
      "EMAIL_USER o EMAIL_PASS no configurados"
    );
  }

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

  const html =
    crearEmailHTML({
      numeroVenta,
      payment,
      formData,
      items,
      finalTotal,
    });

  const mailOptions = {
    from:
      `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,

    // Correo principal de la tienda
    to:
      "ventas@boutiquepetlove.cl",

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
  };

  // ============================================================
  // CLIENTE EN BCC / CCO
  // ============================================================

  const customerEmail =
    String(
      formData.correo || ""
    )
      .trim()
      .toLowerCase();

  const storeEmail =
    "ventas@boutiquepetlove.cl";

  if (
    customerEmail &&
    customerEmail !==
      storeEmail.toLowerCase()
  ) {

    mailOptions.bcc =
      customerEmail;
  }

  await transporter.sendMail(
    mailOptions
  );

  console.log(
    "EMAIL ENVIADO CORRECTAMENTE"
  );

  console.log(
    "TO:",
    storeEmail
  );

  console.log(
    "BCC:",
    customerEmail ||
      "No informado"
  );
};

module.exports = {
  enviarCorreo,
};

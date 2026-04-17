const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const { items, formData, total } = data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const productosHTML = items
      .map(
        (i) =>
          `<li>${i.name} (${i.size}) x${i.qty || 1} - $${i.price}</li>`
      )
      .join("");

    const html = `
      <h2>Nuevo Pedido 🐾</h2>
      <p><strong>Nombre:</strong> ${formData.nombre}</p>
      <p><strong>Correo:</strong> ${formData.correo}</p>
      <p><strong>Teléfono:</strong> ${formData.telefono}</p>
      <p><strong>Dirección:</strong> ${formData.direccion}</p>
      <p><strong>Comuna:</strong> ${formData.comuna}</p>
      <p><strong>Región:</strong> ${formData.region}</p>

      <h3>Productos:</h3>
      <ul>${productosHTML}</ul>

      <h3>Total: $${total}</h3>
    `;

    await transporter.sendMail({
      from: `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,
      to: `${formData.correo}, contabilidadagenciarebolledo@gmail.com`,
      subject: "Confirmación de compra 🐾",
      html,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
    };
  }
};
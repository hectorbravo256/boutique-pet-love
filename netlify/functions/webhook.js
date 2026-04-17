const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (body.type !== "payment") {
      return { statusCode: 200, body: "ok" };
    }

    const paymentId = body.data.id;

    // 🔐 CONSULTAR PAGO REAL
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const payment = await res.json();

    // ✅ SOLO SI ESTÁ APROBADO
    if (payment.status === "approved") {

      const { items, formData, total } = payment.metadata;

      // 📧 CONFIG EMAIL
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
        <h2>🐾 Nueva compra confirmada</h2>

        <h3>Cliente</h3>
        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Correo:</strong> ${formData.correo}</p>
        <p><strong>Teléfono:</strong> ${formData.telefono}</p>
        <p><strong>Dirección:</strong> ${formData.direccion}</p>
        <p><strong>Comuna:</strong> ${formData.comuna}</p>
        <p><strong>Región:</strong> ${formData.region}</p>

        <h3>Productos</h3>
        <ul>${productosHTML}</ul>

        <h3>Total: $${total}</h3>
      `;

      await transporter.sendMail({
        from: `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,
        to: `${formData.correo}, contabilidadagenciarebolledo@gmail.com`,
        subject: "Compra confirmada 🐾",
        html,
      });
    }

    return {
      statusCode: 200,
      body: "ok",
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
    };
  }
};
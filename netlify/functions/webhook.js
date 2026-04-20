const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    console.log("WEBHOOK BODY:", body);

  if (body.type !== "payment" && body.topic !== "merchant_order") {
  return { statusCode: 200, body: "ok" };
}

    const paymentId =
  body.data?.id ||
  (body.resource ? body.resource.split("/").pop() : null);

if (!paymentId) {
  console.log("No paymentId");
  return { statusCode: 200 };
}

    // 🔐 CONSULTAR PAGO REAL
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const payment = await res.json();

console.log("STATUS DEL PAGO:", payment.status);

console.log("METADATA COMPLETA:", payment.metadata);


// ✅ VALIDACIÓN PRO (AQUÍ VA)
if (!payment.metadata || !payment.metadata.items) {
  console.log("No hay metadata");
  return { statusCode: 200, body: "ok" };
}

    // ✅ SOLO SI ESTÁ APROBADO
    if (payment.status === "approved" || payment.status === "authorized") {

const { items, form_data, total } = payment.metadata;
const formData = form_data;

await fetch("https://fluffy-daifuku-56b90b.netlify.app/.netlify/functions/save-order", {
  method: "POST",
  body: JSON.stringify({
    items,
    formData,
    total,
    date: new Date(),
  }),
});

      // 📧 CONFIG EMAIL
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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

try {
  await transporter.sendMail({
    from: `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,
    to: `${formData.correo}, contabilidadagenciarebolledo@gmail.com`,
    subject: "Compra confirmada 🐾",
    html,
  });

  console.log("EMAIL ENVIADO OK");
} catch (error) {
  console.log("ERROR AL ENVIAR EMAIL:", error);
}
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
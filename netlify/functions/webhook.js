global.WebSocket = require("ws");

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  try {

    const body = event.body
      ? JSON.parse(event.body)
      : {};

    console.log("WEBHOOK BODY:", body);

    if (
      body.type !== "payment" &&
      body.topic !== "merchant_order"
    ) {
      return {
        statusCode: 200,
        body: "ok",
      };
    }

    const paymentId =
      body.data?.id ||
      (body.resource
        ? body.resource.split("/").pop()
        : null);

    if (!paymentId) {
      console.log("No paymentId");

      return {
        statusCode: 200,
        body: "ok",
      };
    }

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

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await response.json();

    console.log("PAYMENT:", payment);

    if (
      !payment.metadata ||
      !payment.metadata.items
    ) {
      console.log("No metadata");

      return {
        statusCode: 200,
        body: "ok",
      };
    }

    if (
      payment.status === "approved" ||
      payment.status === "authorized"
    ) {

const {
  items,
  form_data,
  total,
} = payment.metadata;

const formData = form_data;

      const { error } = await supabase
        .from("orders")
        .insert([
          {
            nombre: formData.nombre,
            rut: formData.rut,
            correo: formData.correo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            comuna: formData.comuna,
            region: formData.region,
            observacion: formData.observacion,
            items,
            total,
          },
        ]);

      if (error) {
        console.log("SUPABASE ERROR:", error);
      } else {
        console.log("PEDIDO GUARDADO");
      }

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

      const productosHTML = items
        .map(
          (i) =>
            `<li>${i.name} (${i.size}) x${i.qty || 1} - $${i.price}</li>`
        )
        .join("");

      const html = `
        <h2>🐾 Nueva compra confirmada</h2>

        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Correo:</strong> ${formData.correo}</p>
        <p><strong>Total:</strong> $${total}</p>

        <h3>Productos</h3>

        <ul>${productosHTML}</ul>
      `;

      try {

        await transporter.sendMail({
          from: `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,

          to:
            `${formData.correo}, contabilidadagenciarebolledo@gmail.com`,

          subject:
            "Compra confirmada 🐾",

          html,
        });

        console.log("EMAIL ENVIADO");

      } catch (emailError) {

        console.log(
          "ERROR EMAIL:",
          emailError
        );
      }
    }

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

import mercadopago from "mercadopago";
import nodemailer from "nodemailer";

export const handler = async (event) => {
  const body = JSON.parse(event.body);

  if (body.type === "payment") {
    const payment = await mercadopago.payment.findById(body.data.id);

    if (payment.body.status === "approved") {

      const cliente = payment.body.metadata.cliente;

      // CONFIG CORREO
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "TU_CORREO@gmail.com",
          pass: "TU_PASSWORD_APP",
        },
      });

      await transporter.sendMail({
        from: "Tienda",
        to: "hectorbravov@hotmail.es",
        subject: "Nueva compra",
        text: `
Cliente: ${cliente.nombre}
RUT: ${cliente.rut}
Dirección: ${cliente.direccion}
Comuna: ${cliente.comuna}
Región: ${cliente.region}
Observación: ${cliente.observacion}
        `,
      });
    }
  }

  return { statusCode: 200 };
};
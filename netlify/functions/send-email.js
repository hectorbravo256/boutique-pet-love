const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {

    // 👇 SI NO VIENE BODY (prueba manual)
    let data = {};
    if (event.body) {
      data = JSON.parse(event.body);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Boutique Pet Love" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // te lo envía a ti mismo
      subject: "Prueba de correo 🐾",
      html: "<h2>Correo funcionando correctamente 🚀</h2>",
    });

    return {
      statusCode: 200,
      body: "Correo enviado correctamente",
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
    };
  }
};
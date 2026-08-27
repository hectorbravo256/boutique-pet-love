const obtenerPagoMercadoPago = async (
  paymentId
) => {

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization:
          `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    }
  );

  const payment =
    await response.json();

  if (!response.ok) {

    console.log(
      "ERROR MERCADO PAGO:",
      payment
    );

    throw new Error(
      "Error consultando Mercado Pago"
    );
  }

  console.log(
    "PAYMENT:",
    payment
  );

  return payment;
};

module.exports = {
  obtenerPagoMercadoPago,
};

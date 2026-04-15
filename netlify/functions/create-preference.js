import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.items || body.items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No hay items" }),
      };
    }

  
    const items = body.items.map((item) => ({
  title: item.name,
  unit_price: Number(item.price),
  quantity: 1,
  currency_id: "CLP",
}));

// ✅ Agregar envío si hay productos
if (items.length > 0) {
  items.push({
    title: "Costo de envío",
    unit_price: 3500,
    quantity: 1,
    currency_id: "CLP",
  });
}

  const preference = new Preference(client);

    const response = await preference.create({
  body: {
	items: items,

	// ✅ Guardar datos del cliente
    metadata: {
      cliente: body.formData,
    },
  },
});

    return {
      statusCode: 200,
      body: JSON.stringify({
        init_point: response.init_point,
      }),
    };
  } catch (error) {
    console.log("ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
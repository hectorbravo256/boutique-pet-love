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
      id: item.id,
  title: item.name,
  unit_price: Number(item.price),
  quantity: item.qty || 1,
  currency_id: "CLP",
}));


// ✅ AQUÍ PEGAS ESTO
const regionesConEnvio = [
  "Región Metropolitana de Santiago",
  "Región de Valparaíso",
  "Región del Libertador General Bernardo O'Higgins",
];

if (regionesConEnvio.includes(body.formData.region)) {
  items.push({
    title: "Costo de envío",
    unit_price: 3500,
    quantity: 1,
    currency_id: "CLP",
  });
}

  const preference = new Preference(client);

    const total = body.items.reduce(
  (acc, i) => acc + i.price * (i.qty || 1),
  0
);

const response = await preference.create({
  body: {
    items: items,

metadata: {
  items: body.items.map((item) => ({
    id: item.id,
    name: item.name,
    size: item.size,
    qty: item.qty || 1,
    price: item.price,
  })),

  form_data: body.formData,

  total: total,
},

    notification_url:
      "https://boutiquepetlove.cl/.netlify/functions/webhook",

    back_urls: {
      success: "https://boutiquepetlove.cl/success",
      failure: "https://boutiquepetlove.cl/failure",
      pending: "https://boutiquepetlove.cl/pending",
    },

    auto_return: "approved",

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

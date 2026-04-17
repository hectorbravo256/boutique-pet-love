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
      items: body.items,
      formData: body.formData,
      total: total,
    },

    notification_url:
      "https://fluffy-daifuku-56b90b.netlify.app/.netlify/functions/webhook",

    back_urls: {
      success: "https://fluffy-daifuku-56b90b.netlify.app/success",
      failure: "https://fluffy-daifuku-56b90b.netlify.app/failure",
      pending: "https://fluffy-daifuku-56b90b.netlify.app/pending",
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
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
      quantity: item.qty || 1,
      currency_id: "CLP",
    }));

    // Regiones con costo de envío de $3.500
    const regionesConEnvio = [
      "Región Metropolitana de Santiago",
      "Región de Valparaíso",
      "Región del Libertador General Bernardo O'Higgins",
    ];

    // Un único cálculo de envío para Mercado Pago y metadata.order_data.
    const shipping = regionesConEnvio.includes(body.formData?.region)
      ? 3500
      : 0;

    if (shipping > 0) {
      items.push({
        title: "Costo de envío",
        unit_price: shipping,
        quantity: 1,
        currency_id: "CLP",
      });
    }

    const productsTotal = body.items.reduce(
      (acc, i) => acc + Number(i.price) * (i.qty || 1),
      0
    );

    // Total real de la venta: productos + envío.
    const total = productsTotal + shipping;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items,

        metadata: {
          order_data: JSON.stringify({
            items: body.items.map((item) => ({
              // id mantiene compatibilidad con el formato anterior.
              id: item.id,

              // El id del carrito corresponde realmente a la variante.
              variant_id: item.id,

              // Producto padre.
              product_id: item.product_id,

              name: item.name,
              size: item.size,
              qty: item.qty || 1,
              price: item.price,
            })),

            form_data: body.formData,

            // Costo de envío explícito.
            shipping,

            // Productos + envío.
            total,
          }),
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

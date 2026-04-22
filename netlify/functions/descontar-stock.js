const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  const { product_id, size, qty } = JSON.parse(event.body);

  const { error } = await supabase.rpc("descontar_stock", {
    p_id: product_id,
    p_size: size,
    cantidad: qty,
  });

  if (error) {
    console.log("ERROR:", error);
    return {
      statusCode: 500,
      body: "Error",
    };
  }

  return {
    statusCode: 200,
    body: "Stock actualizado",
  };
};
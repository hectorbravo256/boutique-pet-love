global.WebSocket = require("ws");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  try {
    const { id, estado } = JSON.parse(event.body);
    if (!id || !estado) {
  return {
    statusCode: 400,
    body: "Datos incompletos",
  };
}

    const { error } = await supabase
      .from("orders")
      .update({
  estado,
  updated_at: new Date(),
})
      .eq("id", id);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};

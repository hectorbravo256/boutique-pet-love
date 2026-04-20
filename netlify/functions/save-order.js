const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const { formData, items, total } = data;

    const { error } = await supabase.from("orders").insert([
      {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        comuna: formData.comuna,
        region: formData.region,
        items,
        total,
      },
    ]);

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
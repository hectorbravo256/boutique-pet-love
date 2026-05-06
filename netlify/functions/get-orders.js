const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      enabled: false,
    },
  }
);

exports.handler = async () => {

  try {

    // 🔥 validar variables
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_KEY
    ) {

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Faltan variables de entorno Supabase"
        }),
      };
    }

    // 🔥 obtener pedidos
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    // 🔥 error Supabase
    if (error) {

      console.error("Supabase error:", error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message
        }),
      };
    }

    // ✅ éxito
    return {
      statusCode: 200,
      body: JSON.stringify(
        Array.isArray(data)
          ? data
          : []
      ),
    };

  } catch (err) {

    console.error("Function crash:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Error interno servidor"
      }),
    };
  }
};

global.WebSocket = require("ws");

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

    const { data, error } =
      await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {

      console.log(
        "SUPABASE ERROR:",
        error
      );

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      };
    }

    // 🔥 sanitizar pedidos
    const safeData =
      (Array.isArray(data)
        ? data
        : []
      ).map((o) => ({

        ...o,

        items:
          Array.isArray(o.items)
            ? o.items
            : [],

        total:
          Number.isFinite(
            Number(o.total)
          )
            ? Number(o.total)
            : 0,

        estado:
          typeof o.estado ===
          "string"

            ? o.estado.toLowerCase()

            : "pendiente",

        nombre:
          o.nombre || "",

        correo:
          o.correo || "",

        created_at:
          o.created_at || null,

      }));

    return {
      statusCode: 200,

      body: JSON.stringify(
        safeData
      ),
    };

  } catch (err) {

    console.log(
      "FUNCTION ERROR:",
      err
    );

    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          err.message ||
          "Error interno",
      }),
    };
  }
};

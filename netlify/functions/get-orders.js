const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
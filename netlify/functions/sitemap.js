import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: {
      enabled: false
    }
  }
);

export async function handler() {

  try {

    const { data, error } = await supabase
      .from("products")
      .select("slug")
      .eq("active", true);

    if (error) {
      throw error;
    }

    let urls = `
<url>
  <loc>https://boutiquepetlove.cl/</loc>
</url>
`;

    data.forEach(product => {

      if (!product.slug) return;

      urls += `
<url>
  <loc>
    https://boutiquepetlove.cl/producto/${product.slug}
  </loc>
</url>
`;

    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml"
      },
      body: xml
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: err.message
    };

  }

}

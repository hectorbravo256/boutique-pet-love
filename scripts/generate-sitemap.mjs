import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

const SITE_URL = "https://boutiquepetlove.cl";

async function generateSitemap() {

  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const urls = [
    `
<url>
  <loc>${SITE_URL}</loc>
</url>`
  ];

  data.forEach(product => {

    if (!product.slug) return;

    urls.push(`
<url>
  <loc>${SITE_URL}/producto/${product.slug}</loc>
</url>`);

  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.join("\n")}

</urlset>`;

  fs.writeFileSync(
    "./public/sitemap.xml",
    sitemap
  );

  console.log("✅ Sitemap generado");

}

generateSitemap();

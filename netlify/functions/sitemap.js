const site = "https://boutiquepetlove.cl";
const escapeXml = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
export function buildSitemap(products, categories) {
  const paths = new Set(["/", "/politicas-de-despachos-cambios-y-devoluciones"]);
  for (const [rows, prefix] of [[products,"/producto/"],[categories,"/categoria/"]]) {
    for (const row of rows) {
      if (row.active !== true || typeof row.slug !== "string" || !row.slug.trim() || /[\\/?#\s]/u.test(row.slug) || [".",".."].includes(row.slug)) continue;
      paths.add(prefix + encodeURIComponent(row.slug));
    }
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...paths].sort().map(p => "  <url><loc>" + escapeXml(site+p) + "</loc></url>").join("\n") + "\n</urlset>";
}
export async function handler(event) {
  if (!["GET","HEAD"].includes(event.httpMethod)) return {statusCode:405,headers:{Allow:"GET, HEAD"},body:"Method not allowed"};
  try {
    const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    const key = (process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
    if (!url || !key) throw new Error("Missing configuration");
    const headers = {apikey:key};
    if (key.startsWith("eyJ")) headers.Authorization = "Bearer "+key;
    async function load(table) {
      const endpoint = new URL("/rest/v1/"+table,url);
      if (endpoint.protocol !== "https:") throw new Error("Invalid URL");
      const rows=[];
      for(let offset=0;;) {
        endpoint.search = new URLSearchParams({select:"id,slug,active",active:"eq.true",order:"id.asc",offset:String(offset),limit:"100"}).toString();
        const response=await fetch(endpoint,{headers,signal:AbortSignal.timeout(8000)});
        if(!response.ok) throw new Error("Catalog request failed");
        const data=await response.json();
        if(!Array.isArray(data)) throw new Error("Invalid catalog response");
        if(!data.length) break;
        rows.push(...data);
        offset+=data.length;
        if(offset>50000) throw new Error("Catalog limit exceeded");
      }
      return rows;
    }
    const [products,categories]=await Promise.all([load("products"),load("categories")]);
    return {statusCode:200,headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=300"},body:event.httpMethod==="HEAD"?"":buildSitemap(products,categories)};
  } catch {
    return {statusCode:503,headers:{"Cache-Control":"no-store"},body:"Sitemap temporarily unavailable"};
  }
}

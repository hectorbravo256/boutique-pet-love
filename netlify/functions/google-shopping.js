

const site = "https://boutiquepetlove.cl";
const esc = value => String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const tag = (name, value) => "<g:" + name + ">" + esc(value) + "</g:" + name + ">";
const validImage = value => { try { return new URL(value).protocol === "https:"; } catch { return false; } };
export function buildFeed(products, now = new Date()) {
  const local = new Intl.DateTimeFormat("sv-SE", {timeZone:"America/Santiago", year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).format(now).replace(" ","T");
  const items = [];
  for (const p of products) {
    if (!p.active || !p.slug || !p.name) continue;
    const images = [...(p.product_images || [])].sort((a,b)=>(a.sort_order ?? 0)-(b.sort_order ?? 0)).map(i=>i.url).filter(validImage);
    if (!images.length) continue;
    const percent = Number(p.discount_percent);
    const discount = p.discount_active && percent > 0 && percent < 100 && (!p.discount_start || local >= p.discount_start.replace(" ","T").slice(0,19)) && (!p.discount_end || local <= p.discount_end.replace(" ","T").slice(0,19));
    for (const v of p.product_variants || []) {
      const price = Number(v.price);
      if (!Number.isInteger(price) || price <= 0 || v.id == null || !String(v.size ?? "").trim()) continue;
      const sale = Math.round(price * (1-percent/100));
      const link = site + "/producto/" + encodeURIComponent(p.slug) + "?variant=" + encodeURIComponent(v.id);
      const fields = {id:"bpl-"+v.id,item_group_id:"bpl-product-"+p.id,title:(p.name+" - Talla "+v.size).slice(0,150),description:String(p.description || p.meta_description || p.name).replace(/<[^>]*>/g," ").slice(0,5000),link,image_link:images[0],condition:"new",availability:Number(v.stock)>0?"in_stock":"out_of_stock",price:price+" CLP",size:v.size,product_type:"Mascotas > Ropa y accesorios > "+(p.category || "Otros")};
      if (discount && sale > 0 && sale < price) fields.sale_price = sale+" CLP";
      items.push("<item>"+Object.entries(fields).map(([k,val])=>tag(k,val)).join("")+images.slice(1,11).map(i=>tag("additional_image_link",i)).join("")+"</item>");
    }
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Boutique Pet Love</title><link>'+site+'</link><description>Catálogo de productos</description>'+items.join("\n")+'</channel></rss>';
}
export async function handler(event) {
  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") return {statusCode:405,body:"Method not allowed"};
  let stage = "configuration";
  try {
    const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    const key = (process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
    if (!url || !key) throw new Error("Missing catalog configuration");
    stage = "client";
    const endpoint = new URL("/rest/v1/products", url);
    if (endpoint.protocol !== "https:") throw new Error("Invalid catalog URL");
    stage = "query";
    const products = [];
    for (let offset=0;;offset+=100) {
      endpoint.search = new URLSearchParams({select:"id,name,description,meta_description,category,slug,active,discount_active,discount_percent,discount_start,discount_end,product_variants(id,size,price,stock),product_images(url,sort_order)",active:"eq.true",order:"id.asc",offset:String(offset),limit:"100"}).toString();
      const headers = {apikey:key};
      if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key;
      const response = await fetch(endpoint, {headers, signal:AbortSignal.timeout(15000)});
      if (!response.ok) { stage = "query-http-" + response.status; throw new Error("Catalog request failed"); }
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid catalog response");
      products.push(...data);
      if (data.length<100) break;
    }
    stage = "render";
    const body=buildFeed(products);
    if (!body.includes("<item>")) { stage = "empty"; throw new Error("Empty catalog"); }
    return {statusCode:200,headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=300"},body:event.httpMethod==="HEAD"?"":body};
  } catch (error) {
    console.error("Google Shopping feed:",error.message);
    return {statusCode:503,headers:{"Cache-Control":"no-store"},body:"Catalog temporarily unavailable" + ((event.headers?.host || "").startsWith("deploy-preview-3--fluffy-daifuku-56b90b.netlify.app") ? " [" + stage + (typeof error.code === "string" && /^(?:[0-9A-Z]{5}|PGRST[0-9]{3})$/.test(error.code) ? ":" + error.code : "") + "]" : "")};
  }
}

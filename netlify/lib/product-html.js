import {buildProductSchema,categorySlug} from "../../src/productSchema.js";
const site="https://boutiquepetlove.cl";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const json=v=>JSON.stringify(v).replace(/</g,"\\u003c");
export async function fetchPublicProduct(path,env,fetcher=fetch){
 const match=/^\/producto\/([^/]+)\/?$/i.exec(path);
 if(!match)return {status:404};
 let slug;try{slug=decodeURIComponent(match[1]);}catch{return {status:404};}
 if(!slug||/[\\/\s]/u.test(slug))return {status:404};
 try{
 const base=(env("VITE_SUPABASE_URL")||env("SUPABASE_URL")||"").trim();
 const key=(env("VITE_SUPABASE_KEY")||env("SUPABASE_ANON_KEY")||env("VITE_SUPABASE_ANON_KEY")||"").trim();
 const url=new URL("/rest/v1/products",base);
 if(url.protocol!=="https:"||!key)return {status:503};
 url.search=new URLSearchParams({select:"id,name,slug,active,category,description,meta_title,meta_description,discount_active,discount_percent,discount_start,discount_end,product_variants(id,size,price,stock),product_images(url,sort_order)",slug:"eq."+slug,active:"eq.true",limit:"2","product_images.order":"sort_order.asc"});
 const headers={apikey:key};if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
 const res=await fetcher(url,{headers,signal:AbortSignal.timeout(2500)});
 if(!res.ok)return {status:503};
 const rows=await res.json();
 if(!Array.isArray(rows)||rows.length>1)return {status:503};
 return rows.length?{status:200,product:rows[0]}:{status:404};
 }catch{return {status:503};}
}
export function renderProductHtml(html,p,requestedVariant,now=new Date()){
 const schema=buildProductSchema(p,now);
 if(!schema||!html.includes('<div id="root"></div>'))return null;
 const title=p.meta_title||p.name+" | Boutique Pet Love";
 const description=p.meta_description||p.description||"Moda premium para mascotas";
 const url=site+"/producto/"+p.slug;
 const image=schema.image[0];
 const chosen=schema.hasVariant.find(v=>v.sku==="bpl-"+requestedVariant)||schema.hasVariant.find(v=>v.offers.availability.endsWith("/InStock"))||schema.hasVariant[0];
 const breadcrumbs={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{ "@type":"ListItem",position:1,name:"Inicio",item:site},{ "@type":"ListItem",position:2,name:p.category,item:site+"/categoria/"+categorySlug(p.category)},{ "@type":"ListItem",position:3,name:p.name,item:url}]};
 const meta=(key,value,property=false)=>'<meta data-rh="true" '+(property?'property':'name')+'="'+key+'" content="'+esc(value)+'">';
 const head='<title>'+esc(title)+'</title>'+meta("description",description)+'<link data-rh="true" rel="canonical" href="'+esc(url)+'">'+meta("og:title",title,true)+meta("og:description",description,true)+meta("og:image",image,true)+meta("og:url",url,true)+meta("og:type","product",true)+meta("twitter:card","summary_large_image")+meta("twitter:title",title)+meta("twitter:description",description)+meta("twitter:image",image)+'<script data-rh="true" type="application/ld+json">'+json(schema)+'</script><script data-rh="true" type="application/ld+json">'+json(breadcrumbs)+'</script>';
 const body='<div id="root"><main style="max-width:960px;margin:32px auto;padding:20px;font-family:system-ui"><nav><a href="/">Inicio</a> / <a href="/categoria/'+esc(categorySlug(p.category))+'">'+esc(p.category)+'</a></nav><h1>'+esc(p.name)+'</h1><img width="350" style="max-width:100%;height:auto" src="'+esc(image)+'" alt="'+esc(p.name)+'"><p>'+esc(p.description||description)+'</p><p>Talla '+esc(chosen.size)+' · $'+chosen.offers.price.toLocaleString("es-CL")+' CLP · '+(chosen.offers.availability.endsWith("/InStock")?"Disponible":"Agotado")+'</p><h2>Tallas disponibles</h2><ul>'+schema.hasVariant.map(v=>'<li><a href="'+esc(v.offers.url)+'">Talla '+esc(v.size)+'</a> · $'+v.offers.price.toLocaleString("es-CL")+' CLP · '+(v.offers.availability.endsWith("/InStock")?"Disponible":"Agotado")+'</li>').join("")+'</ul></main></div>';
 return html.replace(/<title>[\s\S]*?<\/title>/i,"").replace(/<meta\b[^>]*data-rh="true"[^>]*>/gi,"").replace("</head>",()=>head+"</head>").replace('<div id="root"></div>',()=>body+'<script id="bpl-product-seed" type="application/json">'+json(p)+'</script>');
}

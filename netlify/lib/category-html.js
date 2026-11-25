const site="https://boutiquepetlove.cl";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const json=v=>JSON.stringify(v).replace(/</g,"\\u003c");
const valid=s=>typeof s==="string"&&s.length>0&&!/[\\/\s?#]/u.test(s)&&s!=="."&&s!=="..";
const image=s=>{try{const u=new URL(s);return u.protocol==="https:"?u.href:"/placeholder.png";}catch{return "/placeholder.png";}};
export function categorySeo(c,products){
 const name=c.slug.replaceAll("-"," ").replace(/\b\w/g,l=>l.toUpperCase());
 const title=c.seo_title||name+" para Perros | Boutique Pet Love";
 const description=c.seo_description||"Descubre nuestra colección "+name+" para perros. Diseños premium, máxima comodidad y envíos a todo Chile.";
 const url=site+"/categoria/"+encodeURIComponent(c.slug);
 return {title,description,url,collection:{"@context":"https://schema.org","@type":"CollectionPage",name:title,description,url},list:{"@context":"https://schema.org","@type":"ItemList",itemListElement:products.map((p,i)=>({"@type":"ListItem",position:i+1,url:site+"/producto/"+encodeURIComponent(p.slug),name:p.name}))},breadcrumbs:{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Inicio",item:site+"/"},{"@type":"ListItem",position:2,name:c.name,item:url}]}};
}
export async function fetchCategory(path,env,fetcher=fetch){
 const m=/^\/categoria\/([^/]+)\/?$/i.exec(path);if(!m)return {status:404};
 let slug;try{slug=decodeURIComponent(m[1]);}catch{return {status:404};}if(!valid(slug))return {status:404};
 try{
 const base=(env("VITE_SUPABASE_URL")||env("SUPABASE_URL")||"").trim(),key=(env("VITE_SUPABASE_KEY")||env("SUPABASE_ANON_KEY")||env("VITE_SUPABASE_ANON_KEY")||"").trim();
 const url=new URL("/rest/v1/categories",base);if(url.protocol!=="https:"||!key)return {status:503};
 const headers={apikey:key};if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
 const get=async(u)=>{const r=await fetcher(u,{headers,signal:AbortSignal.timeout(2500)});if(!r.ok)throw Error("upstream");const a=await r.json();if(!Array.isArray(a))throw Error("invalid");return a;};
 url.search=new URLSearchParams({select:"id,name,slug,active,image,seo_title,seo_description,seo_text",slug:"eq."+slug,active:"eq.true",limit:"2"});
 const cats=await get(url);if(!cats.length)return {status:404};if(cats.length!==1)return {status:503};
 const c=cats[0];const purl=new URL("/rest/v1/products",base);
 const quote=s=>'"'+String(s).replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"';
 const products=[];for(let offset=0;;){purl.search=new URLSearchParams({select:"id,name,slug,active,category,discount_active,discount_percent,product_images(url,sort_order),product_variants(price)",category:"in.("+[c.slug,c.name].map(quote).join(",")+")",active:"eq.true",order:"id.asc","product_images.order":"sort_order.asc",limit:"100",offset:String(offset)});const rows=await get(purl);if(!rows.length)break;products.push(...rows);offset+=rows.length;if(offset>50000)throw Error("limit");if(rows.length<100)break;}
 return {status:200,category:{...c,image:c.image?image(c.image):null},products:products.filter(p=>p.active===true&&valid(p.slug)).map(p=>({...p,product_images:(p.product_images||[]).map(i=>({...i,url:image(i.url)}))}))};
 }catch{return {status:503};}
}
export function renderCategoryHtml(html,c,products,{seo=categorySeo(c,products),seedId="bpl-category-seed"}={}){
 if(!html.includes('<div id="root"></div>'))return null;
 const s=seo,img=c.image||site+"/logo-google.webp";
 const meta=(key,value,prop=false)=>'<meta data-rh="true" '+(prop?"property":"name")+'="'+key+'" content="'+esc(value)+'">';
 const head='<title>'+esc(s.title)+'</title>'+meta("description",s.description)+'<link data-rh="true" rel="canonical" href="'+esc(s.url)+'">'+meta("og:title",s.title,true)+meta("og:description",s.description,true)+meta("og:image",img,true)+meta("og:url",s.url,true)+meta("og:type","website",true)+meta("twitter:card","summary_large_image")+meta("twitter:title",s.title)+meta("twitter:description",s.description)+meta("twitter:image",img)+[s.collection,s.list,s.breadcrumbs].map(v=>'<script data-rh="true" type="application/ld+json">'+json(v)+'</script>').join("");
 const cards=products.map(p=>'<a class="block bg-white rounded-2xl overflow-hidden p-4" href="/producto/'+esc(encodeURIComponent(p.slug))+'"><img loading="lazy" width="450" height="450" class="w-full aspect-square object-cover" src="'+esc(image(p.product_images?.[0]?.url))+'" alt="'+esc(p.name)+'"><h2 class="font-black text-gray-800">'+esc(p.name)+'</h2><span>Ver producto</span></a>').join("");
 const body='<div id="root"><main class="px-4 md:px-8 py-8 bg-pink-50 min-h-screen"><h1 class="text-2xl md:text-4xl font-black text-pink-600 mb-8 tracking-wide">'+esc(c.name)+'</h1><div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">'+cards+'</div>'+(c.seo_text?'<p class="mt-16 whitespace-pre-line">'+esc(c.seo_text)+'</p>':'')+'</main></div><script id="'+esc(seedId)+'" type="application/json">'+json({category:c,products})+'</script>';
 return html.replace(/<title>[\s\S]*?<\/title>/i,"").replace(/<meta\b[^>]*data-rh="true"[^>]*>/gi,"").replace("</head>",()=>head+"</head>").replace('<div id="root"></div>',()=>body);
}

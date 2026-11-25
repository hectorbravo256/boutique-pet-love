const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validSlug=s=>typeof s==="string"&&s.length>0&&!/[\\/\s?#]/u.test(s)&&s!=="."&&s!=="..";
const imageUrl=s=>{try{const u=new URL(s);return u.protocol==="https:"?u.href:"/placeholder.png";}catch{return "/placeholder.png";}};
export async function fetchHomeCategories(env,fetcher=fetch){
 try{
 const base=(env("VITE_SUPABASE_URL")||env("SUPABASE_URL")||"").trim();
 const key=(env("VITE_SUPABASE_KEY")||env("SUPABASE_ANON_KEY")||env("VITE_SUPABASE_ANON_KEY")||"").trim();
 const url=new URL("/rest/v1/categories",base);
 if(url.protocol!=="https:"||!key)return null;
 url.search=new URLSearchParams({select:"id,name,slug,active,featured_image,image,sort_order",active:"eq.true",order:"sort_order.asc,id.asc"});
 const headers={apikey:key};if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
 const res=await fetcher(url,{headers,signal:AbortSignal.timeout(2500)});
 if(!res.ok)return null;
 const rows=await res.json();return Array.isArray(rows)?rows:null;
 }catch{return null;}
}
export function renderHomeHtml(html,categories){
 if(!html.includes('<div id="root"></div>'))return null;
 const rows=(categories||[]).filter(c=>c.active===true&&validSlug(c.slug)&&c.name).map(c=>({id:c.id,active:true,name:c.name,slug:c.slug,featured_image:imageUrl(c.featured_image||c.image),image:null,sort_order:c.sort_order}));
 const cards=rows.map(c=>'<a class="group rounded-3xl overflow-hidden bg-white shadow-sm" href="/categoria/'+esc(encodeURIComponent(c.slug))+'"><img loading="lazy" width="280" height="350" style="width:100%;aspect-ratio:4/5;object-fit:cover" src="'+esc(imageUrl(c.featured_image||c.image))+'" alt="'+esc("Colección "+c.name+" de Boutique Pet Love")+'"><div class="p-4 text-center font-black text-gray-800 text-lg bg-white">'+esc(c.name)+'</div></a>').join("");
 const body='<div id="root"><div class="bg-pink-50 min-h-screen"><section id="catalogo" class="p-6"><div class="mb-6"><h1 class="text-3xl font-bold">Ropa para perros y mascotas en Chile</h1><p class="text-gray-700 mt-1">Explora nuestra tienda online de abrigos, vestidos, disfraces y ropa para ocasiones especiales. Encuentra la talla adecuada para tu mascota y recibe tu pedido en Chile.</p></div><div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">'+cards+'</div></section></div></div>';
 const seed=categories===null?"":'<script id="bpl-home-categories" type="application/json">'+JSON.stringify(rows).replace(/</g,"\\u003c")+'</script>';
 return html.replace("</head>",()=>'<link data-rh="true" rel="canonical" href="https://boutiquepetlove.cl/"></head>').replace('<div id="root"></div>',()=>body+seed);
}

import {renderCategoryHtml,categorySeo} from "./category-html.js";
export const genders={macho:"Ropa para perros machos",hembra:"Ropa para perritas",unisex:"Ropa unisex para mascotas"};
export const validGender=s=>Object.hasOwn(genders,s);
export function genderSeo(slug,products){
 const name=genders[slug],description="Explora "+name.toLowerCase()+" en Boutique Pet Love. Consulta los modelos y tallas del catálogo online con envíos a Chile.";
 const s=categorySeo({slug,name,seo_title:name+" | Boutique Pet Love",seo_description:description},products);
 const url="https://boutiquepetlove.cl/genero/"+slug;
 return {...s,url,collection:{...s.collection,url},breadcrumbs:{...s.breadcrumbs,itemListElement:[s.breadcrumbs.itemListElement[0],{...s.breadcrumbs.itemListElement[1],item:url}]}};
}
export async function fetchGender(path,env,fetcher=fetch){
 const m=/^\/genero\/([^/]+)\/?$/.exec(path);
 if(!m||!validGender(m[1]))return {status:404};
 const slug=m[1];
 try{
 const base=(env("VITE_SUPABASE_URL")||env("SUPABASE_URL")||"").trim(),key=(env("VITE_SUPABASE_KEY")||env("SUPABASE_ANON_KEY")||env("VITE_SUPABASE_ANON_KEY")||"").trim();
 const url=new URL("/rest/v1/products",base);if(url.protocol!=="https:"||!key)return {status:503};
 const headers={apikey:key};if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
 const products=[];
 for(let offset=0;;){
 url.search=new URLSearchParams({select:"id,name,slug,active,gender,product_images(url,sort_order),product_variants(price)",active:"eq.true",gender:"eq."+slug,order:"id.asc","product_images.order":"sort_order.asc",limit:"100",offset:String(offset)});
 const res=await fetcher(url,{headers,signal:AbortSignal.timeout(2500)});if(!res.ok)return {status:503};
 const rows=await res.json();if(!Array.isArray(rows))return {status:503};
 products.push(...rows.filter(p=>p.active===true&&p.gender===slug&&typeof p.slug==="string"&&p.slug.length&&!/[\\/\s?#]/u.test(p.slug)&&p.slug!=="."&&p.slug!==".."));
 if(rows.length<100)break;offset+=rows.length;if(offset>50000)return {status:503};
 }
 return {status:200,slug,products};
 }catch{return {status:503};}
}
export function renderGenderHtml(html,slug,products){
 const seo=genderSeo(slug,products);
 return renderCategoryHtml(html,{slug,name:genders[slug],seo_text:seo.description},products,{seo,seedId:"bpl-gender-seed"});
}

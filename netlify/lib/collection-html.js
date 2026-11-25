import {categorySeo,renderCategoryHtml} from "./category-html.js";
export const collections={
 "new":{field:"new_collection",name:"Novedades de ropa para mascotas"},
 "best-seller":{field:"best_seller",name:"Ropa para mascotas más vendida"},
 luxury:{field:"luxury",name:"Colección Luxury para mascotas"},
 exclusive:{field:"exclusive",name:"Ropa exclusiva para mascotas"}
};
export const validCollection=s=>Object.hasOwn(collections,s);
export function collectionSeo(slug,products){
 const name=collections[slug].name;
 const description=products.length?"Explora "+name.toLowerCase()+" en Boutique Pet Love. Consulta los modelos y tallas disponibles en nuestra tienda online.":"Actualmente esta colección no tiene productos publicados. Explora el catálogo de Boutique Pet Love.";
 const s=categorySeo({slug,name,seo_title:name+" | Boutique Pet Love",seo_description:description},products);
 const url="https://boutiquepetlove.cl/coleccion/"+slug;
 return {...s,url,collection:{...s.collection,url},breadcrumbs:{...s.breadcrumbs,itemListElement:[s.breadcrumbs.itemListElement[0],{...s.breadcrumbs.itemListElement[1],item:url}]}};
}
export async function fetchCollection(path,env,fetcher=fetch){
 const m=/^\/coleccion\/([^/]+)\/?$/.exec(path);
 if(!m||!validCollection(m[1]))return {status:404};
 const slug=m[1],field=collections[slug].field;
 try{
 const base=(env("VITE_SUPABASE_URL")||env("SUPABASE_URL")||"").trim(),key=(env("VITE_SUPABASE_KEY")||env("SUPABASE_ANON_KEY")||"").trim();
 const url=new URL("/rest/v1/products",base);if(url.protocol!=="https:"||!key)return {status:503};
 const headers={apikey:key};if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
 const products=[];
 for(let offset=0;;){
 url.search=new URLSearchParams({select:"id,name,slug,active,"+field+",product_images(url,sort_order),product_variants(price)",active:"eq.true",[field]:"eq.true",order:"id.asc","product_images.order":"sort_order.asc",limit:"100",offset:String(offset)});
 const res=await fetcher(url,{headers,signal:AbortSignal.timeout(2500)});if(!res.ok)return {status:503};
 const rows=await res.json();if(!Array.isArray(rows))return {status:503};
 products.push(...rows.filter(p=>p.active===true&&p[field]===true&&typeof p.slug==="string"&&p.slug.length&&!/[\\/\s?#]/u.test(p.slug)&&p.slug!=="."&&p.slug!==".."));
 if(rows.length<100)break;offset+=rows.length;if(offset>50000)return {status:503};
 }
 return {status:200,slug,products};
 }catch{return {status:503};}
}
export function renderCollectionHtml(html,slug,products){
 const seo=collectionSeo(slug,products);
 const out=renderCategoryHtml(html,{slug,name:collections[slug].name,seo_text:seo.description},products,{seo,seedId:"bpl-collection-seed"});
 return out&&!products.length?out.replace("</head>",'<meta data-rh="true" name="robots" content="noindex, follow"></head>'):out;
}

const site = "https://boutiquepetlove.cl";
export function categorySlug(value) {
 return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().replace(/\s*-\s*/g,"-").replace(/\s+/g,"-");
}
export function activeDiscount(p, now = new Date()) {
 const local = new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).format(now).replace(" ","T");
 const percent=Number(p.discount_percent);
 return Boolean(p.discount_active && percent>0 && percent<100 && (!p.discount_start || local>=p.discount_start.replace(" ","T").slice(0,19)) && (!p.discount_end || local<=p.discount_end.replace(" ","T").slice(0,19)));
}
export function buildProductSchema(p, now = new Date()) {
 const url=site+"/producto/"+encodeURIComponent(p.slug);
 const images=[...(p.product_images||[])].sort((a,b)=>(a.sort_order??0)-(b.sort_order??0)).map(i=>i.url).filter(u=>{try{return new URL(u).protocol==="https:";}catch{return false;}});
 const description=String(p.description||p.meta_description||p.name).replace(/<[^>]*>/g," ").trim();
 const groupId="bpl-product-"+p.id;
 const variants=[];
 if(!p.active || !p.name || !p.slug || p.id==null || !images.length)return null;
 for(const v of p.product_variants||[]){
 const price=Number(v.price),size=String(v.size??"").trim().replace(/^talla\s+/i,"");
 if(!Number.isInteger(price)||price<=0||v.id==null||!size)continue;
 const sale=Math.round(price*(1-Number(p.discount_percent)/100));
 const effective=activeDiscount(p,now)&&sale>0&&sale<price?sale:price;
 const link=url+"?variant="+encodeURIComponent(v.id);
 variants.push({"@type":"Product","@id":link+"#product",name:p.name+" - Talla "+size,description,image:images,size,sku:"bpl-"+v.id,offers:{"@type":"Offer",url:link,price:effective,priceCurrency:"CLP",availability:Number(v.stock)>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",itemCondition:"https://schema.org/NewCondition",seller:{"@id":site+"/#store"},hasMerchantReturnPolicy:{"@id":site+"/#return-policy"}}});
 }
 if(!variants.length)return null;
 return {"@context":"https://schema.org","@type":"ProductGroup","@id":url+"#group",url,name:p.name,description,image:images,productGroupID:groupId,variesBy:["https://schema.org/size"],hasVariant:variants};
}

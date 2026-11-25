import test from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright";
test("missing routes and route-specific robots directives",async()=>{
 const browser=await chromium.launch();
 try {
 const page=await browser.newPage();
 await page.route("**/*",async route=>{
 const u=new URL(route.request().url());
 if(u.origin==="http://127.0.0.1:4173") return route.continue();
 if(route.request().method()==="OPTIONS") return route.fulfill({status:204,headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET, OPTIONS","access-control-allow-headers":"*"}});
 if(u.pathname.startsWith("/rest/v1/")) {
 const single=Boolean(u.searchParams.get("slug"));
 return route.fulfill({status:single?406:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(single?{code:"PGRST116",message:"No rows"}:[])});
 }
 return route.abort();
 });
 for(const path of ["/ruta-inexistente","/producto/inexistente","/categoria/inexistente","/genero/inexistente","/coleccion/inexistente"]){
 await page.goto("http://127.0.0.1:4173"+path);
 await page.getByRole("heading",{name:"Página no encontrada",exact:true}).waitFor();
 await page.waitForFunction(()=>document.querySelector('meta[name="robots"]')?.content==="noindex, follow");
 assert.equal(await page.getByRole("link",{name:"Volver al inicio"}).getAttribute("href"),"/");
 }
 await page.goto("http://127.0.0.1:4173/login");
 await page.waitForFunction(()=>document.querySelector('meta[name="robots"]')?.content==="noindex, nofollow");
 await page.goto("http://127.0.0.1:4173/");
 await page.getByRole("heading",{level:1,name:"Ropa para perros y mascotas en Chile",exact:true}).waitFor();
 assert.equal(await page.locator("h1").count(),1);
 assert.equal(await page.title(),"Ropa para Perros y Mascotas en Chile | Boutique Pet Love");
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),"https://boutiquepetlove.cl/");
 assert.equal(await page.locator('meta[name="description"]').count(),1);
 assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),"Descubre ropa para perros y mascotas: abrigos, vestidos, disfraces y prendas para ocasiones especiales. Compra online en Boutique Pet Love con envíos a todo Chile.");
 await page.waitForFunction(()=>!document.querySelector('meta[name="robots"]')?.content.includes("noindex"));
 } finally {await browser.close();}
});

test("initial home and product payloads avoid duplicate client reads",async()=>{
 const browser=await chromium.launch();
 try{
 const page=await browser.newPage();
 const origin="http://127.0.0.1:4173";
 const category={id:1,active:true,name:"Navidad",slug:"navidad",sort_order:1};
 const product={id:1,active:true,name:"Abrigo prueba",slug:"abrigo",category:"Navidad",description:"Prueba",product_images:[{url:"https://example.invalid/a.webp",sort_order:0}],product_variants:[{id:1,size:"0",price:8490,stock:2}]};
 let categories=0,products=0;
 await page.route("**/*",async route=>{
 const u=new URL(route.request().url());
 if(u.origin===origin){
 if(route.request().resourceType()==="document"){
 const res=await route.fetch();const html=await res.text();
 const seed=u.pathname==="/"?["bpl-home-categories",[category]]:u.pathname==="/producto/abrigo"?["bpl-product-seed",product]:null;
 return route.fulfill({response:res,body:seed?html.replace("</body>",'<script id="'+seed[0]+'" type="application/json">'+JSON.stringify(seed[1])+'</script></body>'):html});
 }
 return route.continue();
 }
 if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET, OPTIONS","access-control-allow-headers":"*"}});
 if(u.pathname.startsWith("/rest/v1/")){
 let data=[];
 if(u.pathname.endsWith("/categories")){categories++;data=[category];}
 if(u.pathname.endsWith("/products")){products++;data=u.searchParams.has("slug")?product:[];}
 return route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(data)});
 }
 return route.abort();
 });
 await page.goto(origin+"/");
 await page.getByRole("heading",{level:1,name:"Ropa para perros y mascotas en Chile"}).waitFor();
 await page.waitForFunction(()=>!document.getElementById("bpl-home-categories"));
 await page.locator('a[href="/categoria/navidad"]').last().waitFor({state:"visible"});
 assert.equal(categories,0);
 await page.goto(origin+"/producto/abrigo?variant=1");
 await page.getByRole("heading",{level:1,name:"Abrigo prueba"}).waitFor();
 await page.waitForFunction(()=>!document.getElementById("bpl-product-seed"));
 const before=products;
 await page.waitForTimeout(300);
 assert.equal(products,before);
 await page.evaluate(()=>{history.pushState({}, "", "/genero/macho");dispatchEvent(new PopStateEvent("popstate"));});
 await page.getByRole("heading",{level:1,name:"Ropa para perros machos"}).waitFor();
 const count=products;
 await page.evaluate(()=>{history.pushState({}, "", "/producto/abrigo");dispatchEvent(new PopStateEvent("popstate"));});
 await page.getByRole("heading",{level:1,name:"Abrigo prueba"}).waitFor();
 assert.ok(products>count,"return navigation must fetch fresh product");
 }finally{await browser.close();}
});

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

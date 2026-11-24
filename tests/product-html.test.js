import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fetchPublicProduct,renderProductHtml} from "../netlify/edge-functions/product-html.js";
const template=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const product={id:1,active:true,slug:"abrigo",name:"Abrigo <especial>",category:"Navidad",description:"Texto & detalle </script>",product_images:[{url:"https://example.com/a.webp",sort_order:0}],product_variants:[{id:1,size:"0",price:8490,stock:1},{id:2,size:"1",price:8990,stock:0}]};
test("initial HTML has specific metadata, visible content and fresh offers",()=>{
 const html=renderProductHtml(template,product,"2");
 assert.match(html,/<h1>Abrigo &lt;especial&gt;<\/h1>/);
 assert.match(html,/Talla 1 · \$8\.990 CLP · Agotado/);
 assert.match(html,/"price":8990/);
 assert.match(html,/"availability":"https:\/\/schema.org\/OutOfStock"/);
 assert.match(html,/rel="canonical" href="https:\/\/boutiquepetlove.cl\/producto\/abrigo"/);
 assert.equal((html.match(/name="description"/g)||[]).length,1);
 assert.equal((html.match(/<title>/g)||[]).length,1);
 assert.match(html,/"@type":"ProductGroup"/);
 assert.match(html,/"@type":"BreadcrumbList"/);
 assert.match(html,/"@type": "MerchantReturnPolicy"/);
 assert.ok(!html.includes("Texto & detalle </script>"));
 assert.match(html,/src="\/src\/main.jsx"/);
});
test("lookup uses one public request and distinguishes missing from failure",async()=>{
 const env=k=>k==="VITE_SUPABASE_URL"?"https://example.com":k==="VITE_SUPABASE_KEY"?"public-key":"";
 let calls=0;
 const result=await fetchPublicProduct("/producto/abrigo",env,async(url)=>{calls++;assert.equal(url.searchParams.get("active"),"eq.true");assert.match(url.searchParams.get("select"),/product_variants\(id,size,price,stock\)/);return Response.json([product]);});
 assert.equal(result.status,200);assert.equal(calls,1);
 assert.equal((await fetchPublicProduct("/producto/abrigo",env,async()=>Response.json([]))).status,404);
 assert.equal((await fetchPublicProduct("/producto/abrigo",env,async()=>new Response("",{status:500}))).status,503);
});
test("rendering benchmark with 13 variants",()=>{
 const p={...product,product_variants:Array.from({length:13},(_,i)=>({id:i+1,size:String(i),price:8490+i*500,stock:i%2}))};
 const start=performance.now();for(let i=0;i<100;i++)assert.ok(renderProductHtml(template,p,"2"));
 console.log(JSON.stringify({renderOnlyMeanMs:(performance.now()-start)/100,iterations:100,variants:13}));
});

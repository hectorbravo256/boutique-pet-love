import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fetchCategory,renderCategoryHtml} from "../netlify/lib/category-html.js";
const template=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const category={id:1,active:true,slug:"navidad",name:"Navidad",seo_title:"Navidad para perros",seo_description:"Colección navideña",seo_text:"Texto </script>"};
const product={id:1,active:true,slug:"abrigo",name:"Abrigo & fiesta",product_images:[{url:"https://example.com/a.webp"}],product_variants:[{price:8990}]};
const env=k=>({VITE_SUPABASE_URL:"https://example.invalid",VITE_SUPABASE_KEY:"fake"}[k]);
test("category initial HTML and public seed",()=>{
 const html=renderCategoryHtml(template,category,[product]);
 assert.match(html,/<h1[^>]*>Navidad<\/h1>/);assert.match(html,/href="\/producto\/abrigo"/);
 assert.match(html,/Abrigo &amp; fiesta/);assert.match(html,/"@type":"ItemList"/);assert.match(html,/"@type":"BreadcrumbList"/);assert.match(html,/"@type":"CollectionPage"/);
 for(const re of [/<title>/g,/name="description"/g,/rel="canonical"/g])assert.equal((html.match(re)||[]).length,1);
 const seed=JSON.parse(html.match(/id="bpl-category-seed" type="application\/json">([^]*?)<\/script>/)[1]);assert.equal(seed.category.seo_text,"Texto </script>");assert.equal(seed.products[0].product_variants[0].price,8990);
});
test("category lookup filters active rows and handles pagination",async()=>{
 let calls=0;const result=await fetchCategory("/categoria/navidad",env,async u=>{calls++;assert.equal(u.searchParams.get("active"),"eq.true");if(u.pathname.endsWith("/categories"))return Response.json([category]);assert.equal(u.searchParams.get("category"),'in.("navidad","Navidad")');return Response.json(u.searchParams.get("offset")==="0"?[product,{...product,id:2,active:false}]:[]);});
 assert.equal(result.status,200);assert.equal(result.products.length,1);assert.equal(calls,3);
});
test("category missing and upstream errors",async()=>{
 assert.equal((await fetchCategory("/categoria/ausente",env,async()=>Response.json([]))).status,404);
 assert.equal((await fetchCategory("/categoria/%2F",env,async()=>{throw Error("unexpected");})).status,404);
 assert.equal((await fetchCategory("/categoria/navidad",env,async()=>new Response("",{status:500}))).status,503);
 assert.equal((await fetchCategory("/categoria/navidad",env,async u=>u.pathname.endsWith("/categories")?Response.json([category]):new Response("",{status:500}))).status,503);
});
test("category rendering benchmark",()=>{const products=Array.from({length:51},(_,i)=>({...product,id:i,slug:"abrigo-"+i}));const start=performance.now();for(let i=0;i<100;i++)assert.ok(renderCategoryHtml(template,category,products));console.log(JSON.stringify({categoryRenderMeanMs:(performance.now()-start)/100,iterations:100,products:51}));});

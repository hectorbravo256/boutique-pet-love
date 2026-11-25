import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {renderHomeHtml,fetchHomeCategories} from "../netlify/lib/home-html.js";
const template=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const categories=[{id:1,active:true,name:"Navidad & fiesta",slug:"navidad",image:"https://example.com/navidad.webp"},{id:2,active:false,name:"Oculta",slug:"oculta"},{id:3,active:true,name:"</script>",slug:"especial",image:"javascript:alert(1)"}];
test("home renders active category links, safe seed and unique SEO",()=>{
 const html=renderHomeHtml(template,categories);
 assert.match(html,/<h1[^>]*>Ropa para perros y mascotas en Chile<\/h1>/);
 assert.match(html,/href="\/categoria\/navidad"/);
 assert.match(html,/Navidad &amp; fiesta/);
 assert.ok(!html.includes("Oculta"));assert.ok(!html.includes("javascript:alert"));
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.equal((html.match(/name="description"/g)||[]).length,1);
 assert.equal((html.match(/<title>/g)||[]).length,1);
 const seed=JSON.parse(html.match(/id="bpl-home-categories" type="application\/json">([^]*?)<\/script>/)[1]);
 assert.equal(seed.length,2);assert.equal(seed[1].name,"</script>");
});
test("failure preserves public heading and browser fallback",()=>{
 const html=renderHomeHtml(template,null);assert.match(html,/<h1/);assert.ok(!html.includes("bpl-home-categories"));
});
test("single category request and failure fallback",async()=>{
 let calls=0;const env=k=>k==="VITE_SUPABASE_URL"?"https://example.com":k==="VITE_SUPABASE_KEY"?"public-key":"";
 assert.deepEqual(await fetchHomeCategories(env,async u=>{calls++;assert.equal(u.searchParams.get("active"),"eq.true");return Response.json(categories);}),categories);
 assert.equal(calls,1);assert.equal(await fetchHomeCategories(env,async()=>new Response("",{status:500})),null);
});
test("home render benchmark",()=>{const start=performance.now();for(let i=0;i<100;i++)assert.ok(renderHomeHtml(template,categories));console.log(JSON.stringify({homeRenderMeanMs:(performance.now()-start)/100,iterations:100}));});

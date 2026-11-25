import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fetchGender,renderGenderHtml,genderSeo,genders} from "../netlify/lib/gender-html.js";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const env=k=>({VITE_SUPABASE_URL:"https://example.invalid",VITE_SUPABASE_KEY:"fake"}[k]);
const product={id:1,name:"Abrigo & fiesta",slug:"abrigo",active:true,gender:"macho",product_images:[{url:"https://example.com/a.webp"}],product_variants:[{price:8990}]};
test("all gender pages have unique metadata and matching schema",()=>{
 for(const slug of Object.keys(genders)){
 const s=genderSeo(slug,[product]),out=renderGenderHtml(html,slug,[product]);
 assert.equal(s.url,"https://boutiquepetlove.cl/genero/"+slug);
 assert.ok(out.includes(genders[slug]));assert.match(out,/href="\/producto\/abrigo"/);
 for(const re of [/<h1\b/g,/<title>/g,/name="description"/g,/rel="canonical"/g,/"@type":"CollectionPage"/g,/"@type":"ItemList"/g,/"@type":"BreadcrumbList"/g])assert.equal((out.match(re)||[]).length,1);
 const seed=JSON.parse(out.match(/id="bpl-gender-seed" type="application\/json">([^]*?)<\/script>/)[1]);assert.equal(seed.category.slug,slug);assert.equal(seed.products[0].id,1);
 }
});
test("single request for small gender catalog, active and exact gender",async()=>{
 let calls=0;const r=await fetchGender("/genero/macho",env,async u=>{calls++;assert.equal(u.searchParams.get("gender"),"eq.macho");assert.equal(u.searchParams.get("active"),"eq.true");return Response.json([product,{...product,active:false},{...product,gender:"hembra"}]);});
 assert.equal(r.status,200);assert.equal(r.products.length,1);assert.equal(calls,1);
});
test("invalid gender, empty catalog and upstream failure",async()=>{
 assert.equal((await fetchGender("/genero/invalid",env,async()=>{throw Error("unexpected")})).status,404);
 assert.equal((await fetchGender("/genero/unisex",env,async()=>Response.json([]))).status,200);
 assert.equal((await fetchGender("/genero/macho",env,async()=>new Response("",{status:500}))).status,503);
});
test("gender benchmark",()=>{const products=Array.from({length:25},(_,i)=>({...product,id:i,slug:"abrigo-"+i}));const start=performance.now();for(let i=0;i<100;i++)assert.ok(renderGenderHtml(html,"macho",products));console.log(JSON.stringify({genderRenderMeanMs:(performance.now()-start)/100,iterations:100,products:25}));});

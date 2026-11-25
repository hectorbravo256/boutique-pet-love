import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fetchCollection,renderCollectionHtml,collectionSeo,collections} from "../netlify/lib/collection-html.js";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const env=k=>({VITE_SUPABASE_URL:"https://example.invalid",VITE_SUPABASE_KEY:"fake"}[k]);
const product={id:1,name:"Abrigo & fiesta",slug:"abrigo",active:true,product_images:[{url:"https://example.com/a.webp"}],product_variants:[{price:8990}]};
test("all collection pages have unique metadata and correct schema",()=>{
 for(const slug of Object.keys(collections)){
 const s=collectionSeo(slug,[product]),out=renderCollectionHtml(html,slug,[product]);
 assert.equal(s.url,"https://boutiquepetlove.cl/coleccion/"+slug);
 assert.equal(s.collection.url,s.url);assert.equal(s.breadcrumbs.itemListElement[1].item,s.url);
 assert.ok(out.includes(collections[slug].name));assert.match(out,/href="\/producto\/abrigo"/);
 for(const re of [/<h1\b/g,/<title>/g,/name="description"/g,/rel="canonical"/g,/"@type":"CollectionPage"/g,/"@type":"ItemList"/g,/"@type":"BreadcrumbList"/g])assert.equal((out.match(re)||[]).length,1);
 assert.doesNotMatch(out,/name="robots" content="noindex, follow"/);
 const seed=JSON.parse(out.match(/id="bpl-collection-seed" type="application\/json">([^]*?)<\/script>/)[1]);assert.equal(seed.category.slug,slug);assert.equal(seed.products[0].id,1);
 }
});
test("exact collection flags and one request per small catalog",async()=>{
 for(const [slug,{field}] of Object.entries(collections)){
 let calls=0;const r=await fetchCollection("/coleccion/"+slug,env,async u=>{calls++;assert.equal(u.searchParams.get(field),"eq.true");assert.equal(u.searchParams.get("active"),"eq.true");return Response.json([{...product,[field]:true},{...product,active:false,[field]:true},{...product,[field]:false}]);});
 assert.equal(r.status,200);assert.equal(r.products.length,1);assert.equal(calls,1);
 }
});
test("empty collections noindex and become indexable when populated",()=>{
 for(const slug of Object.keys(collections)){
 const out=renderCollectionHtml(html,slug,[]);
 assert.match(out,/name="robots" content="noindex, follow"/);
 assert.match(out,/Actualmente esta colección no tiene productos publicados/);
 assert.equal(collectionSeo(slug,[]).list.itemListElement.length,0);
 assert.doesNotMatch(renderCollectionHtml(html,slug,[product]),/name="robots" content="noindex, follow"/);
 }
});
test("invalid collection and upstream failure",async()=>{
 assert.equal((await fetchCollection("/coleccion/invalid",env,async()=>{throw Error("unexpected")})).status,404);
 assert.equal((await fetchCollection("/coleccion/new",env,async()=>Response.json([]))).status,200);
 assert.equal((await fetchCollection("/coleccion/new",env,async()=>new Response("",{status:500}))).status,503);
});
test("collection benchmark",()=>{for(const count of [0,25]){const products=Array.from({length:count},(_,i)=>({...product,id:i,slug:"abrigo-"+i}));const start=performance.now();for(let i=0;i<100;i++)assert.ok(renderCollectionHtml(html,"new",products));console.log(JSON.stringify({collectionRenderMeanMs:(performance.now()-start)/100,iterations:100,products:count}));}});

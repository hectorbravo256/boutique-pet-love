import test from "node:test";
import assert from "node:assert/strict";
import {catalogStatus,errorResponse,config,createCatalogCache} from "../netlify/edge-functions/catalog-status.js";
import {readFileSync} from "node:fs";
const env=k=>({VITE_SUPABASE_URL:"https://example.invalid",VITE_SUPABASE_KEY:"fake"}[k]);
test("active catalog and variant-independent lookup",async()=>{
 for(const [path,table] of [["/producto/abrigo","products"],["/categoria/navidad","categories"]]){
 assert.equal(await catalogStatus(path,env,async url=>{assert.equal(url.pathname,"/rest/v1/"+table);assert.equal(url.searchParams.get("active"),"eq.true");return {ok:true,json:async()=>[{id:1}]};}),200);
 }
});
test("missing, inactive, malformed and upstream failures",async()=>{
 assert.equal(await catalogStatus("/producto/ausente",env,async()=>({ok:true,json:async()=>[]})),404);
 assert.equal(await catalogStatus("/categoria/ausente",env,async()=>({ok:true,json:async()=>[]})),404);
 assert.equal(await catalogStatus("/producto/%2F",env,async()=>{throw Error("unexpected");}),404);
 assert.equal(await catalogStatus("/producto/x",env,async()=>({ok:false})),503);
 assert.equal(await catalogStatus("/producto/x",env,async()=>{throw Error("network");}),503);
 assert.equal(await catalogStatus("/producto/x",()=>undefined),503);
 assert.equal(errorResponse(404,"GET").status,404);
 assert.equal(errorResponse(404,"GET").headers.get("X-Robots-Tag"),"noindex, follow");
 assert.equal(errorResponse(503,"GET").headers.get("Retry-After"),"60");
 assert.equal(errorResponse(503,"GET").status,503);
 assert.equal(await errorResponse(404,"HEAD").text(),"");
});
test("edge scope and shopping rewrite preserved",()=>{
 assert.deepEqual(config.path,["/","/producto/*","/categoria/*"]);
 const toml=readFileSync(new URL("../netlify.toml",import.meta.url),"utf8");
 assert.match(toml,/from = "\/google-shopping.xml"\s+to = "\/\.netlify\/functions\/google-shopping"/);
 assert.match(toml,/from = "\/\*"\s+to = "\/404.html"\s+status = 404/);
});

test("positive cache expires and never caches 404 or 503",async()=>{
 let now=0,calls=0,status=200;
 const cached=createCatalogCache({clock:()=>now,lookup:async()=>{calls++;return status;}});
 assert.equal(await cached("/producto/a",env),200);
 now=59999;assert.equal(await cached("/producto/a",env),200);assert.equal(calls,1);
 now=60000;status=404;assert.equal(await cached("/producto/a",env),404);
 status=503;assert.equal(await cached("/producto/a",env),503);
 status=200;assert.equal(await cached("/producto/a",env),200);assert.equal(calls,4);
});
test("bounded cache separates products and categories",async()=>{
 let calls=0;const cached=createCatalogCache({max:2,lookup:async()=>{calls++;return 200;}});
 await cached("/producto/a",env);await cached("/categoria/a",env);await cached("/producto/b",env);
 await cached("/producto/a",env);assert.equal(calls,4);
});
test("comparative repeated lookup workload",async()=>{
 let calls=0;const lookup=async()=>{calls++;await new Promise(r=>setTimeout(r,10));return 200;};
 const start=performance.now();for(let i=0;i<20;i++)await lookup();
 const uncached=performance.now()-start;assert.equal(calls,20);
 calls=0;const cached=createCatalogCache({lookup});const begin=performance.now();
 for(let i=0;i<20;i++)await cached("/producto/a",env);
 const warm=performance.now()-begin;assert.equal(calls,1);
 console.log(JSON.stringify({simulated:true,uncachedMs:uncached,cachedMs:warm,uncachedQueries:20,cachedQueries:1}));
});

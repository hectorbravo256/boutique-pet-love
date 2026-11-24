import test from "node:test";
import assert from "node:assert/strict";
import {catalogStatus,errorResponse,config} from "../netlify/edge-functions/catalog-status.js";
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
 assert.deepEqual(config.path,["/producto/*","/categoria/*"]);
 const toml=readFileSync(new URL("../netlify.toml",import.meta.url),"utf8");
 assert.match(toml,/from = "\/google-shopping.xml"\s+to = "\/\.netlify\/functions\/google-shopping"/);
 assert.match(toml,/from = "\/\*"\s+to = "\/404.html"\s+status = 404/);
});

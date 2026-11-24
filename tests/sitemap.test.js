import {test} from "node:test";
import assert from "node:assert/strict";
import {buildSitemap,handler} from "../netlify/functions/sitemap.js";
test("active canonical URLs, deduplication and encoding",()=>{
 const xml=buildSitemap([{active:true,slug:"abrigo"},{active:true,slug:"abrigo"},{active:false,slug:"oculto"},{active:true,slug:"../admin"},{active:true,slug:"niño"},{active:true,slug:"x?variant=1"}],[{active:true,slug:"navidad"},{active:false,slug:"oculta"}]);
 assert.equal((xml.match(/<loc>/g)||[]).length,5);
 assert.match(xml,/producto\/ni%C3%B1o/);
 assert.match(xml,/categoria\/navidad/);
 assert.doesNotMatch(xml,/ocult|\/admin|variant=/);
});
test("handler pagination, HEAD and upstream failure",async t=>{
 const oldFetch=globalThis.fetch;
 const oldUrl=process.env.VITE_SUPABASE_URL,oldKey=process.env.VITE_SUPABASE_KEY;
 process.env.VITE_SUPABASE_URL="https://example.invalid";
 process.env.VITE_SUPABASE_KEY="fake";
 t.after(()=>{globalThis.fetch=oldFetch;for(const [k,v] of [["VITE_SUPABASE_URL",oldUrl],["VITE_SUPABASE_KEY",oldKey]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 globalThis.fetch=async url=>{
  const u=new URL(url),offset=Number(u.searchParams.get("offset"));
  assert.equal(u.searchParams.get("active"),"eq.true");
  const rows=u.pathname.endsWith("/products")?(offset===0?Array.from({length:100},(_,i)=>({active:true,slug:"p"+i})):offset===100?[{active:true,slug:"last"}]:[]):offset===0?[{active:true,slug:"navidad"}]:[];
  return {ok:true,json:async()=>rows};
 };
 const result=await handler({httpMethod:"GET"});
 assert.equal(result.statusCode,200);
 assert.equal((result.body.match(/<loc>/g)||[]).length,104);
 assert.match(result.body,/producto\/last/);
 assert.equal((await handler({httpMethod:"HEAD"})).body,"");
 assert.equal((await handler({httpMethod:"POST"})).statusCode,405);
 globalThis.fetch=async()=>({ok:false});
 assert.equal((await handler({httpMethod:"GET"})).statusCode,503);
});

import {fetchCollection,renderCollectionHtml} from "../lib/collection-html.js";
import {fetchGender,renderGenderHtml} from "../lib/gender-html.js";
import {fetchCategory,renderCategoryHtml} from "../lib/category-html.js";
import {fetchHomeCategories,renderHomeHtml} from "../lib/home-html.js";
import {fetchPublicProduct,renderProductHtml} from "../lib/product-html.js";
export async function catalogStatus(path, env, fetcher = fetch) {
 const match = /^\/(producto|categoria)\/([^/]+)\/?$/i.exec(path);
 if (!match) return 404;
 let slug;
 try { slug=decodeURIComponent(match[2]); } catch { return 404; }
 if (!slug || /[\\/\s]/u.test(slug)) return 404;
 try {
 const base=(env("VITE_SUPABASE_URL")||env("SUPABASE_URL")||"").trim();
 const key=(env("VITE_SUPABASE_KEY")||env("SUPABASE_ANON_KEY")||env("VITE_SUPABASE_ANON_KEY")||"").trim();
 const url=new URL("/rest/v1/"+(match[1].toLowerCase()==="producto"?"products":"categories"),base);
 if(url.protocol!=="https:"||!key) return 503;
 url.search=new URLSearchParams({select:"id",slug:"eq."+slug,active:"eq.true",limit:"1"});
 const headers={apikey:key};if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
 const res=await fetcher(url,{headers,signal:AbortSignal.timeout(2500)});
 if(!res.ok)return 503;
 const rows=await res.json();
 return Array.isArray(rows)?(rows.length?200:404):503;
 } catch {return 503;}
}
export function errorResponse(status,method) {
 const missing=status===404;
 const title=missing?"Página no encontrada":"Temporalmente no disponible";
 const message=missing?"La página que buscas no existe o ya no está disponible.":"Intenta nuevamente en unos minutos.";
 const headers={"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"};
 if(missing)headers["X-Robots-Tag"]="noindex, follow";else headers["Retry-After"]="60";
 return new Response(method==="HEAD"?null:"<!doctype html><html lang='es'><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>"+title+" | Boutique Pet Love</title><body style='font-family:system-ui;text-align:center;padding:12vh 20px;color:#333'><h1 style='color:#db2777'>"+title+"</h1><p>"+message+"</p><a style='color:#db2777' href='/'>Volver al inicio</a></body></html>",{status,headers});
}
// Per-isolate bounded positive cache; never cache prices, missing rows or failures.
export function createCatalogCache({ttl=60000,max=1000,clock=Date.now,lookup=catalogStatus}={}) {
 const entries=new Map();
 return async (path,env,fetcher=fetch)=>{
 const now=clock();
 const hit=entries.get(path);
 if(hit!==undefined && hit>now)return 200;
 entries.delete(path);
 const status=await lookup(path,env,fetcher);
 if(status===200){
 for(const [key,expires] of entries)if(expires<=clock())entries.delete(key);
 while(entries.size>=max && entries.size)entries.delete(entries.keys().next().value);
 if(max>0)entries.set(path,clock()+ttl);
 }
 return status;
 };
}
const cachedCatalogStatus=createCatalogCache();
// Request-local metrics; never record URLs, headers, bodies or customer data.
export function createPerformanceMetrics({clock=()=>performance.now(),fetcher=fetch,logger=console.log}={}){
 const start=clock(),m={queries:0,upstreamMs:0,upstreamBytes:0,baseMs:0,renderMs:0,htmlBytes:0};
 const bytes=s=>new TextEncoder().encode(s).byteLength;
 const measuredFetch=async(...args)=>{
  const t=clock();m.queries++;
  try{
   const response=await fetcher(...args);
   if(!response.ok)return response;
   // Measure decoded body bytes, not compressed network transfer.
   const body=await response.text();m.upstreamBytes+=bytes(body);
   return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
  }finally{m.upstreamMs+=clock()-t;}
 };
 const base=async fn=>{const t=clock();try{return await fn();}finally{m.baseMs+=clock()-t;}};
 const render=fn=>{const t=clock();try{const result=fn();return result;}finally{m.renderMs+=clock()-t;}};
 const finish=(response,route,html)=>{
  if(html!==undefined)m.htmlBytes=bytes(html);
  const round=n=>Math.round(n*100)/100;
  const total=round(clock()-start);
  const headers=new Headers(response.headers);
  headers.append("Server-Timing",["supabase;dur="+round(m.upstreamMs),"htmlbase;dur="+round(m.baseMs),"render;dur="+round(m.renderMs),"edge;dur="+total,"queries;desc=\""+m.queries+"\"","upstream_bytes;desc=\""+m.upstreamBytes+"\"","html_bytes;desc=\""+m.htmlBytes+"\""].join(", "));
  logger(JSON.stringify({event:"catalog_performance",route,status:response.status,queries:m.queries,upstreamMs:round(m.upstreamMs),upstreamBytes:m.upstreamBytes,baseMs:round(m.baseMs),renderMs:round(m.renderMs),htmlBytes:m.htmlBytes,totalMs:total}));
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 };
 return {fetch:measuredFetch,base,render,finish};
}
export default async function handler(request,context){
 if(!["GET","HEAD"].includes(request.method))return;
 const url=new URL(request.url);
 const metrics=createPerformanceMetrics();
 const route=url.pathname==="/"?"home":({producto:"product",categoria:"category",genero:"gender",coleccion:"collection"}[url.pathname.split("/")[1].toLowerCase()]||"other");
 if(url.pathname==="/"){
 const response=await metrics.base(()=>context.next());
 if(request.method==="HEAD"||response.status!==200||!response.headers.get("content-type")?.includes("text/html"))return metrics.finish(response,route);
 const categories=await fetchHomeCategories(k=>Netlify.env.get(k),metrics.fetch);
 const html=await metrics.base(()=>response.text());
 const rendered=metrics.render(()=>renderHomeHtml(html,categories));
 const headers=new Headers(response.headers);
 for(const key of ["content-length","content-encoding","etag","last-modified"])headers.delete(key);
 headers.set("Cache-Control","no-store");
 return metrics.finish(new Response(rendered||html,{status:200,headers}),route,rendered||html);
 }
 if(/^\/producto\//i.test(url.pathname)){
 const result=await fetchPublicProduct(url.pathname,k=>Netlify.env.get(k),metrics.fetch);
 if(result.status!==200)return metrics.finish(errorResponse(result.status,request.method),route);
 const response=await metrics.base(()=>context.next());
 if(request.method==="HEAD"||response.status!==200||!response.headers.get("content-type")?.includes("text/html"))return metrics.finish(response,route);
 const html=await metrics.base(()=>response.text());
 const rendered=metrics.render(()=>renderProductHtml(html,result.product,url.searchParams.get("variant")));
 const headers=new Headers(response.headers);
 for(const key of ["content-length","content-encoding","etag","last-modified"])headers.delete(key);
 headers.set("Cache-Control","no-store");
 return metrics.finish(new Response(rendered||html,{status:200,headers}),route,rendered||html);
 }
 if(/^\/categoria\//i.test(url.pathname)){
 const result=await fetchCategory(url.pathname,k=>Netlify.env.get(k),metrics.fetch);
 if(result.status!==200)return metrics.finish(errorResponse(result.status,request.method),route);
 const response=await metrics.base(()=>context.next());
 if(request.method==="HEAD"||response.status!==200||!response.headers.get("content-type")?.includes("text/html"))return metrics.finish(response,route);
 const html=await metrics.base(()=>response.text()),rendered=metrics.render(()=>renderCategoryHtml(html,result.category,result.products));
 const headers=new Headers(response.headers);
 for(const key of ["content-length","content-encoding","etag","last-modified"])headers.delete(key);
 headers.set("Cache-Control","no-store");
 return metrics.finish(new Response(rendered||html,{status:200,headers}),route,rendered||html);
 }
 if(/^\/genero\//.test(url.pathname)){
 const result=await fetchGender(url.pathname,k=>Netlify.env.get(k),metrics.fetch);
 if(result.status!==200)return metrics.finish(errorResponse(result.status,request.method),route);
 const response=await metrics.base(()=>context.next());
 if(request.method==="HEAD"||response.status!==200||!response.headers.get("content-type")?.includes("text/html"))return metrics.finish(response,route);
 const html=await metrics.base(()=>response.text()),rendered=metrics.render(()=>renderGenderHtml(html,result.slug,result.products));
 const headers=new Headers(response.headers);
 for(const key of ["content-length","content-encoding","etag","last-modified"])headers.delete(key);
 headers.set("Cache-Control","no-store");
 return metrics.finish(new Response(rendered||html,{status:200,headers}),route,rendered||html);
 }
 if(/^\/coleccion\//.test(url.pathname)){
 const result=await fetchCollection(url.pathname,k=>Netlify.env.get(k),metrics.fetch);
 if(result.status!==200)return metrics.finish(errorResponse(result.status,request.method),route);
 const response=await metrics.base(()=>context.next());
 if(request.method==="HEAD"||response.status!==200||!response.headers.get("content-type")?.includes("text/html"))return metrics.finish(response,route);
 const html=await metrics.base(()=>response.text()),rendered=metrics.render(()=>renderCollectionHtml(html,result.slug,result.products));
 const headers=new Headers(response.headers);
 for(const key of ["content-length","content-encoding","etag","last-modified"])headers.delete(key);
 headers.set("Cache-Control","no-store");
 return metrics.finish(new Response(rendered||html,{status:200,headers}),route,rendered||html);
 }
 const status=await cachedCatalogStatus(url.pathname,k=>Netlify.env.get(k),metrics.fetch);
 if(status===200)return;
 return metrics.finish(errorResponse(status,request.method),route);
}
export const config={path:["/","/producto/*","/categoria/*","/genero/*","/coleccion/*"]};

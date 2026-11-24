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
export default async function handler(request,context){
 if(!["GET","HEAD"].includes(request.method))return;
 const status=await catalogStatus(new URL(request.url).pathname,k=>Netlify.env.get(k));
 if(status===200)return;
 return errorResponse(status,request.method);
}
export const config={path:["/producto/*","/categoria/*"]};

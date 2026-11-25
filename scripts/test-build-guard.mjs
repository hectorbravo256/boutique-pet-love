const expected = "https://gztsfbdtevhcskdztiiu.supabase.co";
const ref = "gztsfbdtevhcskdztiiu";
const key = process.env.VITE_SUPABASE_ANON_KEY || "";
if (process.env.SITE_ID !== "f40e0ed1-16cb-4f7d-a228-5c60cd8bf8c8" || process.env.VITE_SUPABASE_URL !== expected) throw new Error("TEST build blocked: incorrect site or URL");
let claims;
try { claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()); } catch { throw new Error("TEST build blocked: expected legacy anon JWT"); }
if (claims.ref !== ref || claims.role !== "anon") throw new Error("TEST build blocked: incorrect key project or role");
for (const name of Object.keys(process.env)) if (/MERCADO|^MP_|SMTP|EMAIL_PASSWORD|SUPABASE_SERVICE|SUPABASE_KEY|^SUPABASE_URL$|^SUPABASE_ANON_KEY$/i.test(name) && process.env[name]) throw new Error("TEST build blocked: forbidden credential " + name);
console.log("TEST build guard passed");

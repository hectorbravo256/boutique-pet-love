const expected = "https://gztsfbdtevhcskdztiiu.supabase.co";
import { createHash } from "node:crypto";
const expectedKey = "sb_publishable_ZD7_OVIGDW4jKjvazazm4A_ZU0Gg2vA";

const key = process.env.VITE_SUPABASE_ANON_KEY || "";
if (process.env.SITE_ID !== "f40e0ed1-16cb-4f7d-a228-5c60cd8bf8c8" || process.env.VITE_SUPABASE_URL !== expected) throw new Error("TEST build blocked: incorrect site or URL");
if (!key.startsWith("sb_publishable_") || createHash("sha256").update(key).digest("hex") !== createHash("sha256").update(expectedKey).digest("hex")) throw new Error("TEST build blocked: incorrect publishable key");
for (const name of Object.keys(process.env)) if (/MERCADO|^MP_|SMTP|EMAIL_PASSWORD|SUPABASE_SERVICE|SUPABASE_KEY|^SUPABASE_URL$|^SUPABASE_ANON_KEY$/i.test(name) && process.env[name]) throw new Error("TEST build blocked: forbidden credential " + name);
console.log("TEST build guard passed");

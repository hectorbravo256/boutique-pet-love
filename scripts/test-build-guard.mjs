const expected = "https://gztsfbdtevhcskdztiiu.supabase.co";
if (process.env.SITE_ID !== "f40e0ed1-16cb-4f7d-a228-5c60cd8bf8c8" || process.env.VITE_SUPABASE_URL !== expected || !process.env.VITE_SUPABASE_ANON_KEY) throw new Error("TEST build blocked: incorrect site or missing isolated Supabase configuration");
for (const name of Object.keys(process.env)) if (/MERCADO|SMTP|EMAIL_PASSWORD|SUPABASE_SERVICE|SUPABASE_KEY/i.test(name) && process.env[name]) throw new Error("TEST build blocked: forbidden credential " + name);
console.log("TEST build guard passed");

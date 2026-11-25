import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (url !== "https://gztsfbdtevhcskdztiiu.supabase.co" || !key?.startsWith("sb_publishable_")) throw new Error("TEST: configuración Supabase inválida");
export const supabase = createClient(url, key, { auth: { storageKey: "bpl-test-auth" } });

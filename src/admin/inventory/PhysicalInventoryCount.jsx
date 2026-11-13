import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const cls = "rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-pink-500";
const btn = "rounded-xl px-4 py-3 font-semibold disabled:opacity-40";
const label = value => String(value ?? "").replace(/^Talla\s+/i, "Talla ");

const SIZE_ORDER = {
  "2XS": 0, "XXS": 0,
  "XS": 1,
  "S": 2,
  "M": 3,
  "L": 4,
  "XL": 5,
  "2XL": 6, "XXL": 6,
  "3XL": 7, "XXXL": 7,
  "4XL": 8,
  "5XL": 9,
  "6XL": 10,
  "7XL": 11,
  "8XL": 12,
  "UNICA": 13, "ÚNICA": 13
};

const sizeIndex = value => {
  const size = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/^TALLA\s+/, "")
    .replace(/\s+/g, "");

  if (size === "ÚNICA" || size === "UNICA") return 13;

  const numeric = /^(?:T)?(\d{1,2})$/.exec(size);
  if (numeric) return Number(numeric[1]);

  return SIZE_ORDER[size] ?? 99;
};

const sortInventory = (a, b) =>
  String(a.product_name ?? "").localeCompare(
    String(b.product_name ?? ""),
    "es",
    { sensitivity: "base" }
  ) ||
  sizeIndex(a.size) - sizeIndex(b.size) ||
  String(a.size ?? "").localeCompare(
    String(b.size ?? ""), "es"
  ) ||
  Number(a.variant_id) - Number(b.variant_id);


export default function PhysicalInventoryCount() {
  const [sessions, setSessions] = useState([]);
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [mode, setMode] = useState("complete");
  const [category, setCategory] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [only, setOnly] = useState("all");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const lockRef = useRef(false);
  const sessionRef = useRef(null);
  const itemsRef = useRef([]);
  const pendingRef = useRef(Promise.resolve());

  const notifyError = e => { console.error(e); setError(e?.message || String(e)); };
  const loadSessions = async () => {
    const { data, error: e } = await supabase.from("physical_count_sessions")
      .select("*").order("created_at", { ascending: false });
    if (e) throw e;
    setSessions(data || []);
  };

const loadSession = async id => {
  const [
    { data: s, error: se },
    { data: rows, error: re },
    { data: images, error: ie }
  ] = await Promise.all([
    supabase
      .from("physical_count_sessions")
      .select("*")
      .eq("id", id)
      .single(),

    supabase
      .from("physical_count_items")
      .select("*")
      .eq("session_id", id)
      .order("product_name"),

    supabase
      .from("vw_inventory_master")
      .select("variant_id, image")
  ]);

  if (se || re) throw se || re;

  if (ie) {
    console.warn("No se pudieron cargar imágenes:", ie);
  }

  const imageMap = new Map(
    (images || []).map(v => [
      String(v.variant_id),
      v.image
    ])
  );

  const orderedRows = (rows || [])
    .map(item => ({
      ...item,
      image: imageMap.get(String(item.variant_id)) || null
    }))
    .sort(sortInventory);

  sessionRef.current = s;
  itemsRef.current = orderedRows;

  setSession(s);
  setItems(orderedRows);
  setError("");
  setMessage("");
};

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error: e } = await supabase.from("products").select("category");
        if (e) throw e;
        if (active) setCategories([...new Set((data || []).map(p => p.category).filter(Boolean))].sort());
        await loadSessions();
      } catch (e) { if (active) notifyError(e); }
    })();
    return () => { active = false; };
  }, []);

  const createSession = async e => {
    e.preventDefault();
    if (busy || !name.trim() || !responsible.trim() || (mode === "category" && !category)) return;
    setBusy(true); setError("");
    try {
      const { data: id, error: e } = await supabase.rpc("create_physical_count", {
        p_name: name.trim(), p_mode: mode, p_category: mode === "category" ? category : null,
        p_responsible: responsible.trim()
      });
      if (e) throw e;
      await loadSession(id);
      await loadSessions();
      setMessage("Sesión creada y guardada en Supabase.");
    } catch (e) { notifyError(e); } finally { setBusy(false); }
  };

  const saveCount = async (id, qty) => {
    const s = sessionRef.current;
    if (!s || ["closed", "applied"].includes(s.status)) return;
    if (!Number.isSafeInteger(qty) || qty < 0) return;
    const previous = itemsRef.current;
    const next = previous.map(x => String(x.variant_id) === String(id)
      ? { ...x, counted_stock: qty, counted_at: new Date().toISOString() } : x);
    itemsRef.current = next;
    setItems(next);
    setMessage("Guardando conteo...");
    // Cola serial: evita que dos escaneos del mismo producto se sobrescriban en la BD.
    pendingRef.current = pendingRef.current.catch(() => {}).then(async () => {
      const { data, error: e } = await supabase.from("physical_count_items")
        .update({ counted_stock: qty, counted_at: new Date().toISOString() })
        .eq("session_id", s.id).eq("variant_id", id).select("variant_id");
      if (e) throw e;
      if (!data?.length) throw new Error("No se guardó el conteo. Revisa permisos o estado de la sesión.");
      if (s.status === "draft") {
        const { data: updated, error: se } = await supabase.from("physical_count_sessions")
          .update({ status: "in_progress", updated_at: new Date().toISOString() })
          .eq("id", s.id).eq("status", "draft").select("*").maybeSingle();
        if (se) throw se;
        if (updated) { sessionRef.current = updated; setSession(updated); }
      }
      setMessage("✓ Conteo guardado en Supabase");
    }).catch(async e => {
      notifyError(e);
      setMessage("⚠️ No se pudo guardar. Recargando valores de Supabase.");
      try { await loadSession(s.id); } catch (loadError) { notifyError(loadError); }
      throw e;
    });
    try { await pendingRef.current; } catch { /* Error mostrado arriba */ }
  };

  const scan = async e => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value || lockRef.current || !session ||
    ["closed", "applied"].includes(session.status)) return;
    lockRef.current = true; setBusy(true); setError("");
    try {
      // Los códigos de esta tienda se generan a partir del ID de variante.
      const match = /^BPL-(\d{8})$/.exec(value);
      if (!match) throw new Error(`Código no válido: ${value}`);
      const id = String(Number(match[1]));
      const row = itemsRef.current.find(x => String(x.variant_id) === id);
      if (!row) throw new Error(`Código no incluido en esta sesión: ${value}`);
      await saveCount(id, Number(row.counted_stock ?? 0) + 1);
      setCode("");
      setSearch(""); setOnly("all");
    } catch (e) { notifyError(e); }
    finally { setBusy(false); lockRef.current = false; inputRef.current?.focus(); }
  };

  const visible = useMemo(() => items.filter(x => {
    const q = `${x.product_name} ${x.size} ${x.category}`.toLowerCase();
    const diff = x.counted_stock !== null && x.counted_stock !== x.system_stock;
    return q.includes(search.toLowerCase()) &&
      (only === "all" || (only === "pending" && x.counted_stock === null) ||
       (only === "differences" && diff));
  }), [items, search, only]);
  const counted = items.filter(x => x.counted_stock !== null);
  const differences = counted.filter(x => x.counted_stock !== x.system_stock);
  const exportCSV = () => {
    const headers = ["Producto", "Categoria", "Talla", "ID Variante", "Stock Sistema", "Conteo Fisico", "Diferencia", "Estado"];
    const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = items.map(x => [x.product_name, x.category, x.size, x.variant_id, x.system_stock,
      x.counted_stock ?? "", x.counted_stock === null ? "" : x.counted_stock - x.system_stock,
      x.counted_stock === null ? "Pendiente" : "Contado"]);
    const blob = new Blob(["\uFEFF" + [headers, ...rows].map(r => r.map(escape).join(";")).join("\r\n")],
      { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `conteo-${session.id}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  
const applyAdjustments = async () => {
  if (!session || session.status !== "closed" || busy) return;

  const changes = items.filter(
    x => x.counted_stock !== null &&
         x.counted_stock !== x.system_stock
  );

  const confirmed = window.confirm(
    `¿Aplicar ${changes.length} ajustes de inventario?\n\n` +
    "Se actualizará el stock real y se registrarán los movimientos.\n" +
    "Esta operación no se puede repetir."
  );

  if (!confirmed) return;

  setBusy(true);
  setError("");

  try {
    const { data, error: e } = await supabase.rpc(
      "apply_physical_count",
      { p_session_id: session.id }
    );

    if (e) throw e;

    await loadSession(session.id);
    await loadSessions();

    setMessage(
      `✓ Ajustes aplicados: ${data?.adjusted_variants ?? 0} variantes actualizadas.`
    );
  } catch (e) {
    notifyError(e);
  } finally {
    setBusy(false);
  }
};

  const closeSession = async () => {
    if (!session || busy || session.status === "closed") return;
    if (counted.length !== items.length) {
      setError(`Hay ${items.length - counted.length} variantes sin contar. Registra 0 explícitamente si fueron revisadas.`);
      return;
    }
    if (!window.confirm("¿Cerrar la sesión? No se podrá editar después. Esto NO modifica el stock real.")) return;
    setBusy(true);
    try {
      await pendingRef.current.catch(() => {});
      const { data, error: e } = await supabase.from("physical_count_sessions")
        .update({ status: "closed", closed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", session.id).in("status", ["draft", "in_progress"]).select("*").single();
      if (e) throw e;
      sessionRef.current = data; setSession(data); await loadSessions();
      setMessage("Sesión cerrada. No se modificó el stock de productos.");
    } catch (e) { notifyError(e); } finally { setBusy(false); }
  };

  return <div className="space-y-6 p-4 sm:p-6">
    <Link to="/admin/inventario" className="font-semibold text-pink-600">← Volver a Inventario</Link>
    <header className="rounded-3xl border bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-pink-500">BOUTIQUE PET LOVE ERP</p>
      <h1 className="mt-2 text-3xl font-black">📊 Conteo Físico</h1>
      <p className="text-slate-500">Sesiones guardadas de inventario completo o por categoría.</p>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">⚠️ {error}</div>}
    {message && <div role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{message}</div>}
    {!session ? <>
      <form onSubmit={createSession} className="space-y-4 rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Crear sesión de conteo</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1"><span className="text-sm font-semibold">Nombre del inventario</span>
            <input required minLength={3} maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Inventario noviembre 2026" className={`${cls} w-full`}/></label>
          <label className="space-y-1"><span className="text-sm font-semibold">Responsable</span>
            <input required minLength={2} maxLength={120} value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Nombre del responsable" className={`${cls} w-full`}/></label>
          <label className="space-y-1"><span className="text-sm font-semibold">Modalidad</span>
            <select value={mode} onChange={e => setMode(e.target.value)} className={`${cls} w-full`}>
              <option value="complete">Inventario completo</option><option value="category">Por categoría</option>
            </select></label>
          {mode === "category" && <label className="space-y-1"><span className="text-sm font-semibold">Categoría</span>
            <select required value={category} onChange={e => setCategory(e.target.value)} className={`${cls} w-full`}>
              <option value="">Selecciona categoría</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select></label>}
        </div>
        <button disabled={busy} className={`${btn} bg-pink-500 text-white`}>{busy ? "Creando..." : "Crear y comenzar conteo"}</button>
      </form>
      <section className="rounded-3xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-black">Historial de sesiones</h2>
        {sessions.length === 0 && <p className="text-slate-500">Todavía no hay sesiones guardadas.</p>}
        <div className="space-y-2">{sessions.map(s => <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <div><p className="font-bold">{s.name}</p><p className="text-xs text-slate-500">{s.mode === "complete" ? "Completo" : s.category} · {s.responsible} · {new Date(s.created_at).toLocaleString("es-CL")} · {s.status}</p></div>
          <button type="button" className={`${btn} bg-slate-900 text-white`} onClick={async () => { try { await loadSession(s.id); } catch(e) { notifyError(e); } }}>Abrir</button>
        </div>)}</div>
      </section>
    </> : <>
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-black">{session.name}</h2><p className="text-sm text-slate-500">{session.mode === "complete" ? "Inventario completo" : `Categoría: ${session.category}`} · Responsable: {session.responsible} · {session.status}</p></div>
          <button type="button" className={`${btn} border`} onClick={async () => { await pendingRef.current.catch(() => {}); sessionRef.current=null; setSession(null); setItems([]); setError(""); await loadSessions().catch(notifyError); }}>← Sesiones</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Variantes totales",items.length],["Contadas",counted.length],["Pendientes",items.length-counted.length],["Diferencias",differences.length]].map(([k,v]) => <div key={k} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{k}</p><p className="text-2xl font-black">{v}</p></div>)}</div>
      </section>
      {!["closed", "applied"].includes(session.status) && <section className="rounded-3xl border bg-white p-5">
        <h2 className="text-lg font-black">Escanear código de barras</h2><p className="text-sm text-slate-500">Cada escaneo suma una unidad y se guarda en Supabase.</p>
        <form onSubmit={scan} className="mt-3 flex gap-3"><input ref={inputRef} autoFocus value={code} onChange={e => setCode(e.target.value)} placeholder="BPL-00000001" className={`${cls} min-w-0 flex-1`}/><button disabled={busy || !code.trim()} className={`${btn} bg-pink-500 text-white`}>Agregar</button></form>
      </section>}
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Resultado del conteo</h2><div className="flex flex-wrap gap-2"><button type="button" onClick={exportCSV} className={`${btn} border`}>Descargar CSV</button>
          {session.status !== "closed" && <button type="button" disabled={busy} onClick={closeSession} className={`${btn} bg-slate-900 text-white`}>Cerrar sesión</button>}
          
{!["closed", "applied"].includes(session.status) && (
  <button
    type="button"
    disabled={busy}
    onClick={applyAdjustments}
    className={`${btn} bg-emerald-600 text-white`}
  >
    Aprobar y aplicar ajustes
  </button>
)}

{session.status === "applied" && (
  <span className="rounded-xl bg-green-50 px-4 py-3 font-bold text-green-700">
    ✓ Ajustes aplicados
  </span>
)}

        </div></div>
        <div className="mt-4 flex flex-wrap gap-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." className={cls}/><select value={only} onChange={e => setOnly(e.target.value)} className={cls}><option value="all">Todas las variantes</option><option value="pending">Pendientes</option><option value="differences">Con diferencias</option></select></div>
        <div className="mt-4 overflow-x-auto rounded-xl border"><table className="w-full min-w-[750px] text-sm"><thead className="bg-slate-100 text-left"><tr>{["Producto", "Talla", "Sistema", "Físico", "Diferencia", "Estado"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{visible.map(x => <tr key={x.variant_id} className="border-t">
          
<td className="p-3">
  <div className="flex min-w-[220px] items-center gap-3">
    {x.image ? (
      <img
        src={x.image}
        alt={x.product_name}
        loading="lazy"
        className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
      />
    ) : (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
        📦
      </div>
    )}

    <div className="min-w-0">
      <p className="font-semibold text-slate-900">
        {x.product_name}
      </p>
      <p className="text-xs text-slate-500">
        {x.category}
      </p>
    </div>
  </div>
</td>

          <td className="p-3">{label(x.size)}</td><td className="p-3">{x.system_stock}</td><td className="p-3">{["closed", "applied"].includes(session.status) ? (x.counted_stock ?? "—") : <div className="flex items-center gap-2"><button type="button" disabled={busy} className="rounded border px-2 py-1" onClick={async () => { setBusy(true); await saveCount(x.variant_id,Math.max(0,Number(x.counted_stock ?? 0)-1)); setBusy(false); }}>−</button><input aria-label={`Conteo ${x.product_name} ${x.size}`} type="number" min="0" step="1" value={x.counted_stock ?? ""} placeholder="Pend." onChange={e => { const val=e.target.value; if (val === "") return; const n=Number(val); if(Number.isSafeInteger(n) && n>=0) { setBusy(true); saveCount(x.variant_id,n).finally(()=>setBusy(false)); } }} className="w-20 rounded border px-2 py-2"/><button type="button" disabled={busy} className="rounded border px-2 py-1" onClick={async () => { setBusy(true); await saveCount(x.variant_id,Number(x.counted_stock ?? 0)+1); setBusy(false); }}>+</button>{x.counted_stock === null && <button type="button" disabled={busy} onClick={async () => { setBusy(true); await saveCount(x.variant_id,0); setBusy(false); }} className="text-xs text-pink-600 underline">Marcar 0</button>}</div>}</td><td className={`p-3 font-bold ${x.counted_stock !== null && x.counted_stock !== x.system_stock ? "text-red-600" : "text-green-700"}`}>{x.counted_stock === null ? "—" : (x.counted_stock-x.system_stock>0?"+":"")+(x.counted_stock-x.system_stock)}</td><td className="p-3">{x.counted_stock === null ? "Pendiente" : "Contado"}</td></tr>)}</tbody></table></div>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">El conteo físico conserva las cantidades originales para auditoría. Cerrar una sesión no modifica el stock. Al aprobar los ajustes, se actualizan las existencias y se registran los movimientos correspondientes en el historial.</p>
      </section>
    </>}
  </div>;
}

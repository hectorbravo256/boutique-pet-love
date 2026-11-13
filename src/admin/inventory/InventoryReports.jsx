import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const money = n => '$' + Math.round(Number(n) || 0).toLocaleString('es-CL');
const numeric = n => Number(n) || 0;
const sizeRank = raw => {
  const s = String(raw || '').toUpperCase().replace(/\s+/g, '').replace(/^TALLA/, '');
  if (['UNICA', 'ÚNICA', 'TU'].includes(s)) return 13;
  const match = s.match(/^T?(\d{1,2})$/);
  if (match && +match[1] <= 12) return +match[1];
  return ['2XS','XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL','7XL','8XL'].indexOf(s);
};
const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
const downloadCsv = (name, columns, rows) => {
  const lines = [columns, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n');
  const blob = new Blob(['\ufeff' + lines], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};
async function allRows(table, columns, configure = q => q) {
  const output = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await configure(supabase.from(table).select(columns)).range(offset, offset + 999);
    if (error) throw error;
    output.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return output;
}
export default function InventoryReports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('TODAS');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('TODOS');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [updated, setUpdated] = useState(null);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [products, variants, purchases] = await Promise.all([
        allRows('products', 'id,name,category,active,image'),
        allRows('product_variants', 'id,product_id,size,stock,min_stock,price,sku'),
        allRows('inventory_movements', 'variant_id,unit_cost,created_at,id', q => q.eq('movement_type','PURCHASE').gt('unit_cost',0).order('created_at',{ascending:false}).order('id',{ascending:false}))
      ]);
      const productById = new Map(products.map(p => [String(p.id), p]));
      const lastCost = new Map();
      purchases.forEach(p => { const id = String(p.variant_id); if (p.variant_id != null && !lastCost.has(id)) lastCost.set(id, numeric(p.unit_cost)); });
      setRecords(variants.map(v => {
        const p = productById.get(String(v.product_id));
        const cost = lastCost.get(String(v.id));
        return { ...v, name: p?.name || 'Producto sin nombre', category: p?.category || 'Sin categoría', active: p?.active === true, image: p?.image, cost: cost ?? null };
      }));
      setUpdated(new Date());
    } catch (e) { setError(e.message || 'No fue posible cargar el reporte.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const categories = useMemo(() => [...new Set(records.map(r => r.category))].sort((a,b) => a.localeCompare(b,'es')), [records]);
  const filtered = useMemo(() => records.filter(r => {
    if (!includeInactive && !r.active) return false;
    if (category !== 'TODAS' && r.category !== category) return false;
    if (search && !(`${r.name} ${r.size} ${r.sku || ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
    const stock = numeric(r.stock), min = numeric(r.min_stock ?? 3);
    return status === 'TODOS' || (status === 'SIN_STOCK' && stock <= 0) || (status === 'CRITICO' && stock > 0 && stock <= min) || (status === 'SIN_COSTO' && stock > 0 && r.cost == null) || (status === 'DISPONIBLE' && stock > min);
  }).sort((a,b) => a.name.localeCompare(b.name,'es') || sizeRank(a.size)-sizeRank(b.size) || String(a.size).localeCompare(String(b.size),'es')), [records,includeInactive,category,search,status]);
  const summary = useMemo(() => ({
    products: new Set(filtered.map(r => r.product_id)).size,
    units: filtered.reduce((s,r) => s + numeric(r.stock), 0),
    withoutStock: filtered.filter(r => numeric(r.stock) <= 0).length,
    critical: filtered.filter(r => numeric(r.stock) > 0 && numeric(r.stock) <= numeric(r.min_stock ?? 3)).length,
    valued: filtered.reduce((s,r) => s + (r.cost == null ? 0 : numeric(r.stock) * r.cost), 0),
    missingCost: filtered.filter(r => numeric(r.stock) > 0 && r.cost == null).length,
  }), [filtered]);
  const exportData = () => downloadCsv('reporte-inventario-boutique-pet-love.csv',
    ['Producto','Categoría','Talla','SKU','Activo','Stock','Stock mínimo','Precio venta','Último costo compra','Valorización costo','Estado'],
    filtered.map(r => [r.name,r.category,r.size,r.sku,r.active?'Sí':'No',r.stock,r.min_stock,r.price,r.cost ?? '',r.cost == null ? '' : numeric(r.stock)*r.cost,numeric(r.stock)<=0?'Sin stock':numeric(r.stock)<=numeric(r.min_stock??3)?'Crítico':'Disponible']));
  return <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
    <Link to="/admin/inventario" className="text-sm font-semibold text-pink-600 hover:underline">← Volver a Inventario</Link>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black text-slate-900">Reportes de inventario</h1><p className="text-slate-500">Existencias, alertas y valorización estimada al último costo de compra.</p></div><button onClick={load} disabled={loading} className="rounded-xl border bg-white px-5 py-3 font-semibold disabled:opacity-50">Actualizar</button></div>
    {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}
    {loading ? <p>Cargando reporte...</p> : <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{[
        ['Productos',summary.products],['Unidades',summary.units],['Sin stock',summary.withoutStock],['Stock crítico',summary.critical],['Valor conocido',money(summary.valued)],['Sin costo',summary.missingCost]
      ].map(([label,value]) => <div key={label} className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>)}</div>
      <div className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">Buscar producto<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, talla o SKU" className="mt-1 block w-full rounded-xl border px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold">Categoría<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 block rounded-xl border px-3 py-2 font-normal"><option value="TODAS">Todas</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="text-sm font-semibold">Estado<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 block rounded-xl border px-3 py-2 font-normal"><option value="TODOS">Todos</option><option value="SIN_STOCK">Sin stock</option><option value="CRITICO">Stock crítico</option><option value="DISPONIBLE">Disponible</option><option value="SIN_COSTO">Sin costo registrado</option></select></label>
        <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={includeInactive} onChange={e=>setIncludeInactive(e.target.checked)} /> Incluir productos desactivados</label>
        <button onClick={exportData} className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white">Descargar CSV</button>
      </div><p className="mt-3 text-xs text-slate-500">{filtered.length} variantes · Actualizado: {updated?.toLocaleString('es-CL')} · Los filtros se aplican también a los indicadores y al CSV.</p></div>
      <div className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-100 text-left"><tr>{['Producto','Talla','Stock','Mínimo','Precio venta','Último costo','Valor al costo','Estado'].map(h=><th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>)}</tr></thead><tbody>{filtered.map(r=>{const stock=numeric(r.stock),critical=stock>0&&stock<=numeric(r.min_stock??3);return <tr key={r.id} className="border-t"><td className="px-4 py-3"><div className="font-bold">{r.name}</div><div className="text-xs text-slate-500">{r.category}{!r.active?' · Desactivado':''}</div></td><td className="px-4 py-3">{r.size}</td><td className="px-4 py-3 font-bold">{stock}</td><td className="px-4 py-3">{r.min_stock??3}</td><td className="px-4 py-3">{money(r.price)}</td><td className="px-4 py-3">{r.cost==null?'Sin registro':money(r.cost)}</td><td className="px-4 py-3 font-semibold">{r.cost==null?'—':money(stock*r.cost)}</td><td className="px-4 py-3"><span className={stock<=0?'font-semibold text-red-600':critical?'font-semibold text-amber-600':'font-semibold text-green-700'}>{stock<=0?'Sin stock':critical?'Crítico':'Disponible'}</span></td></tr>})}</tbody></table>{!filtered.length&&<p className="p-8 text-center text-slate-500">No hay variantes para estos filtros.</p>}</div>
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Valorización referencial: se usa el último costo positivo registrado en movimientos de compra por variante. Las variantes sin costo se excluyen del valor total, pero se muestran en el reporte. No representa un cálculo contable de costo promedio ni FIFO. Este módulo es de solo lectura y no modifica existencias.</p>
    </>}
  </div>;
}

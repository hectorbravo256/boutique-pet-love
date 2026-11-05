import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Code128Svg } from './code128';

const peso = value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
const MAX_LABELS = 500;

export default function BarcodeLabelsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [quantities, setQuantities] = useState({});
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase.from('products').select('id,name,category,active,product_variants(id,size,price,stock,sku,barcode)').order('name');
      if (!mounted) return;
      if (err) setError(err.message);
      else setProducts(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products]);
  const filtered = useMemo(() => products.filter(p => (!category || p.category === category) && (!search || `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()))), [products, category, search]);
  const selected = useMemo(() => products.flatMap(p => (p.product_variants || []).map(v => ({ ...v, productName: p.name, quantity: quantities[v.id] || 0 }))).filter(v => v.quantity > 0), [products, quantities]);
  const total = selected.reduce((sum, v) => sum + v.quantity, 0);

  const setQty = (id, qty) => setQuantities(prev => ({ ...prev, [id]: Math.max(0, Math.min(MAX_LABELS, Number.isFinite(+qty) ? Math.floor(+qty) : 0)) }));
  const selectStock = () => setQuantities(prev => {
    const next = { ...prev };
    filtered.forEach(p => (p.product_variants || []).forEach(v => { next[v.id] = Math.max(0, v.stock || 0); }));
    return next;
  });

const print = () => {
  if (!total || total > MAX_LABELS) return;

  const labels = document.querySelector('.bpl-print-root');
  if (!labels) return;

  const popup = window.open('', '_blank', 'width=650,height=650');

  if (!popup) {
    alert('Permite las ventanas emergentes de Boutique Pet Love para imprimir.');
    return;
  }

  const css = `
    @page {
      size: 50mm 30mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      font-family: Arial, sans-serif;
    }

    .bpl-label {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 50mm;
      height: 30mm;
      padding: 1.7mm;
      margin: 0;
      overflow: hidden;
      break-inside: avoid;
      break-after: page;
      page-break-after: always;
    }

    .bpl-label:last-child {
      break-after: auto;
      page-break-after: auto;
    }

    .bpl-label .text-center {
      text-align: center;
    }

    .bpl-label .font-bold {
      font-weight: 700;
    }

    .bpl-label .truncate {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .bpl-label .flex {
      display: flex;
    }

    .bpl-label .justify-between {
      justify-content: space-between;
    }

    .bpl-label svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  popup.document.open();

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Etiquetas Boutique Pet Love</title>
        <style>${css}</style>
      </head>
      <body>${labels.innerHTML}</body>
    </html>
  `);

  popup.document.close();

  popup.focus();
  popup.print();
};

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
      <div><p className="text-xs font-bold tracking-[.25em] uppercase text-pink-500">Inventario · Etiquetas</p><h1 className="text-3xl font-black text-slate-900 mt-2">Etiquetas de productos</h1><p className="text-slate-500 mt-2">Códigos Code 128 · Xprinter XP-420B · 50 × 30 mm</p></div>
      <button type="button" disabled={!total || total > MAX_LABELS} onClick={print} className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg disabled:opacity-40">🖨 Imprimir {total} etiquetas</button>
    </div>

    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5 space-y-4 print:hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input aria-label="Buscar producto" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 outline-pink-400" />
        <select aria-label="Filtrar categoría" value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">Todas las categorías</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={selectStock} className="rounded-xl bg-pink-50 px-4 py-2 text-pink-700 font-semibold">Usar stock actual (filtrados)</button><button type="button" onClick={() => setQuantities({})} className="rounded-xl bg-slate-100 px-4 py-2 text-slate-700 font-semibold">Limpiar selección</button><label className="flex gap-2 items-center text-sm text-slate-700"><input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} /> Incluir precio en etiqueta</label></div>
      <p className="text-sm text-slate-500">Selecciona cuántas etiquetas necesitas por talla. Límite por impresión: {MAX_LABELS}.</p>
    </div>

    {loading && <p className="print:hidden">Cargando productos...</p>}
    {error && <p role="alert" className="text-red-600 print:hidden">No se pudieron cargar los productos: {error}</p>}
    {!loading && !error && <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 print:hidden">{filtered.map(p => <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">{p.name}</h2><p className="text-xs text-slate-400 mt-1">{p.category || 'Sin categoría'} · {p.active ? 'Activo' : 'Inactivo'}</p><div className="mt-4 space-y-2">{[...(p.product_variants || [])].sort((a,b) => a.id - b.id).map(v => <div key={v.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex-1 min-w-0"><p className="font-semibold text-sm text-slate-800">{v.size}</p><p className="text-xs text-slate-500">{v.sku} · Stock: {v.stock} · {peso(v.price)}</p></div><input aria-label={`Etiquetas ${p.name} ${v.size}`} type="number" min="0" max={MAX_LABELS} value={quantities[v.id] || 0} onChange={e => setQty(v.id, e.target.value)} className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-center" /></div>)}</div></div>)}</div>}

    <div className="rounded-3xl border border-slate-100 bg-white p-5 print:hidden"><h2 className="text-lg font-bold">Vista previa · {total} etiquetas</h2>{total > MAX_LABELS && <p className="text-red-600 mt-2">Reduce la selección a un máximo de {MAX_LABELS} etiquetas.</p>}{!total && <p className="text-slate-500 mt-2">Selecciona al menos una etiqueta.</p>}<div className="flex flex-wrap gap-3 mt-4">{selected.slice(0, 6).map(v => <Label key={v.id} variant={v} showPrice={showPrice} />)}</div>{total > 6 && <p className="text-sm text-slate-500 mt-3">Mostrando las primeras seis variantes en la vista previa.</p>}</div>

    <div className="bpl-print-root">{total <= MAX_LABELS && selected.flatMap(v => Array.from({ length: v.quantity }, (_, i) => <Label key={`${v.id}-${i}`} variant={v} showPrice={showPrice} />))}</div>
    <style>{`@media screen { .bpl-print-root { display:none; } } @media print { @page { size: 50mm 30mm; margin: 0; } html,body,#root { margin:0!important; padding:0!important; background:white!important; } body * { visibility:hidden!important; } .bpl-print-root,.bpl-print-root * { visibility:visible!important; } .bpl-print-root { display:block!important; position:absolute!important; left:0!important; top:0!important; width:50mm!important; } .bpl-label { box-sizing:border-box!important; width:50mm!important; height:30mm!important; padding:1.7mm!important; margin:0!important; border:0!important; border-radius:0!important; page-break-after:always!important; break-after:page!important; overflow:hidden!important; box-shadow:none!important; } .bpl-label:last-child { page-break-after:auto!important; break-after:auto!important; } }`}</style>
  </div>;
}

function Label({ variant, showPrice }) {
  return <div className="bpl-label flex flex-col justify-between bg-white text-black border border-slate-200 rounded-lg overflow-hidden" style={{ width:'50mm',height:'30mm',padding:'1.7mm',flexShrink:0 }}>
    <div className="text-center" style={{ fontSize:'8pt',fontWeight:900,lineHeight:1.05 }}>BOUTIQUE PET LOVE</div>
    <div className="text-center font-bold truncate" style={{ fontSize:'7.5pt',lineHeight:1.05 }}>{variant.productName}</div>
    <div className="flex justify-between" style={{ fontSize:'7pt',fontWeight:700 }}><span>{variant.size}</span>{showPrice && <span>{peso(variant.price)}</span>}</div>
    <div style={{height:'10mm',width:'100%'}}><Code128Svg value={variant.barcode || variant.sku} /></div>
    <div className="text-center" style={{ fontSize:'7pt',letterSpacing:'.05em',lineHeight:1 }}>{variant.barcode || variant.sku}</div>
  </div>;
}

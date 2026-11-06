
import { useEffect, useMemo, useState } from "react";
import AdminCard from "../components/AdminCard";
import useInventoryMaster from "../shared/hooks/useInventoryMaster";
import InventoryEditor from "./InventoryEditor";

const TALLAS = [
    "2XS", "XS", "S", "M", "L", "XL",
    "2XL", "3XL", "4XL", "5XL",
    "6XL", "7XL", "8XL"
];


function indiceTalla(valor) {
    const talla = String(valor ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/^TALLA/, "");

    // T0, T1, T2... T12
    const numerica = talla.match(/^T?(\d{1,2})$/);

    if (numerica) {
        const numero = Number(numerica[1]);
        return numero >= 0 && numero <= 12 ? numero : -1;
    }

    // 2XS, XS, S, M, L, XL... 8XL
    return TALLAS.indexOf(talla);
}

export default function InventoryMasterTable() {
    const {
        inventory,
        loading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter
    } = useInventoryMaster();

    const [selectedItem, setSelectedItem] = useState(null);

    const [categoryFilter, setCategoryFilter] = useState("TODAS");

const categorias = useMemo(() => {
    return [...new Set(
        inventory
            .map(item => item.category)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));
}, [inventory]);

const inventarioFiltrado = useMemo(() => {
    if (categoryFilter === "TODAS") return inventory;

    return inventory.filter(
        item => item.category === categoryFilter
    );
}, [inventory, categoryFilter]);

    const productos = useMemo(() => {
        const grupos = new Map();

        inventarioFiltrado.forEach(item => {
            // product_id tiene prioridad sobre el nombre.
            // Así no unimos productos diferentes por accidente.
            const clave = item.product_id != null
                ? `id:${item.product_id}`
                : `nombre:${item.product_name}|${item.category}`;

            if (!grupos.has(clave)) {
                grupos.set(clave, {
                    clave,
                    nombre: item.product_name,
                    categoria: item.category,
                    imagen: item.image,
                    tallas: Array.from(
                        { length: 13 },
                        () => []
                    ),
                    otras: [],
                    total: 0
                });
            }

            const grupo = grupos.get(clave);
            const indice = indiceTalla(item.size);

            if (indice === -1) {
                grupo.otras.push(item);
            } else {
                grupo.tallas[indice].push(item);
            }

            grupo.total += Number(item.stock || 0);
        });

        return [...grupos.values()].sort((a, b) =>
            String(a.nombre).localeCompare(
                String(b.nombre),
                "es"
            )
        );
    }, [inventarioFiltrado]);

    const totalUnidades = productos.reduce(
        (total, producto) => total + producto.total,
        0
    );

    if (loading) {
        return <p>Cargando inventario...</p>;
    }

    useEffect(() => {
    if (!selectedItem) return;

    const cerrarConEscape = (event) => {
        if (event.key === "Escape") {
            setSelectedItem(null);
        }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
        window.removeEventListener("keydown", cerrarConEscape);
    };
}, [selectedItem]);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-white p-4">
                    <p className="text-xs text-slate-500">
                        Productos visibles
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                        {productos.length}
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                    <p className="text-xs text-slate-500">
                        Unidades visibles
                    </p>
                    <p className="text-2xl font-black text-pink-600">
                        {totalUnidades}
                    </p>
                </div>

                <div className="col-span-2 rounded-2xl border bg-white p-4 md:col-span-1">
                    <p className="text-xs text-slate-500">
                        Variantes visibles
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                        {inventarioFiltrado.length}
                    </p>
                </div>
            </div>

            <AdminCard>
                <div className="mb-5">
                    <h2 className="text-2xl font-black text-slate-900">
                        Inventario Maestro
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Existencias por producto y talla.
                        Selecciona una cantidad para ver la variante.
                    </p>
                </div>

                <div className="mb-5 flex flex-wrap gap-3">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar producto..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 md:w-80"
                    />
                    
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3"
                    >
                        <option value="TODAS">Todas las categorías</option>
                    
                        {categorias.map(categoria => (
                            <option key={categoria} value={categoria}>
                                {categoria.replace(" - ", " · ")}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="OK">OK</option>
                        <option value="CRITICO">Crítico</option>
                        <option value="SIN STOCK">Sin stock</option>
                    </select>
                </div>

                <div className="min-w-0">
                    <div className="min-w-0">
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="w-full min-w-[1120px] border-collapse text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="sticky left-0 z-20 min-w-[220px] border-b border-r bg-slate-100 p-3 text-left">
                                            Producto
                                        </th>

                                        {TALLAS.map((talla, indice) => (
                                            <th
                                                key={indice}
                                                className="min-w-[56px] border-b border-r p-2 text-center"
                                            >
                                                <div className="font-black text-slate-800">
                                                    T{indice}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {talla}
                                                </div>
                                            </th>
                                        ))}

                                        <th className="min-w-[75px] border-b bg-pink-50 p-3 text-center">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productos.map(producto => (
                                        <tr
                                            key={producto.clave}
                                            className="hover:bg-pink-50/40"
                                        >
                                            <td className="sticky left-0 z-10 border-b border-r bg-white p-2">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={producto.imagen || "/placeholder.png"}
                                                        alt={producto.nombre}
                                                        className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                                                    />

                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800">
                                                            {producto.nombre}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {producto.categoria || ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {producto.tallas.map((variantes, indice) => (
                                                <td
                                                    key={indice}
                                                    className="border-b border-r p-1 text-center"
                                                >
                                                    {variantes.length === 0 ? (
                                                        <span className="text-slate-300">
                                                            —
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            {variantes.map(variante => {
                                                                const stock = Number(variante.stock || 0);

                                                                return (
                                                                    <button
                                                                        key={variante.variant_id}
                                                                        type="button"
                                                                        onClick={() => setSelectedItem(variante)}
                                                                        title={`${variante.size} · Stock: ${stock}`}
                                                                        className={`
                                                                            w-full rounded-lg px-1 py-2
                                                                            text-xs font-black transition
                                                                            hover:ring-2 hover:ring-pink-400
                                                                            ${
                                                                                selectedItem?.variant_id === variante.variant_id
                                                                                    ? "ring-2 ring-pink-500"
                                                                                    : ""
                                                                            }
                                                                            ${
                                                                                stock === 0
                                                                                    ? "bg-red-50 text-red-600"
                                                                                    : stock <= 3
                                                                                        ? "bg-orange-50 text-orange-600"
                                                                                        : "bg-green-50 text-green-700"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {stock}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                            ))}

                                            <td className="border-b bg-pink-50 p-2 text-center font-black text-pink-700">
                                                {producto.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {productos.some(p => p.otras.length > 0) && (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <h3 className="mb-2 font-bold text-amber-800">
                                    Variantes con tallas no reconocidas
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {productos.flatMap(p =>
                                        p.otras.map(item => (
                                            <button
                                                key={item.variant_id}
                                                type="button"
                                                onClick={() => setSelectedItem(item)}
                                                className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-amber-900 hover:bg-amber-100"
                                            >
                                                {p.nombre} · {item.size} · Stock {item.stock}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {productos.length === 0 && (
                            <p className="py-10 text-center text-slate-500">
                                No hay productos para los filtros seleccionados.
                            </p>
                        )}
                    </div>

                </div>
            </AdminCard>

            
{selectedItem && (
    <div
        className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-slate-950/60 p-4
        "
        onMouseDown={e => {
            if (e.target === e.currentTarget) {
                setSelectedItem(null);
            }
        }}
    >
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de variante"
            className="
                w-full max-w-2xl
                max-h-[90vh] overflow-y-auto
                rounded-3xl bg-white
                shadow-2xl
            "
        >
            <InventoryEditor
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    </div>
)}
      
        </div>
    );
}

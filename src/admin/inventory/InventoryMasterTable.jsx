
import { useEffect, useMemo, useRef, useState } from "react";
import AdminCard from "../components/AdminCard";
import useInventoryMaster from "../shared/hooks/useInventoryMaster";
import InventoryEditor from "./InventoryEditor";
import { supabase } from "../../supabaseClient";

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

    if (["UNICA", "ÚNICA", "UNICO", "ÚNICO", "TU"].includes(talla)) {
    return 13;
}

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

    
    const [codigoEscaner, setCodigoEscaner] = useState("");
    const [escaneando, setEscaneando] = useState(false);
    const [errorEscaner, setErrorEscaner] = useState("");
    const [mensajeEscaner, setMensajeEscaner] = useState("");
    const [varianteEscaneada, setVarianteEscaneada] = useState(null);
    
    const escaneoEnProceso = useRef(false);
    const inputEscanerRef = useRef(null);


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
                        { length: 14 },
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

    
const procesarEscaneoInventario = async (codigoIngresado) => {
    const codigo = String(codigoIngresado || "")
        .trim()
        .toUpperCase();

    if (!codigo || escaneoEnProceso.current) return;

    escaneoEnProceso.current = true;
    setEscaneando(true);
    setErrorEscaner("");
    setMensajeEscaner("");

    try {
        const { data: coincidencias, error } = await supabase
            .from("product_variants")
            .select("id, product_id, size, barcode, sku")
            .or(`barcode.eq.${codigo},sku.eq.${codigo}`)
            .limit(2);

        if (error) throw error;

        if (!coincidencias?.length) {
            setErrorEscaner(
                `Código no encontrado: ${codigo}`
            );
            return;
        }

        if (coincidencias.length > 1) {
            setErrorEscaner(
                `El código ${codigo} corresponde a más de una variante.`
            );
            return;
        }

        const variante = coincidencias[0];

        // El hook ya aplica filtros de búsqueda y estado.
        // Restablecerlos para localizar la variante.
        setSearch("");
        setStatusFilter("TODOS");
        setCategoryFilter("TODAS");

        setVarianteEscaneada(String(variante.id));

        // El inventario del hook se actualizará tras
        // restablecer los filtros.
        setMensajeEscaner(
            `Código reconocido: ${codigo}. Localizando variante...`
        );

    } catch (error) {
        console.error("Error al consultar código:", error);
        setErrorEscaner(
            "No fue posible consultar el código de barras."
        );
    } finally {
        setCodigoEscaner("");
        setEscaneando(false);
        escaneoEnProceso.current = false;

        // Mantener el foco para el siguiente escaneo.
        requestAnimationFrame(() => {
            inputEscanerRef.current?.focus();
        });
    }
};

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

    
useEffect(() => {
    if (!varianteEscaneada || loading) return;

    const encontrada = inventory.find(
        item =>
            String(item.variant_id) === varianteEscaneada
    );

    if (!encontrada) {
        setErrorEscaner(
            "El código existe, pero su variante no aparece " +
            "en el Inventario Maestro."
        );
        setVarianteEscaneada(null);
        return;
    }

    setSelectedItem(encontrada);
    setMensajeEscaner(
        `✓ Encontrado: ${encontrada.product_name} - ${encontrada.size}`
    );
    setVarianteEscaneada(null);
}, [varianteEscaneada, inventory, loading]);

    

    if (loading) {
        return <p>Cargando inventario...</p>;
    }

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

                <div className="mb-6 rounded-2xl border border-pink-200 bg-pink-50/40 p-4 sm:p-5">
                    <div className="mb-3">
                        <h3 className="font-bold text-slate-900">
                            Escanear código de barras
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Escanea una etiqueta para consultar su stock,
                            talla y precio de venta.
                        </p>
                    </div>
                
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            procesarEscaneoInventario(codigoEscaner);
                        }}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            ref={inputEscanerRef}
                            type="text"
                            value={codigoEscaner}
                            onChange={e => setCodigoEscaner(e.target.value)}
                            placeholder="Escanea o escribe BPL-00000001"
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                
                        <button
                            type="submit"
                            disabled={escaneando || !codigoEscaner.trim()}
                            className="rounded-xl bg-pink-500 px-7 py-3 font-bold text-white transition hover:bg-pink-600 disabled:opacity-50"
                        >
                            {escaneando ? "Buscando..." : "Consultar"}
                        </button>
                    </form>
                
                    {errorEscaner && (
                        <p
                            role="alert"
                            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                        >
                            ⚠️ {errorEscaner}
                        </p>
                    )}
                
                    {mensajeEscaner && !errorEscaner && (
                        <p
                            role="status"
                            className="mt-3 text-sm font-semibold text-green-700"
                        >
                            {mensajeEscaner}
                        </p>
                    )}
                </div>
                
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
                                        
                                        <th className="min-w-[72px] border-b border-r bg-purple-50 p-2 text-center">
                                            <div className="font-black text-purple-800">
                                                Única
                                            </div>
                                            <div className="text-[10px] text-purple-500">
                                                TU
                                            </div>
                                        </th>

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
                                                    className={`border-b border-r p-1 text-center ${
                                                        indice === 13 ? "bg-purple-50/50" : ""
                                                    }`}
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
                w-full max-w-xl
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


import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function PhysicalInventoryCount() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [codigo, setCodigo] = useState("");
    const [conteos, setConteos] = useState({});
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [categoria, setCategoria] = useState("TODAS");
    const [busqueda, setBusqueda] = useState("");

    const inputRef = useRef(null);
    const ocupadoRef = useRef(false);

    useEffect(() => {
        let activo = true;

        async function cargar() {
            const { data, error: err } = await supabase
                .from("vw_inventory_master")
                .select("*")
                .order("product_name");

            if (!activo) return;

            if (err) {
                setError(err.message);
            } else {
                setInventory(data || []);
            }

            setLoading(false);
        }

        cargar();
        return () => { activo = false; };
    }, []);

    const inventarioPorId = useMemo(
        () => new Map(
            inventory.map(v => [String(v.variant_id), v])
        ),
        [inventory]
    );

    const filas = useMemo(() => {
        return Object.entries(conteos)
            .map(([id, cantidad]) => {
                const item = inventarioPorId.get(id);
                if (!item) return null;

                const sistema = Number(item.stock || 0);
                const fisico = Number(cantidad);

                return {
                    ...item,
                    id,
                    sistema,
                    fisico,
                    diferencia: fisico - sistema
                };
            })
            .filter(Boolean)
            .filter(item =>
                (categoria === "TODAS" ||
                    item.category === categoria) &&
                `${item.product_name} ${item.size}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
            )
            .sort((a, b) =>
                a.product_name.localeCompare(
                    b.product_name, "es"
                )
            );
    }, [conteos, inventarioPorId, categoria, busqueda]);

    const categorias = useMemo(
        () => [...new Set(
            inventory.map(v => v.category).filter(Boolean)
        )].sort(),
        [inventory]
    );

    const resumen = useMemo(() => ({
        variantes: filas.length,
        unidades: filas.reduce((s, v) => s + v.fisico, 0),
        diferencias: filas.filter(v => v.diferencia !== 0).length
    }), [filas]);

    const actualizarCantidad = (id, valor) => {
        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero < 0) return;

        setConteos(prev => ({
            ...prev,
            [String(id)]: numero
        }));
    };

    const escanear = async (valor) => {
        const texto = String(valor || "").trim().toUpperCase();

        if (!texto || ocupadoRef.current) return;

        ocupadoRef.current = true;
        setBuscando(true);
        setError("");
        setMensaje("");

        try {
            const { data, error: err } = await supabase
                .from("product_variants")
                .select("id, barcode, sku")
                .or(`barcode.eq.${texto},sku.eq.${texto}`)
                .limit(2);

            if (err) throw err;

            if (!data?.length) {
                setError(`Código no encontrado: ${texto}`);
                return;
            }

            if (data.length > 1) {
                setError(`Código duplicado: ${texto}`);
                return;
            }

            const id = String(data[0].id);
            const item = inventarioPorId.get(id);

            if (!item) {
                setError("La variante no aparece en el Inventario Maestro.");
                return;
            }

            setConteos(prev => ({
                ...prev,
                [id]: Number(prev[id] || 0) + 1
            }));

            setCategoria("TODAS");
            setBusqueda("");
            setMensaje(
                `✓ Contado: ${item.product_name} · ${item.size}`
            );
        } catch (err) {
            console.error(err);
            setError("No se pudo consultar el código.");
        } finally {
            setCodigo("");
            setBuscando(false);
            ocupadoRef.current = false;
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    };

    const quitar = id => {
        setConteos(prev => {
            const siguiente = { ...prev };
            delete siguiente[String(id)];
            return siguiente;
        });
    };

    const limpiar = () => {
        if (!window.confirm(
            "¿Eliminar todas las cantidades contadas?"
        )) return;

        setConteos({});
        setMensaje("");
        setError("");
    };

    const descargarCSV = () => {
        const encabezados = [
            "Producto", "Categoria", "Talla",
            "ID Variante", "Stock Sistema",
            "Conteo Fisico", "Diferencia"
        ];

        const escapar = valor =>
            `"${String(valor ?? "").replace(/"/g, '""')}"`;

        const contenido = [
            encabezados.map(escapar).join(";"),
            ...filas.map(v => [
                v.product_name, v.category, v.size,
                v.variant_id, v.sistema,
                v.fisico, v.diferencia
            ].map(escapar).join(";"))
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + contenido],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "conteo-fisico-boutique-pet-love.csv";
        enlace.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <Link
                to="/admin/inventario"
                className="font-semibold text-pink-600"
            >
                ← Volver a Inventario
            </Link>

            <div className="rounded-3xl border bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                    BOUTIQUE PET LOVE ERP
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-900">
                    📊 Conteo Físico
                </h1>
                <p className="mt-2 text-slate-500">
                    Escanea las prendas y compara las cantidades
                    físicas con el inventario del sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    ["Variantes contadas", resumen.variantes],
                    ["Unidades contadas", resumen.unidades],
                    ["Con diferencias", resumen.diferencias]
                ].map(([titulo, valor]) => (
                    <div key={titulo} className="rounded-2xl border bg-white p-5">
                        <p className="text-sm text-slate-500">{titulo}</p>
                        <p className="mt-1 text-3xl font-black">{valor}</p>
                    </div>
                ))}
            </div>

            <section className="rounded-3xl border bg-white p-5 sm:p-6">
                <h2 className="text-lg font-black">
                    Escanear código de barras
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Cada escaneo suma una unidad al conteo físico.
                </p>

                <form
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                    onSubmit={e => {
                        e.preventDefault();
                        escanear(codigo);
                    }}
                >
                    <input
                        ref={inputRef}
                        autoFocus
                        value={codigo}
                        onChange={e => setCodigo(e.target.value)}
                        placeholder="Escanea o escribe BPL-00000001"
                        autoComplete="off"
                        className="min-w-0 flex-1 rounded-xl border px-4 py-3 focus:border-pink-500 outline-none"
                    />
                    <button
                        disabled={buscando || !codigo.trim()}
                        className="rounded-xl bg-pink-500 px-7 py-3 font-bold text-white disabled:opacity-50"
                    >
                        {buscando ? "Buscando..." : "Agregar"}
                    </button>
                </form>

                {mensaje && (
                    <p role="status" className="mt-3 font-semibold text-green-700">
                        {mensaje}
                    </p>
                )}
                {error && (
                    <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 font-semibold text-red-700">
                        ⚠️ {error}
                    </p>
                )}
            </section>

            <section className="rounded-3xl border bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black">
                            Resultado del conteo
                        </h2>
                        <p className="text-sm text-slate-500">
                            Compara y corrige las cantidades físicas.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={!filas.length}
                            onClick={descargarCSV}
                            className="rounded-xl border px-4 py-2 font-semibold disabled:opacity-40"
                        >
                            Descargar CSV
                        </button>
                        <button
                            type="button"
                            disabled={!Object.keys(conteos).length}
                            onClick={limpiar}
                            className="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-600 disabled:opacity-40"
                        >
                            Limpiar conteo
                        </button>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar producto..."
                        className="rounded-xl border px-4 py-3"
                    />
                    <select
                        value={categoria}
                        onChange={e => setCategoria(e.target.value)}
                        className="rounded-xl border px-4 py-3"
                    >
                        <option value="TODAS">Todas las categorías</option>
                        {categorias.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border">
                    <table className="min-w-[800px] w-full text-sm">
                        <thead className="bg-slate-100 text-left">
                            <tr>
                                {[
                                    "Producto", "Talla", "Sistema",
                                    "Físico", "Diferencia", "Acción"
                                ].map(t => (
                                    <th key={t} className="p-3">{t}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map(v => (
                                <tr key={v.id} className="border-t">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={v.image || "/placeholder.png"}
                                                alt=""
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                            <div>
                                                <p className="font-bold">
                                                    {v.product_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {v.category}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 font-semibold">
                                        {v.size}
                                    </td>
                                    <td className="p-3 font-bold">
                                        {v.sistema}
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={v.fisico}
                                            onChange={e => {
                                                if (e.target.value !== "") {
                                                    actualizarCantidad(
                                                        v.id,
                                                        e.target.value
                                                    );
                                                }
                                            }}
                                            className="w-24 rounded-lg border px-3 py-2 font-bold"
                                        />
                                    </td>
                                    <td className={`p-3 font-black ${
                                        v.diferencia === 0
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }`}>
                                        {v.diferencia > 0 ? "+" : ""}
                                        {v.diferencia}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            onClick={() => quitar(v.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!filas.length && (
                    <p className="py-8 text-center text-slate-500">
                        {loading
                            ? "Cargando inventario..."
                            : "Todavía no hay prendas contadas en esta vista."}
                    </p>
                )}

                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    ⚠️ Conteo de prueba: no modifica existencias en Supabase.
                    Las cantidades se mantienen solamente mientras
                    esta pantalla permanezca abierta. Descarga el CSV
                    antes de salir si necesitas conservarlas.
                </p>
            </section>
        </div>
    );
}

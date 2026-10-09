
import { useMemo, useState } from "react";
import Modal from "../../../shared/ui/Modal";
import ProductCard from "../../shared/ProductCard";

export default function VentaProductoModal({
    open,
    onClose,
    productos = [],
    onAgregar
}) {
    const [categoria, setCategoria] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [productoId, setProductoId] = useState("");
    const [varianteId, setVarianteId] = useState("");
    const [cantidad, setCantidad] = useState(1);

    const categorias = useMemo(
        () =>
            [...new Set(productos.map((p) => p.category).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b)),
        [productos]
    );

    const productosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();

        return productos.filter((p) => {
            const coincideCategoria =
                !categoria || p.category === categoria;
            const coincideNombre =
                !termino || p.name.toLowerCase().includes(termino);

            return coincideCategoria && coincideNombre;
        });
    }, [productos, categoria, busqueda]);

    const productoSeleccionado = productos.find(
        (p) => String(p.id) === String(productoId)
    );

    const variantes = useMemo(
        () =>
            [...(productoSeleccionado?.product_variants || [])].sort(
                (a, b) =>
                    String(a.size).localeCompare(
                        String(b.size),
                        undefined,
                        { numeric: true }
                    )
            ),
        [productoSeleccionado]
    );

    const varianteSeleccionada = variantes.find(
        (v) => String(v.id) === String(varianteId)
    );

    const reiniciar = () => {
        setCategoria("");
        setBusqueda("");
        setProductoId("");
        setVarianteId("");
        setCantidad(1);
    };

    const cerrar = () => {
        reiniciar();
        onClose();
    };

    const seleccionarProducto = (producto) => {
        setProductoId(String(producto.id));
        setVarianteId("");
        setCantidad(1);
    };

    const cambiarProducto = () => {
        setProductoId("");
        setVarianteId("");
        setCantidad(1);
        setBusqueda("");
    };

    const agregar = () => {
        if (!productoSeleccionado || !varianteSeleccionada) return;

        const stock = Number(varianteSeleccionada.stock || 0);
        const qty = Number(cantidad);

        if (!Number.isInteger(qty) || qty < 1 || qty > stock) return;

        const resultado = onAgregar(
            productoSeleccionado,
            varianteSeleccionada,
            qty
        );

        if (resultado === true) {
            reiniciar();
        }
    };

    return (
        <Modal
            open={open}
            onClose={cerrar}
            title="Agregar producto"
            size="xl"
            closeOnBackdrop={false}
            workspace
        >
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6">

                {!productoSeleccionado ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Categoría
                                </label>
                                <select
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Buscar producto
                                </label>
                                <input
                                    type="search"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Escribe el nombre..."
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-slate-500">
                                {productosFiltrados.length} productos encontrados
                            </p>
                            {busqueda && (
                                <button
                                    type="button"
                                    onClick={() => setBusqueda("")}
                                    className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>

                        {productosFiltrados.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {productosFiltrados.map((producto) => {
                                    const imagen =
                                        producto.product_images?.[0]?.url;

                                    return (
                                        <button
                                            key={producto.id}
                                            type="button"
                                            onClick={() => seleccionarProducto(producto)}
                                            className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-2 text-center transition hover:border-pink-400 hover:bg-pink-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                                            title={`Seleccionar ${producto.name}`}
                                        >
                                            <img
                                                src={imagen || "/placeholder-product.png"}
                                                alt={producto.name}
                                                loading="lazy"
                                                className="aspect-square w-full rounded-xl bg-slate-100 object-cover"
                                            />
                                            <span className="mt-2 block text-sm font-semibold leading-snug text-slate-800 group-hover:text-pink-700">
                                                {producto.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                                No se encontraron productos con estos filtros.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={cambiarProducto}
                                className="rounded-xl border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50"
                            >
                                ← Cambiar producto
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                            <div className="mx-auto w-full max-w-56 shrink-0 md:mx-0">
                                <ProductCard product={productoSeleccionado} />
                            </div>

                            <div className="min-w-0 flex-1 space-y-5">
                                <div>
                                    <label className="mb-3 block text-sm font-semibold">
                                        Selecciona una talla
                                    </label>

                                    {variantes.length > 0 ? (
                                        <div className="flex flex-wrap gap-2.5">
                                            {variantes.map((v) => {
                                                const sinStock =
                                                    Number(v.stock || 0) <= 0;
                                                const seleccionada =
                                                    String(v.id) === String(varianteId);

                                                return (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        disabled={sinStock}
                                                        onClick={() => {
                                                            setVarianteId(String(v.id));
                                                            setCantidad(1);
                                                        }}
                                                        className={`rounded-xl border px-4 py-3 font-semibold transition ${
                                                            seleccionada
                                                                ? "border-pink-500 bg-pink-500 text-white shadow-md"
                                                                : "border-slate-300 bg-white text-slate-800 hover:border-pink-400 hover:bg-pink-50"
                                                        } ${
                                                            sinStock
                                                                ? "cursor-not-allowed opacity-40 line-through"
                                                                : ""
                                                        }`}
                                                        title={
                                                            sinStock
                                                                ? "Sin stock"
                                                                : `Stock disponible: ${v.stock}`
                                                        }
                                                    >
                                                        {String(v.size).toLowerCase().startsWith("talla")
                                                            ? v.size
                                                            : `Talla ${v.size}`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            Este producto no tiene tallas registradas.
                                        </p>
                                    )}
                                </div>

                                {varianteSeleccionada && (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold">
                                                    Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={Number(varianteSeleccionada.stock || 0)}
                                                    step="1"
                                                    value={cantidad}
                                                    onChange={(e) => {
                                                        const valor = e.target.value;
                                                        setCantidad(
                                                            valor === "" ? "" : Number(valor)
                                                        );
                                                    }}
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                                />
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Stock disponible: {varianteSeleccionada.stock || 0}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold">
                                                    Precio unitario
                                                </label>
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold">
                                                    ${Number(
                                                        varianteSeleccionada.price || 0
                                                    ).toLocaleString("es-CL")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-pink-50 p-4">
                                            <p className="font-semibold text-slate-800">
                                                {productoSeleccionado.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Talla {varianteSeleccionada.size}
                                                {" · "}
                                                Subtotal: $
                                                {(
                                                    Number(varianteSeleccionada.price || 0) *
                                                    (Number.isInteger(Number(cantidad))
                                                        ? Number(cantidad)
                                                        : 0)
                                                ).toLocaleString("es-CL")}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={cerrar}
                                        className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={agregar}
                                        disabled={
                                            !productoSeleccionado ||
                                            !varianteSeleccionada ||
                                            !Number.isInteger(Number(cantidad)) ||
                                            Number(cantidad) < 1 ||
                                            Number(cantidad) >
                                                Number(varianteSeleccionada?.stock || 0)
                                        }
                                        className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        + Agregar producto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

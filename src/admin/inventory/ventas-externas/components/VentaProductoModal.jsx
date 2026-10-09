
import { useMemo, useState } from "react";
import Modal from "../../../shared/ui/Modal";
import ProductSearch from "../../../shared/ui/ProductSearch";
import ProductCard from "../../shared/ProductCard";

export default function VentaProductoModal({
    open,
    onClose,
    productos = [],
    onAgregar
}) {
    const [categoria, setCategoria] = useState("");
    const [productoId, setProductoId] = useState("");
    const [varianteId, setVarianteId] = useState("");
    const [cantidad, setCantidad] = useState(1);

    const categorias = useMemo(
        () =>
            [...new Set(
                productos.map((p) => p.category).filter(Boolean)
            )].sort((a, b) => a.localeCompare(b)),
        [productos]
    );

    const productosFiltrados = useMemo(
        () =>
            productos.filter(
                (p) => !categoria || p.category === categoria
            ),
        [productos, categoria]
    );

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

    const agregar = () => {
        if (!productoSeleccionado || !varianteSeleccionada) return;

        const stock = Number(varianteSeleccionada.stock || 0);
        const qty = Number(cantidad);

        if (!Number.isInteger(qty) || qty < 1 || qty > stock) {
            return;
        }

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
            <div className="rounded-3xl border border-slate-300 bg-white p-4 md:p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

                    {/* Tarjeta fija del producto */}
                    <div className="w-full shrink-0 md:w-56">
                        {productoSeleccionado ? (
                            <ProductCard product={productoSeleccionado} />
                        ) : (
                            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                <span className="mb-3 text-5xl">🐾</span>
                                <p className="font-bold text-slate-700">
                                    Selecciona un producto
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Aquí aparecerán su imagen y sus datos.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controles de selección */}
                    <div className="min-w-0 flex-1 space-y-5">

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Categoría
                            </label>
                            <select
                                value={categoria}
                                onChange={(e) => {
                                    setCategoria(e.target.value);
                                    setProductoId("");
                                    setVarianteId("");
                                    setCantidad(1);
                                }}
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
                                Producto
                            </label>
                            <ProductSearch
                                key={categoria}
                                products={productosFiltrados}
                                value={productoId}
                                onSelect={seleccionarProducto}
                            />
                        </div>

                        {productoSeleccionado && (
                            <>
                                <div>
                                    <label className="mb-3 block text-sm font-semibold">
                                        Talla
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
        </Modal>
    );
}


import { useMemo, useState } from "react";
import Modal from "../../../shared/ui/Modal";

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
        () => [
            ...new Set(
                productos
                    .map((p) => p.category)
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b)),
        [productos]
    );

    const productosFiltrados = useMemo(
        () =>
            productos.filter((p) => {
                const coincideCategoria =
                    !categoria || p.category === categoria;

                const coincideNombre =
                    p.name
                        .toLowerCase()
                        .includes(busqueda.trim().toLowerCase());

                return coincideCategoria && coincideNombre;
            }),
        [productos, categoria, busqueda]
    );

    const productoSeleccionado = productos.find(
        (p) => String(p.id) === String(productoId)
    );

    const variantes = (productoSeleccionado?.product_variants || [])
        .slice()
        .sort((a, b) =>
            String(a.size).localeCompare(
                String(b.size),
                undefined,
                { numeric: true }
            )
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

    const agregar = () => {
        if (!productoSeleccionado || !varianteSeleccionada) {
            return;
        }

        if (
            !Number.isInteger(Number(cantidad)) ||
            Number(cantidad) < 1
        ) {
            return;
        }

        onAgregar(
            productoSeleccionado,
            varianteSeleccionada,
            Number(cantidad)
        );

        reiniciar();
    };

    return (
        <Modal
            open={open}
            onClose={cerrar}
            title="Agregar producto"
            size="xl"
            closeOnBackdrop={false}
        >
            <div className="space-y-5">
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
                        Buscar producto
                    </label>

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setProductoId("");
                            setVarianteId("");
                        }}
                        placeholder="Escribe el nombre del producto..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Producto
                    </label>

                    <select
                        value={productoId}
                        onChange={(e) => {
                            setProductoId(e.target.value);
                            setVarianteId("");
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                    >
                        <option value="">Selecciona un producto</option>

                        {productosFiltrados.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    {productosFiltrados.length === 0 && (
                        <p className="mt-2 text-sm text-slate-500">
                            No se encontraron productos para este filtro.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Talla
                        </label>

                        <select
                            value={varianteId}
                            onChange={(e) => setVarianteId(e.target.value)}
                            disabled={!productoSeleccionado}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 disabled:opacity-50"
                        >
                            <option value="">Selecciona una talla</option>

                            {variantes.map((v) => (
                                <option
                                    key={v.id}
                                    value={v.id}
                                    disabled={Number(v.stock || 0) <= 0}
                                >
                                    {v.size} · Stock: {v.stock || 0}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Cantidad
                        </label>

                        <input
                            type="number"
                            min="1"
                            max={varianteSeleccionada?.stock}
                            value={cantidad}
                            onChange={(e) =>
                                setCantidad(Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        />
                    </div>
                </div>

                {varianteSeleccionada && (
                    <div className="rounded-xl bg-pink-50 p-4">
                        <p className="font-semibold text-slate-800">
                            {productoSeleccionado.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Talla {varianteSeleccionada.size}
                            {" · "}
                            Precio unitario: $
                            {Number(varianteSeleccionada.price).toLocaleString("es-CL")}
                        </p>
                    </div>
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
                            Number(cantidad) > Number(varianteSeleccionada?.stock || 0)
                        }
                        className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        + Agregar producto
                    </button>
                </div>
            </div>
        </Modal>
    );
}

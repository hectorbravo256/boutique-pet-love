
import { useEffect, useMemo, useState } from "react";

import ProductCard from "../shared/ProductCard";
import ProductVariantSelector from "./ProductVariantSelector";
import QuantityInput from "../../shared/ui/QuantityInput";
import CurrencyInput from "../../shared/ui/CurrencyInput";

export default function PurchaseProductSelector({
    products = [],
    variants = [],
    detail,
    setDetail,
    loadVariants,
    addProduct,
    loadVariantSummary
}) {
    const [categoria, setCategoria] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const selectedProduct = products.find(
        (p) => String(p.id) === String(detail.product_id)
    );

    const categorias = useMemo(
        () =>
            [...new Set(products.map((p) => p.category).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b)),
        [products]
    );

    const productosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();

        return products.filter((p) => {
            const coincideCategoria =
                !categoria || p.category === categoria;

            const coincideNombre =
                !termino || p.name.toLowerCase().includes(termino);

            return coincideCategoria && coincideNombre;
        });
    }, [products, categoria, busqueda]);

    useEffect(() => {
        if (!detail.product_id) return;

        loadVariants(detail.product_id);
    }, [detail.product_id]);

    const seleccionarProducto = (product) => {
        setDetail({
            ...detail,
            product_id: product.id,
            variant_id: "",
            quantity: 1,
            unit_cost: 0
        });
    };

    const cambiarProducto = () => {
        setDetail({
            ...detail,
            product_id: "",
            variant_id: "",
            quantity: 1,
            unit_cost: 0
        });

        setBusqueda("");
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">

            {!selectedProduct ? (
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
                                className="text-sm font-semibold text-pink-600"
                            >
                                Limpiar búsqueda
                            </button>
                        )}
                    </div>

                    {productosFiltrados.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {productosFiltrados.map((product) => {
                                const image =
                                    product.product_images?.[0]?.url;

                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => seleccionarProducto(product)}
                                        className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-2 text-center transition hover:border-pink-400 hover:bg-pink-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        title={`Seleccionar ${product.name}`}
                                    >
                                        <img
                                            src={image || "/placeholder-product.png"}
                                            alt={product.name}
                                            loading="lazy"
                                            className="aspect-square w-full rounded-xl bg-slate-100 object-cover"
                                        />

                                        <span className="mt-2 block text-sm font-semibold leading-snug text-slate-800 group-hover:text-pink-700">
                                            {product.name}
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
                <div className="space-y-6">
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
                            <ProductCard product={selectedProduct} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="mb-6">
                                <label className="mb-3 block text-sm font-semibold">
                                    Talla
                                </label>

                                <ProductVariantSelector
                                    variants={variants}
                                    selected={detail.variant_id}
                                    onSelect={async (variant) => {
                                        setDetail({
                                            ...detail,
                                            variant_id: variant.id
                                        });

                                        await loadVariantSummary(variant.id);
                                    }}
                                />
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Cantidad
                                    </label>

                                    <QuantityInput
                                        size="lg"
                                        value={detail.quantity}
                                        onChange={(value) =>
                                            setDetail({
                                                ...detail,
                                                quantity: value
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Costo unitario
                                    </label>

                                    <CurrencyInput
                                        value={detail.unit_cost}
                                        onChange={(value) =>
                                            setDetail({
                                                ...detail,
                                                unit_cost: value
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {detail.variant_id && (
                                <div className="mb-6 rounded-xl bg-pink-50 p-4">
                                    <p className="font-semibold text-slate-800">
                                        {selectedProduct.name}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        Talla seleccionada · Subtotal de compra: $
                                        {(
                                            Number(detail.quantity || 0) *
                                            Number(detail.unit_cost || 0)
                                        ).toLocaleString("es-CL")}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addProduct}
                                className="h-14 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 text-lg font-bold text-white shadow-lg transition hover:scale-[1.01]"
                            >
                                + Agregar producto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

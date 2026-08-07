import { useEffect } from "react";

import ProductCard from "./ProductCard";
import ProductVariantSelector from "./ProductVariantSelector";

export default function PurchaseProductSelector({

    products,
    variants,

    detail,
    setDetail,

    loadVariants,

    addProduct,

    variantSummary,
    loadVariantSummary

}) {

    //------------------------------------
    // Cargar variantes cuando cambia
    //------------------------------------

    useEffect(() => {

        if (!detail.product_id) return;

        loadVariants(detail.product_id);

    }, [detail.product_id]);

    //------------------------------------

    const selectedProduct = products.find(

        p => p.id == detail.product_id

    );

    return (

        <div className="space-y-6">

            <div className="rounded-2xl border bg-white p-6">

                <div className="flex gap-8">

                    {/* ==========================
                        Columna izquierda
                    =========================== */}

                    <ProductCard

                        product={selectedProduct}

                    />

                    {/* ==========================
                        Columna derecha
                    =========================== */}

                    <div className="flex-1 space-y-6">

                        {/* Producto */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Producto

                            </label>

                            <select

                                value={detail.product_id}

                                onChange={(e) =>

                                    setDetail({

                                        ...detail,

                                        product_id: e.target.value,

                                        variant_id: ""

                                    })

                                }

                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    p-3
                                "

                            >

                                <option value="">

                                    Seleccionar producto

                                </option>

                                {

                                    products.map(product => (

                                        <option

                                            key={product.id}

                                            value={product.id}

                                        >

                                            {product.name}

                                        </option>

                                    ))

                                }

                            </select>

                        </div>

                        {/* Tallas */}

                        <div>

                            <label className="block text-sm font-semibold mb-3">

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

                                    await loadVariantSummary(

                                        variant.id

                                    );

                                }}

                            />

                        </div>

                    </div>

                </div>

            </div>

            {/* Cantidad + Costo */}

            <div className="grid grid-cols-2 gap-4">

                <input

                    type="number"

                    min="1"

                    value={detail.quantity}

                    onChange={(e) =>

                        setDetail({

                            ...detail,

                            quantity: Number(e.target.value)

                        })

                    }

                    className="
                        rounded-xl
                        border
                        p-3
                    "

                    placeholder="Cantidad"

                />

                <input

                    type="number"

                    min="0"

                    value={detail.unit_cost}

                    onChange={(e) =>

                        setDetail({

                            ...detail,

                            unit_cost: Number(e.target.value)

                        })

                    }

                    className="
                        rounded-xl
                        border
                        p-3
                    "

                    placeholder="Costo unitario"

                />

            </div>

            <button

                onClick={addProduct}

                className="
                    w-full
                    rounded-xl
                    bg-pink-500
                    hover:bg-pink-600
                    text-white
                    font-bold
                    py-4
                    transition-all
                "

            >

                ➕ Agregar producto

            </button>

        </div>

    );

}

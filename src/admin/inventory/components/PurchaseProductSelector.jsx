import { useEffect } from "react";

import ProductCard from "../shared/ProductCard";
import ProductVariantSelector from "./ProductVariantSelector";
import QuantityInput from "../../shared/ui/QuantityInput";

export default function PurchaseProductSelector({
    products,
    variants,

    detail,
    setDetail,

    loadVariants,

    addProduct,

    loadVariantSummary
}) {

    //----------------------------------------
    // Producto seleccionado
    //----------------------------------------

    const selectedProduct = products.find(
        p => p.id == detail.product_id
    );

    //----------------------------------------
    // Cargar variantes
    //----------------------------------------

    useEffect(() => {

        if (!detail.product_id) return;

        loadVariants(detail.product_id);

    }, [detail.product_id]);

    //----------------------------------------

    return (

        <div className="rounded-3xl border bg-white p-8">

            <div className="flex gap-8 items-start">

                {/*======================================
                    COLUMNA IZQUIERDA
                ======================================*/}

                <div className="shrink-0">

                    <ProductCard

                        product={selectedProduct}

                    />

                </div>

                {/*======================================
                    COLUMNA DERECHA
                ======================================*/}

                <div className="flex-1">

                    {/* Producto */}

                    <div className="mb-6">

                        <label className="block mb-2 text-sm font-semibold">

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

                    <div className="mb-8">

                        <label className="block mb-3 text-sm font-semibold">

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

                    {/* Cantidad + Costo */}

                    <div className="grid grid-cols-2 gap-5 mb-8">

                        <div>

                            <label className="block mb-2 text-sm font-semibold">

                                Cantidad

                            </label>

<QuantityInput

    value={detail.quantity}

    onChange={(value)=>

        setDetail({

            ...detail,

            quantity: value

        })

    }

/>

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-semibold">

                                Costo Unitario

                            </label>

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
                                    w-full
                                    rounded-xl
                                    border
                                    p-3
                                "

                            />

                        </div>

                    </div>

                    {/* Botón */}

                    <button

                        onClick={addProduct}

                        className="
                            w-full
                            h-14
                            rounded-2xl
                            bg-gradient-to-r
                            from-pink-500
                            to-fuchsia-600
                            text-white
                            text-lg
                            font-bold
                            shadow-lg
                            hover:scale-[1.01]
                            transition-all
                        "

                    >

                        ➕ Agregar producto

                    </button>

                </div>

            </div>

        </div>

    );

}

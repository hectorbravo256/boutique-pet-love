import { useEffect } from "react";

export default function PurchaseProductSelector({

    products,
    variants,

    detail,
    setDetail,

    loadVariants,

    addProduct,

    variantSummary,
    loadVariantSummary

}) 
{
    

    //------------------------------------
    // Cuando cambia el producto
    //------------------------------------

    useEffect(() => {

        if (!detail.product_id) return;

        loadVariants(detail.product_id);

    }, [detail.product_id]);

    //------------------------------------

    return (

        <div className="grid md:grid-cols-5 gap-4">

            {/* Producto */}

            <select

                value={detail.product_id}

                onChange={(e)=>

                    setDetail({

                        ...detail,

                        product_id:e.target.value,

                        variant_id:""

                    })

                }

                className="border rounded-xl p-3"

            >

                <option value="">

                    Producto

                </option>

                {

                    products.map(product=>(

                        <option

                            key={product.id}

                            value={product.id}

                        >

                            {product.name}

                        </option>

                    ))

                }

            </select>

            {/* Variante */}

            <select

    value={detail.variant_id}

    onChange={async (e) => {

        const value = e.target.value;

        setDetail({

            ...detail,

            variant_id: value

        });

        await loadVariantSummary(value);

    }}

>


                <option value="">

                    Talla

                </option>

                {

                    variants.map(v=>(

                        <option

                            key={v.id}

                            value={v.id}

                        >

                            {v.size}

                        </option>

                    ))

                }

            </select>

                            {variantSummary && (

    <pre className="mt-4 text-xs bg-slate-100 p-4 rounded-xl">

        {JSON.stringify(variantSummary, null, 2)}

    </pre>

)}

            {/* Cantidad */}

            <input

                type="number"

                min="1"

                value={detail.quantity}

                onChange={(e)=>

                    setDetail({

                        ...detail,

                        quantity:Number(e.target.value)

                    })

                }

                className="border rounded-xl p-3"

            />

            {/* Costo */}

            <input

                type="number"

                min="0"

                value={detail.unit_cost}

                onChange={(e)=>

                    setDetail({

                        ...detail,

                        unit_cost:Number(e.target.value)

                    })

                }

                className="border rounded-xl p-3"

            />

            {/* Botón */}

<button

    onClick={addProduct}

    className="
        rounded-xl
        bg-pink-500
        hover:bg-pink-600
        text-white
        font-bold
        transition-all
    "

>

    + Agregar

</button>

        </div>

    );

}

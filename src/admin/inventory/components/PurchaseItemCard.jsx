import QuantityInput from "../../shared/ui/QuantityInput";
import CurrencyInput from "../../shared/ui/CurrencyInput";

export default function PurchaseItemCard({

    item,

    index,

    updateQuantity,

    updateCost,

    removeItem

}) {

    const subtotal =
        Number(item.quantity) *
        Number(item.unit_cost);

    return (

        <div
            className="
                bg-white
                border
                rounded-2xl
                px-5
                py-3
                shadow-sm
                hover:shadow-md
                transition-all
            "
        >

            <div className="flex items-center gap-5">

                {/* Imagen */}

                <div className="flex-shrink-0">

                    <img

                        src={
                            item.image ||
                            "/placeholder-product.png"
                        }

                        alt={item.product_name}

                        className="
                            w-16
                            h-16
                            rounded-xl
                            object-cover
                            border
                        "

                    />

                </div>

                {/* Producto */}

                <div className="flex-1 min-w-[220px]">

                    <h3 className="font-bold leading-tight">

                        {item.product_name}

                    </h3>

                    <div className="text-xs text-slate-500 mt-1">

                        {item.sku || "Sin SKU"}

                    </div>

                </div>

                {/* Talla */}

                <div className="w-24 flex justify-center">

                    <span
                        className="
                            inline-flex
                            px-3
                            py-1
                            rounded-full
                            bg-pink-100
                            text-pink-600
                            font-semibold
                            text-sm
                        "
                    >

                        {item.size}

                    </span>

                </div>

                {/* Cantidad */}

<div className="w-[160px]">

    <QuantityInput

        value={item.quantity}

        onChange={(value)=>

            updateQuantity(

                index,

                value

            )

        }

    />

</div>

                {/* Costo */}

                <div className="w-[170px]">

                    <CurrencyInput

                        value={item.unit_cost}

                        onChange={(value)=>

                            updateCost(

                                index,

                                value

                            )

                        }

                    />

                </div>

                {/* Subtotal */}

                <div className="w-[150px]">

                    <div
                        className="
                            h-12
                            rounded-xl
                            bg-slate-100
                            flex
                            items-center
                            justify-center
                            font-black
                        "
                    >

                        $

                        {subtotal.toLocaleString("es-CL")}

                    </div>

                </div>

                {/* Eliminar */}

                <div className="w-12 flex justify-center flex-shrink-0">

                    <button

                        onClick={()=>

                            removeItem(index)

                        }

                        className="
                            w-10
                            h-10
                            rounded-full
                            hover:bg-red-50
                            text-red-500
                            hover:text-red-700
                            transition
                        "

                    >

                        🗑️

                    </button>

                </div>

            </div>

        </div>

    );

}

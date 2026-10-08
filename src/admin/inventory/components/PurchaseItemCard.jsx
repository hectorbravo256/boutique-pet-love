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
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                transition-all
                hover:shadow-md
            "
        >

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    lg:grid-cols-[56px_minmax(120px,1fr)_68px_120px_130px_100px_40px]
                    lg:items-center
                "
            >

                {/* IMAGEN */}

                <div className="flex justify-center lg:justify-start">
                    <img
                        src={
                            item.image ||
                            "/placeholder-product.png"
                        }
                        alt={item.product_name}
                        className="
                            h-16
                            w-16
                            rounded-xl
                            border
                            object-cover
                        "
                    />
                </div>


                {/* PRODUCTO */}

                <div className="min-w-0">
                    <h3
                        className="
                            break-words
                            font-bold
                            leading-tight
                            text-slate-900
                        "
                    >
                        {item.product_name}
                    </h3>

                    <div className="mt-1 text-xs text-slate-500">
                        {item.sku || "Sin SKU"}
                    </div>
                </div>


                {/* TALLA */}

                <div className="flex justify-start lg:justify-center">
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-pink-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-pink-600
                        "
                    >
                        Talla {item.size}
                    </span>
                </div>


                {/* CANTIDAD */}

                <div className="w-full">
                    <QuantityInput
                        value={item.quantity}
                        onChange={(value) =>
                            updateQuantity(
                                index,
                                value
                            )
                        }
                    />
                </div>


                {/* COSTO */}

                <div className="w-full">
                    <CurrencyInput
                        value={item.unit_cost}
                        onChange={(value) =>
                            updateCost(
                                index,
                                value
                            )
                        }
                    />
                </div>


{/* SUBTOTAL */}

<div
    className="
        flex
        h-12
        items-center
        justify-center
        rounded-xl
        bg-slate-100
        px-3
        font-black
        text-slate-900
    "
>
    ${subtotal.toLocaleString("es-CL")}
</div>


{/* ELIMINAR */}

<div className="flex justify-center">

    <button
        type="button"
        onClick={() =>
            removeItem(index)
        }
        className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-red-200
            bg-red-50
            text-red-500
            transition
            hover:border-red-300
            hover:bg-red-100
            hover:text-red-700
        "
        title="Eliminar producto"
        aria-label="Eliminar producto"
    >
        🗑️
    </button>

</div>

            </div>

        </div>
    );
}

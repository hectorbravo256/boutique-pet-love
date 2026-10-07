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
                    lg:grid-cols-[64px_minmax(140px,1fr)_70px_130px_145px_42px]
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


                {/* SUBTOTAL + ELIMINAR */}

                <div className="flex items-center justify-between gap-2 lg:contents">

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
                        $
                        {subtotal.toLocaleString("es-CL")}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            removeItem(index)
                        }
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-red-500
                            transition
                            hover:bg-red-50
                            hover:text-red-700
                        "
                        title="Eliminar producto"
                    >
                        🗑️
                    </button>

                </div>

            </div>

        </div>
    );
}

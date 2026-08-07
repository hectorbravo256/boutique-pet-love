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
        item.quantity * item.unit_cost;

    return (

        <div
            className="
                bg-white
                rounded-3xl
                border
                shadow-sm
                p-6
                hover:shadow-md
                transition-all
            "
        >

            <div className="flex gap-6">

                {/* Imagen */}

                <img

                    src={
                        item.image ||
                        "/placeholder-product.png"
                    }

                    alt={item.product_name}

                    className="
                        w-28
                        h-28
                        rounded-2xl
                        object-cover
                        border
                    "

                />

                {/* Información */}

                <div className="flex-1">

                    <div className="flex justify-between">

                        <div>

                            <h3 className="text-xl font-black">

                                {item.product_name}

                            </h3>

                            <p className="text-slate-500">

                                SKU {item.sku}

                            </p>

                            <span
                                className="
                                    inline-block
                                    mt-2
                                    px-3
                                    py-1
                                    rounded-full
                                    bg-pink-100
                                    text-pink-600
                                    text-sm
                                    font-semibold
                                "
                            >

                                {item.size}

                            </span>

                        </div>

                        <button

                            onClick={()=>

                                removeItem(index)

                            }

                            className="
                                text-red-500
                                hover:text-red-700
                                text-2xl
                            "

                        >

                            🗑️

                        </button>

                    </div>

                    <div
                        className="
                            grid
                            grid-cols-3
                            gap-5
                            mt-6
                        "
                    >

                        <div>

                            <label
                                className="
                                    text-sm
                                    font-semibold
                                    mb-2
                                    block
                                "
                            >

                                Cantidad

                            </label>

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

                        <div>

                            <label
                                className="
                                    text-sm
                                    font-semibold
                                    mb-2
                                    block
                                "
                            >

                                Costo

                            </label>

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

                        <div>

                            <label
                                className="
                                    text-sm
                                    font-semibold
                                    mb-2
                                    block
                                "
                            >

                                Subtotal

                            </label>

                            <div
                                className="
                                    h-12
                                    flex
                                    items-center
                                    px-4
                                    rounded-xl
                                    bg-slate-100
                                    font-black
                                    text-xl
                                "
                            >

                                $

                                {subtotal.toLocaleString("es-CL")}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

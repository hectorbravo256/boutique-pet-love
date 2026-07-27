import { useEffect, useState } from "react";
import AdminCard from "../components/AdminCard";

export default function InventoryEditor({

    item,

    onClose

}) {

    if (!item) return null;

    const [stock, setStock] = useState(item.stock);
    const [price, setPrice] = useState(item.sale_price);

useEffect(() => {
    setStock(item.stock);
    setPrice(item.sale_price);
}, [item]);

    return (

        <AdminCard>

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-black">
    Detalle de Variante
</h2>

                <button

                    onClick={onClose}

                    className="
                        px-4
                        py-2
                        rounded-xl
                        bg-slate-100
                    "

                >

                    ✕

                </button>

            </div>

<div className="space-y-6">

    <div className="flex gap-4 items-center">

        <img
            src={item.image}
            alt={item.product_name}
            className="w-24 h-24 rounded-2xl object-cover"
        />

        <div>

            <h3 className="text-xl font-bold">
                {item.product_name}
            </h3>

            <p className="text-slate-500">
                {item.category}
            </p>

        </div>

    </div>

    <div className="bg-slate-50 rounded-xl p-4">

        <label className="text-xs text-slate-500">
            Talla
        </label>

        <div className="text-lg font-bold mt-1">
            {item.size}
        </div>

    </div>

    <div className="bg-slate-50 rounded-xl p-4">

        <label className="text-xs text-slate-500">
            Stock
        </label>

        <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="
                mt-2
                w-full
                border
                rounded-xl
                p-3
            "
        />

    </div>

    <div className="bg-slate-50 rounded-xl p-4">

        <label className="text-xs text-slate-500">
            Precio
        </label>

        <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="
                mt-2
                w-full
                border
                rounded-xl
                p-3
            "
        />

    </div>

    <div>

        <label className="text-xs text-slate-500">
            Estado
        </label>

        <div className="mt-2">

            <span
                className={`
                    inline-flex
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold

                    ${
                        item.status === "OK"
                            ? "bg-green-100 text-green-700"

                        : item.status === "CRITICO"
                            ? "bg-orange-100 text-orange-700"

                        : "bg-red-100 text-red-700"
                    }
                `}
            >
                {item.status}
            </span>

        </div>

    </div>

    <div className="flex gap-3 pt-4">

        <button
            className="
                flex-1
                bg-pink-600
                hover:bg-pink-700
                text-white
                rounded-xl
                py-3
                font-bold
                transition
            "
        >
            Guardar cambios
        </button>

        <button
            onClick={onClose}
            className="
                px-5
                rounded-xl
                border
                hover:bg-slate-100
                transition
            "
        >
            Cancelar
        </button>

    </div>

</div>

        </AdminCard>

    );

}

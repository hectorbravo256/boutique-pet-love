import { useEffect, useState } from "react";
import AdminCard from "../components/AdminCard";

export default function InventoryEditor({

    item,

    onClose

}) {

    const [stock, setStock] = useState(item.stock);
    const [price, setPrice] = useState(item.sale_price);

useEffect(() => {
    setStock(item.stock);
    setPrice(item.sale_price);
}, [item]);

    
    if (!item) return null;


    return (

        <AdminCard className="h-full flex flex-col overflow-hidden">

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

<div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6">

<div
    className="
        bg-white
        rounded-2xl
        border
        p-5
        flex
        gap-4
        items-center
    "
>

        <img
            src={item.image}
            alt={item.product_name}
            className="
    w-28
    h-28
    flex-shrink-0
    rounded-3xl
    object-cover
    shadow-md
"
        />

        <div>

<h3
    className="
        text-2xl
        font-bold
        leading-tight
        break-words
    "
>
    {item.product_name}
</h3>

<p className="text-slate-500 mt-1">
    {item.category}
</p>

        </div>

    </div>

    <div className="
    bg-slate-50
    rounded-2xl
    p-5
    space-y-5
">

    <h4 className="
    text-xs
    uppercase
    tracking-widest
    text-slate-400
    font-bold
">
    Información
</h4>
    

        <label className="text-xs text-slate-500">
            Talla
        </label>

        <div className="text-lg font-bold mt-1">
            {item.size}
        </div>


    <h4 className="
    text-xs
    uppercase
    tracking-widest
    text-slate-400
    font-bold
">
    Edición
</h4>


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
    rounded-xl
    border
    border-slate-300
    px-4
    py-3
    text-lg
    font-semibold
    focus:border-pink-500
    focus:ring-2
    focus:ring-pink-200
    outline-none
    transition
"
        />


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
    rounded-xl
    border
    border-slate-300
    px-4
    py-3
    text-lg
    font-semibold
    focus:border-pink-500
    focus:ring-2
    focus:ring-pink-200
    outline-none
    transition
"
        />


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
    bg-gradient-to-r
    from-pink-500
    to-fuchsia-600
    text-white
    rounded-xl
    py-3
    font-bold
    shadow-lg
    hover:shadow-xl
    hover:scale-[1.02]
    transition-all
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

    </div>
            
        </AdminCard>

    );

}

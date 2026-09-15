export default function ItemsVenta({
    items,
    eliminarItem,
    moneda
}) {

    if (items.length === 0) {

        return (
            <div className="
                border
                border-dashed
                border-slate-300
                rounded-2xl
                p-6
                text-center
                text-slate-400
            ">
                No hay productos agregados.
            </div>
        );

    }

    return (
        <div className="
            space-y-3
            mb-6
        ">

            {items.map(item => (

                <div
                    key={item.variant_id}
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border
                        border-slate-200
                        rounded-2xl
                        p-4
                        bg-white
                    "
                >

                    <div className="flex-1">

                        <p className="
                            font-bold
                            text-slate-700
                        ">
                            {item.name}
                        </p>

                        <p className="
                            text-sm
                            text-slate-500
                        ">
                            Talla: {item.size}
                        </p>

                    </div>

                    <div className="
                        text-center
                    ">

                        <p className="
                            text-sm
                            text-slate-500
                        ">
                            Cantidad
                        </p>

                        <p className="
                            font-bold
                            text-slate-700
                        ">
                            {item.quantity}
                        </p>

                    </div>

                    <div className="
                        text-right
                    ">

                        <p className="
                            text-sm
                            text-slate-500
                        ">
                            Subtotal
                        </p>

                        <p className="
                            font-bold
                            text-slate-700
                        ">
                            {moneda(
                                Number(item.price) *
                                Number(item.quantity)
                            )}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            eliminarItem(
                                item.variant_id
                            )
                        }
                        className="
                            px-3
                            py-2
                            rounded-xl
                            bg-red-50
                            text-red-600
                            font-bold
                            hover:bg-red-100
                        "
                    >
                        Eliminar
                    </button>

                </div>

            ))}

        </div>
    );
}

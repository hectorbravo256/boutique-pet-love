import SectionStep from "./SectionStep";


export default function ItemsVenta({
    numero,
    items,
    eliminarItem,
    moneda
}) {

    return (

        <section className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            md:p-6
            shadow-sm
        ">

            <SectionStep
                numero={numero}
                titulo="Detalle de la venta"
                descripcion="Revisa los productos antes de registrar."
            />


            {/* =====================================================
                SIN PRODUCTOS
            ===================================================== */}

            {items.length === 0 ? (

                <div className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    px-6
                    py-10
                    text-center
                ">

                    <div className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-pink-100
                        text-2xl
                    ">
                        🛒
                    </div>


                    <p className="
                        mt-4
                        text-sm
                        font-black
                        text-slate-700
                    ">
                        No hay productos agregados
                    </p>


                    <p className="
                        mt-1
                        max-w-sm
                        text-xs
                        leading-relaxed
                        text-slate-500
                    ">
                        Agrega productos desde la sección anterior
                        para comenzar a preparar la venta.
                    </p>

                </div>

            ) : (

                <div className="
                    space-y-3
                ">

                    {/* =================================================
                        ENCABEZADO TABLA — DESKTOP
                    ================================================= */}

                    <div className="
                        hidden
                        md:grid
                        md:grid-cols-[minmax(0,1fr)_100px_90px_120px_44px]
                        md:items-center
                        md:gap-4
                        md:rounded-2xl
                        md:bg-slate-50
                        md:px-4
                        md:py-3
                    ">

                        <span className="
                            text-xs
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">
                            Producto
                        </span>


                        <span className="
                            text-center
                            text-xs
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">
                            Talla
                        </span>


                        <span className="
                            text-center
                            text-xs
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">
                            Cantidad
                        </span>


                        <span className="
                            text-right
                            text-xs
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">
                            Subtotal
                        </span>


                        <span />

                    </div>


                    {/* =================================================
                        PRODUCTOS
                    ================================================= */}

                    {items.map((item, index) => {

                        const subtotal =
                            Number(item.price || 0) *
                            Number(item.quantity || 0);


                        return (

                            <div
                                key={
                                    item.id ||
                                    `${item.product_id}-${item.variant_id}-${index}`
                                }
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
                                    shadow-sm
                                    transition
                                    hover:border-pink-200
                                    hover:shadow-md
                                "
                            >

                                {/* DESKTOP */}

                                <div className="
                                    hidden
                                    md:grid
                                    md:grid-cols-[minmax(0,1fr)_100px_90px_120px_44px]
                                    md:items-center
                                    md:gap-4
                                ">

                                    {/* PRODUCTO */}

                                    <div className="
                                        min-w-0
                                    ">

                                        <p className="
                                            truncate
                                            text-sm
                                            font-black
                                            text-slate-800
                                        ">
                                            {item.name}
                                        </p>


                                        <p className="
                                            mt-1
                                            text-xs
                                            text-slate-500
                                        ">
                                            {moneda(item.price)} por unidad
                                        </p>

                                    </div>


                                    {/* TALLA */}

                                    <div className="
                                        text-center
                                    ">

                                        <span className="
                                            inline-flex
                                            rounded-full
                                            bg-pink-50
                                            px-3
                                            py-1
                                            text-xs
                                            font-black
                                            text-pink-600
                                        ">
                                            {item.size}
                                        </span>

                                    </div>


                                    {/* CANTIDAD */}

                                    <div className="
                                        text-center
                                    ">

                                        <span className="
                                            text-sm
                                            font-black
                                            text-slate-700
                                        ">
                                            {item.quantity}
                                        </span>

                                    </div>


                                    {/* SUBTOTAL */}

                                    <div className="
                                        text-right
                                    ">

                                        <p className="
                                            text-sm
                                            font-black
                                            text-slate-800
                                        ">
                                            {moneda(subtotal)}
                                        </p>

                                    </div>


                                    {/* ELIMINAR */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            eliminarItem(item.variant_id)
                                        }
                                        className="
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-lg
                                            text-slate-400
                                            transition
                                            hover:bg-red-50
                                            hover:text-red-500
                                        "
                                        title="Eliminar producto"
                                    >
                                        ×
                                    </button>

                                </div>


                                {/* MOBILE */}

                                <div className="
                                    md:hidden
                                ">

                                    <div className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                    ">

                                        <div className="
                                            min-w-0
                                            flex-1
                                        ">

                                            <p className="
                                                text-sm
                                                font-black
                                                text-slate-800
                                            ">
                                                {item.name}
                                            </p>


                                            <p className="
                                                mt-1
                                                text-xs
                                                text-slate-500
                                            ">
                                                {moneda(item.price)} por unidad
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                eliminarItem(item.variant_id)
                                            }
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                text-lg
                                                text-slate-400
                                                transition
                                                hover:bg-red-50
                                                hover:text-red-500
                                            "
                                            title="Eliminar producto"
                                        >
                                            ×
                                        </button>

                                    </div>


                                    <div className="
                                        mt-4
                                        grid
                                        grid-cols-3
                                        gap-2
                                    ">

                                        <div className="
                                            rounded-xl
                                            bg-slate-50
                                            px-3
                                            py-2
                                            text-center
                                        ">

                                            <p className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-slate-400
                                            ">
                                                Talla
                                            </p>

                                            <p className="
                                                mt-1
                                                text-xs
                                                font-black
                                                text-slate-700
                                            ">
                                                {item.size}
                                            </p>

                                        </div>


                                        <div className="
                                            rounded-xl
                                            bg-slate-50
                                            px-3
                                            py-2
                                            text-center
                                        ">

                                            <p className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-slate-400
                                            ">
                                                Cantidad
                                            </p>

                                            <p className="
                                                mt-1
                                                text-xs
                                                font-black
                                                text-slate-700
                                            ">
                                                {item.quantity}
                                            </p>

                                        </div>


                                        <div className="
                                            rounded-xl
                                            bg-pink-50
                                            px-3
                                            py-2
                                            text-center
                                        ">

                                            <p className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-pink-400
                                            ">
                                                Subtotal
                                            </p>

                                            <p className="
                                                mt-1
                                                text-xs
                                                font-black
                                                text-pink-600
                                            ">
                                                {moneda(subtotal)}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </section>

    );

}

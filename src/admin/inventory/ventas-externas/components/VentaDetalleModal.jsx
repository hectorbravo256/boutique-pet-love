export default function VentaDetalleModal({
    ventaSeleccionada,
    setVentaSeleccionada,
    imprimirComprobante,
    fechaVenta,
    etiquetaCanal,
    etiquetaPago,
    moneda
}) {

    if (!ventaSeleccionada) {
        return null;
    }

    return (

        <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
        ">

            <div className="
                max-h-[90vh]
                w-full
                max-w-3xl
                overflow-y-auto
                rounded-3xl
                bg-white
                shadow-2xl
            ">

                {/* CABECERA */}

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    border-b
                    border-slate-200
                    px-6
                    py-5
                ">

                    <div>

                        <p className="
                            text-xs
                            uppercase
                            tracking-wider
                            font-black
                            text-pink-500
                        ">
                            Detalle de venta
                        </p>

                        <h2 className="
                            text-2xl
                            font-black
                            text-slate-900
                            mt-1
                        ">
                            Venta #
                            {
                                ventaSeleccionada.numero_venta
                            }
                        </h2>

                    </div>


                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

                        <button
                            type="button"
                            onClick={() =>
                                imprimirComprobante(
                                    ventaSeleccionada
                                )
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-slate-900
                                px-4
                                py-2.5
                                text-sm
                                font-black
                                text-white
                                shadow-sm
                                transition
                                hover:bg-slate-700
                            "
                            title="Imprimir comprobante"
                        >

                            <span>
                                🖨️
                            </span>

                            <span className="
                                hidden
                                sm:inline
                            ">
                                Imprimir
                            </span>

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setVentaSeleccionada(
                                    null
                                )
                            }
                            className="
                                h-10
                                w-10
                                rounded-xl
                                bg-slate-100
                                font-bold
                                text-slate-500
                                hover:bg-red-50
                                hover:text-red-500
                            "
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                    </div>

                </div>


                <div className="p-6">

                    {/* DATOS PRINCIPALES */}

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                    ">

                        <div className="
                            rounded-2xl
                            bg-slate-50
                            p-4
                        ">

                            <p className="
                                text-xs
                                font-bold
                                text-slate-400
                            ">
                                Cliente
                            </p>

                            <p className="
                                mt-1
                                font-bold
                                text-slate-800
                            ">
                                {
                                    ventaSeleccionada.nombre ||
                                    "Sin nombre"
                                }
                            </p>

                        </div>


                        <div className="
                            rounded-2xl
                            bg-slate-50
                            p-4
                        ">

                            <p className="
                                text-xs
                                font-bold
                                text-slate-400
                            ">
                                Fecha
                            </p>

                            <p className="
                                mt-1
                                font-bold
                                text-slate-800
                            ">
                                {
                                    fechaVenta(
                                        ventaSeleccionada.created_at
                                    )
                                }
                            </p>

                        </div>


                        <div className="
                            rounded-2xl
                            bg-slate-50
                            p-4
                        ">

                            <p className="
                                text-xs
                                font-bold
                                text-slate-400
                            ">
                                Canal
                            </p>

                            <p className="
                                mt-1
                                font-bold
                                text-slate-800
                            ">
                                {
                                    etiquetaCanal(
                                        ventaSeleccionada.tipo_venta
                                    )
                                }
                            </p>

                        </div>


                        <div className="
                            rounded-2xl
                            bg-slate-50
                            p-4
                        ">

                            <p className="
                                text-xs
                                font-bold
                                text-slate-400
                            ">
                                Medio de pago
                            </p>

                            <p className="
                                mt-1
                                font-bold
                                text-slate-800
                            ">
                                {
                                    etiquetaPago(
                                        ventaSeleccionada.medio_pago
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* DATOS CLIENTE */}

                    {(ventaSeleccionada.rut ||
                        ventaSeleccionada.correo ||
                        ventaSeleccionada.telefono) && (

                        <div className="
                            mt-5
                            rounded-2xl
                            border
                            border-slate-200
                            p-5
                        ">

                            <h3 className="
                                font-black
                                text-slate-900
                            ">
                                Datos del cliente
                            </h3>


                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-3
                                gap-4
                                mt-4
                            ">

                                <div>

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">
                                        RUT
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                    ">
                                        {
                                            ventaSeleccionada.rut ||
                                            "-"
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">
                                        Correo
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        break-all
                                    ">
                                        {
                                            ventaSeleccionada.correo ||
                                            "-"
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">
                                        Teléfono
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                    ">
                                        {
                                            ventaSeleccionada.telefono ||
                                            "-"
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* PRODUCTOS */}

                    <div className="
                        mt-5
                        rounded-2xl
                        border
                        border-slate-200
                        overflow-hidden
                    ">

                        <div className="
                            bg-slate-50
                            px-5
                            py-4
                            font-black
                            text-slate-800
                        ">
                            Productos vendidos
                        </div>


                        {Array.isArray(
                            ventaSeleccionada.items
                        ) &&
                        ventaSeleccionada.items.length >
                            0 ? (

                            ventaSeleccionada.items.map(
                                (item, index) => {

                                    const itemCantidad =
                                        Number(
                                            item.quantity ??
                                            item.cantidad ??
                                            item.qty ??
                                            0
                                        );

                                    const itemPrecio =
                                        Number(
                                            item.price ??
                                            item.precio ??
                                            0
                                        );

                                    const nombre =
                                        item.name ??
                                        item.product_name ??
                                        item.nombre ??
                                        item.producto ??
                                        "Producto";

                                    const talla =
                                        item.size ??
                                        item.talla ??
                                        "-";

                                    return (

                                        <div
                                            key={
                                                index
                                            }
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                border-t
                                                border-slate-100
                                                px-5
                                                py-4
                                            "
                                        >

                                            <div>

                                                <div className="
                                                    font-bold
                                                    text-slate-800
                                                ">
                                                    {
                                                        nombre
                                                    }
                                                </div>

                                                <div className="
                                                    mt-1
                                                    text-sm
                                                    text-slate-500
                                                ">
                                                    Talla:{" "}
                                                    {
                                                        talla
                                                    }

                                                    {" · "}

                                                    Cantidad:{" "}
                                                    {
                                                        itemCantidad
                                                    }
                                                </div>

                                            </div>


                                            <strong className="
                                                whitespace-nowrap
                                                text-slate-900
                                            ">
                                                {
                                                    moneda(
                                                        itemPrecio *
                                                        itemCantidad
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    );

                                }
                            )

                        ) : (

                            <div className="
                                p-6
                                text-center
                                text-slate-400
                            ">
                                No hay detalle de productos
                                disponible.
                            </div>

                        )}

                    </div>


                    {/* VENDEDOR */}

                    <div className="
                        mt-5
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                    ">

                        <div className="
                            rounded-2xl
                            bg-slate-50
                            p-4
                        ">

                            <p className="
                                text-xs
                                font-bold
                                text-slate-400
                            ">
                                Vendedor
                            </p>

                            <p className="
                                mt-1
                                font-bold
                                text-slate-800
                            ">
                                {
                                    ventaSeleccionada.vendedor ||
                                    "-"
                                }
                            </p>

                        </div>


                        <div className="
                            rounded-2xl
                            bg-slate-900
                            p-4
                            text-white
                        ">

                            <p className="
                                text-xs
                                font-bold
                                text-white/60
                            ">
                                Total venta
                            </p>

                            <p className="
                                mt-1
                                text-2xl
                                font-black
                            ">
                                {
                                    moneda(
                                        ventaSeleccionada.total
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* OBSERVACIONES */}

                    {ventaSeleccionada.observacion && (

                        <div className="
                            mt-5
                            rounded-2xl
                            bg-slate-50
                            p-5
                        ">

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-400
                            ">
                                Observaciones
                            </p>

                            <p className="
                                mt-2
                                whitespace-pre-wrap
                                text-sm
                                text-slate-700
                            ">
                                {
                                    ventaSeleccionada.observacion
                                }
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}

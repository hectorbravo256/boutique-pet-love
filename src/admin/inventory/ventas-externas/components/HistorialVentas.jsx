export default function HistorialVentas({
    ventas,
    ventasFiltradas,
    busqueda,
    setBusqueda,
    filtroCanal,
    setFiltroCanal,
    filtroPago,
    setFiltroPago,
    actualizarHistorial,
    actualizando,
    fechaVenta,
    etiquetaCanal,
    etiquetaPago,
    moneda,
    setVentaSeleccionada
}) {

        const etiquetaEstado = (estado) => {

        switch (estado) {

            case "pendiente":
                return "Pendiente";

            case "completada":
                return "Completada";

            case "cancelada":
                return "Cancelada";

            default:
                return estado || "-";

        }

    };

    return (
        <div>

            <div className="
                flex
                flex-col
                gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
                mb-6
            ">

                <div>

                    <p className="
                        text-xs
                        uppercase
                        tracking-[0.2em]
                        text-pink-500
                        font-bold
                    ">
                        Control de ventas
                    </p>

                    <h2 className="
                        text-3xl
                        font-black
                        text-slate-900
                        mt-1
                    ">
                        📋 Historial de ventas externas
                    </h2>

                    <p className="
                        text-sm
                        text-slate-500
                        mt-2
                    ">
                        Ventas realizadas presencialmente
                        o mediante RRSS.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        actualizarHistorial
                    }
                    disabled={
                        actualizando
                    }
                    className="
                        px-5
                        py-3
                        rounded-xl
                        bg-slate-900
                        text-white
                        font-bold
                        hover:bg-slate-700
                        disabled:opacity-50
                    "
                >
                    {actualizando
                        ? "Actualizando..."
                        : "🔄 Actualizar"}
                </button>

            </div>


            {/* FILTROS */}

            <div className="
                grid
                grid-cols-1
                lg:grid-cols-[1fr_220px_220px]
                gap-4
                mb-6
            ">

                <input
                    value={
                        busqueda
                    }
                    onChange={e =>
                        setBusqueda(
                            e.target.value
                        )
                    }
                    placeholder="
                        Buscar por cliente, RUT,
                        teléfono o número de venta...
                    "
                    className="
                        border
                        border-slate-200
                        rounded-xl
                        p-3
                        outline-none
                        focus:ring-2
                        focus:ring-pink-300
                    "
                />


                <select
                    value={
                        filtroCanal
                    }
                    onChange={e =>
                        setFiltroCanal(
                            e.target.value
                        )
                    }
                    className="
                        border
                        border-slate-200
                        rounded-xl
                        p-3
                        bg-white
                    "
                >

                    <option value="todos">
                        Todos los canales
                    </option>

                    <option value="presencial">
                        🏪 Presencial
                    </option>

                    <option value="rrss">
                        📱 RRSS
                    </option>

                </select>


                <select
                    value={
                        filtroPago
                    }
                    onChange={e =>
                        setFiltroPago(
                            e.target.value
                        )
                    }
                    className="
                        border
                        border-slate-200
                        rounded-xl
                        p-3
                        bg-white
                    "
                >

                    <option value="todos">
                        Todos los pagos
                    </option>

                    <option value="efectivo">
                        💵 Efectivo
                    </option>

                    <option value="transferencia">
                        🏦 Transferencia
                    </option>

                    <option value="POS TUU">
                        💳 POS TUU
                    </option>

                    <option value="mercado_pago">
                        🟢 Mercado Pago
                    </option>

                </select>

            </div>


            {/* TABLA */}

            <div className="
                overflow-x-auto
                rounded-2xl
                border
                border-slate-200
            ">

                <table className="
                    w-full
                    min-w-[1050px]
                ">

                    <thead>

                        <tr className="
                            bg-slate-50
                            border-b
                            border-slate-200
                        ">

                            <th className="
                                px-4
                                py-4
                                text-left
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Venta
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-left
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Fecha
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-left
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Cliente
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-left
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Canal
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-left
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Pago
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-left
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Estado
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-right
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Total
                            </th>

                            <th className="
                                px-4
                                py-4
                                text-center
                                text-xs
                                uppercase
                                tracking-wider
                                font-black
                                text-slate-500
                            ">
                                Detalle
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {ventasFiltradas.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="
                                        px-6
                                        py-12
                                        text-center
                                        text-slate-400
                                    "
                                >
                                    No hay ventas que coincidan
                                    con los filtros.
                                </td>

                            </tr>

                        ) : (

                            ventasFiltradas.map(
                                venta => (

                                    <tr
                                        key={
                                            venta.id
                                        }
                                        className="
                                            border-b
                                            border-slate-100
                                            hover:bg-pink-50/30
                                        "
                                    >

                                        {/* VENTA */}

                                        <td className="
                                            px-4
                                            py-4
                                        ">

                                            <span className="
                                                font-black
                                                text-pink-600
                                            ">
                                                #
                                                {
                                                    venta.numero_venta
                                                }
                                            </span>

                                        </td>


                                        {/* FECHA */}

                                        <td className="
                                            px-4
                                            py-4
                                            whitespace-nowrap
                                            text-sm
                                            text-slate-600
                                        ">
                                            {
                                                fechaVenta(
                                                    venta.created_at
                                                )
                                            }
                                        </td>


                                        {/* CLIENTE */}

                                        <td className="
                                            px-4
                                            py-4
                                        ">

                                            <div className="
                                                font-bold
                                                text-slate-800
                                            ">
                                                {
                                                    venta.nombre ||
                                                    "Sin nombre"
                                                }
                                            </div>

                                            {venta.rut && (

                                                <div className="
                                                    text-xs
                                                    text-slate-400
                                                    mt-1
                                                ">
                                                    RUT:{" "}
                                                    {
                                                        venta.rut
                                                    }
                                                </div>

                                            )}

                                        </td>


                                        {/* CANAL */}

                                        <td className="
                                            px-4
                                            py-4
                                        ">

                                            <span className={`
                                                inline-flex
                                                rounded-full
                                                px-3
                                                py-1
                                                text-xs
                                                font-black

                                                ${
                                                    venta.tipo_venta ===
                                                    "rrss"
                                                        ? `
                                                            bg-green-100
                                                            text-green-700
                                                        `
                                                        : `
                                                            bg-blue-100
                                                            text-blue-700
                                                        `
                                                }
                                            `}>
                                                {
                                                    etiquetaCanal(
                                                        venta.tipo_venta
                                                    )
                                                }
                                            </span>

                                        </td>


                                        {/* PAGO */}

                                        <td className="
                                            px-4
                                            py-4
                                            text-sm
                                            font-semibold
                                            text-slate-600
                                        ">
                                            {
                                                etiquetaPago(
                                                    venta.medio_pago
                                                )
                                            }
                                        </td>


                                        {/* ESTADO */}

                                        <td className="
                                            px-4
                                            py-4
                                        ">

                                            <span
                                                className={`
                                                    inline-flex
                                                    rounded-full
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-black
                                            
                                                    ${
                                                        venta.estado === "pendiente"
                                                            ? `
                                                                bg-amber-100
                                                                text-amber-700
                                                            `
                                                            : venta.estado === "cancelada"
                                                                ? `
                                                                    bg-red-100
                                                                    text-red-700
                                                                `
                                                                : `
                                                                    bg-emerald-100
                                                                    text-emerald-700
                                                                `
                                                    }
                                                `}
                                            >
                                                {etiquetaEstado(venta.estado)}
                                            </span>

                                        </td>


                                        {/* TOTAL */}

                                        <td className="
                                            px-4
                                            py-4
                                            text-right
                                            whitespace-nowrap
                                        ">

                                            <strong className="
                                                text-slate-900
                                            ">
                                                {
                                                    moneda(
                                                        venta.total
                                                    )
                                                }
                                            </strong>

                                        </td>


                                        {/* DETALLE */}

                                        <td className="
                                            px-4
                                            py-4
                                            text-center
                                        ">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setVentaSeleccionada(
                                                        venta
                                                    )
                                                }
                                                className="
                                                    rounded-xl
                                                    bg-slate-100
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    font-bold
                                                    text-slate-700
                                                    hover:bg-pink-100
                                                    hover:text-pink-600
                                                "
                                            >
                                                👁 Ver
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* RESUMEN FILTRADO */}

            <div className="
                mt-4
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:justify-between
                text-sm
                text-slate-500
            ">

                <span>
                    Mostrando{" "}
                    <strong className="
                        text-slate-800
                    ">
                        {
                            ventasFiltradas.length
                        }
                    </strong>{" "}
                    de{" "}
                    <strong className="
                        text-slate-800
                    ">
                        {
                            ventas.length
                        }
                    </strong>{" "}
                    ventas
                </span>


                <span>
                    Total filtrado:{" "}

                    <strong className="
                        text-slate-900
                    ">
                        {
                            moneda(
                                ventasFiltradas.reduce(
                                    (sum, venta) =>
                                        sum +
                                        Number(
                                            venta.total ||
                                            0
                                        ),
                                    0
                                )
                            )
                        }
                    </strong>

                </span>

            </div>

        </div>
    );
}

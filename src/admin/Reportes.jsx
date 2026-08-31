import React from "react";
import useReportes from "./shared/hooks/useReportes";
import { formatearFechaChile } from "./utils/fechaChile";

const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
};

const normalizarFechaUTC = (fecha) => {

    if (!fecha) {
        return null;
    }

    const fechaTexto = String(fecha);

    /*
     * Si ya contiene zona horaria, no modificar.
     */
    if (
        fechaTexto.endsWith("Z") ||
        /[+-]\d{2}:\d{2}$/.test(fechaTexto)
    ) {
        return fechaTexto;
    }

    /*
     * fecha_venta proviene de orders y representa UTC.
     * Se agrega Z para que JavaScript lo interprete correctamente.
     */
    return `${fechaTexto}Z`;
};


const formatDate = (value) => {

    const fechaUTC =
        normalizarFechaUTC(value);

    return formatearFechaChile(fechaUTC);
};

const getTipoVentaLabel = (tipoVenta) => {
    if (!tipoVenta) return "-";

    const value = String(tipoVenta).toLowerCase();

    if (value === "online" || value === "web") {
        return "Online";
    }

    if (value === "rrss") {
    return "RRSS";
}

    if (value === "presencial" || value === "tienda") {
        return "Presencial";
    }

    return tipoVenta;
};

const getMedioPagoLabel = (medioPago) => {
    if (!medioPago) return "-";

    const value = String(medioPago).toLowerCase();

    if (value.includes("mercado")) {
        return "Mercado Pago";
    }

    if (value.includes("transfer")) {
        return "Transferencia";
    }

    if (value.includes("efect")) {
        return "Efectivo";
    }

    if (value === "debito") {
    return "POS TUU";
}

    return medioPago;
};

export default function Reportes() {

    const {
        filters,
        updateFilter,
        resetFilters,
        sales,
        totalSales,
        totalOrders,
        averageTicket,
        loading,
        error,
        reload
    } = useReportes();

    const summaryByTipoVenta = sales.reduce((acc, sale) => {
        const tipo = getTipoVentaLabel(sale.tipo_venta);

        if (!acc[tipo]) {
            acc[tipo] = {
                tipo,
                cantidad: 0,
                total: 0
            };
        }

        acc[tipo].cantidad += 1;
        acc[tipo].total += Number(sale.total || 0);

        return acc;
    }, {});

    const tipoVentaOrder = [
        "Online",
        "RRSS",
        "Presencial"
    ];

    const resumenTipos = tipoVentaOrder
        .map((tipo) => summaryByTipoVenta[tipo])
        .filter(Boolean);
    
        const summaryByMedioPago = sales.reduce((acc, sale) => {
        const medio = getMedioPagoLabel(sale.medio_pago);

        if (!acc[medio]) {
            acc[medio] = {
                medio,
                cantidad: 0,
                total: 0
            };
        }

        acc[medio].cantidad += 1;
        acc[medio].total += Number(sale.total || 0);

        return acc;
    }, {});

    const medioPagoOrder = [
        "Mercado Pago",
        "Transferencia",
        "POS TUU",
        "Efectivo"
    ];

    const resumenMediosPago = medioPagoOrder
        .map((medio) => summaryByMedioPago[medio])
        .filter(Boolean);

    return (
        <div className="space-y-6">

            {/* ENCABEZADO */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Reportes
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Análisis de ventas contabilizadas según estado de pago.
                </p>
            </div>


            {/* FILTROS */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Filtros
                    </h2>

                    <p className="text-sm text-gray-500">
                        Ajusta el período y los criterios del reporte.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                    {/* FECHA DESDE */}
                    <div>
                        <label
                            htmlFor="reportes-from"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Desde
                        </label>

                        <input
                            id="reportes-from"
                            type="date"
                            value={filters.from}
                            onChange={(event) =>
                                updateFilter("from", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                        />
                    </div>


                    {/* FECHA HASTA */}
                    <div>
                        <label
                            htmlFor="reportes-to"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Hasta
                        </label>

                        <input
                            id="reportes-to"
                            type="date"
                            value={filters.to}
                            onChange={(event) =>
                                updateFilter("to", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                        />
                    </div>


                    {/* TIPO DE VENTA */}
                    <div>
                        <label
                            htmlFor="reportes-tipo-venta"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Tipo de venta
                        </label>

                        <select
                            id="reportes-tipo-venta"
                            value={filters.tipoVenta}
                            onChange={(event) =>
                                updateFilter("tipoVenta", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                        >
                            <option value="todos">Todas</option>
                            <option value="online">Online</option>
                            <option value="rrss">RRSS</option>
                            <option value="presencial">Presencial</option>
                        </select>
                    </div>


                    {/* MEDIO DE PAGO */}
                    <div>
                        <label
                            htmlFor="reportes-medio-pago"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Medio de pago
                        </label>

                        <select
                            id="reportes-medio-pago"
                            value={filters.medioPago}
                            onChange={(event) =>
                                updateFilter("medioPago", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                        >
                            <option value="todos">Todos</option>
                            <option value="mercado_pago">Mercado Pago</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="debito">POS TUU</option>
                        </select>
                    </div>

                </div>


                {/* BOTONES */}
                <div className="mt-4 flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={reload}
                        disabled={loading}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Actualizando..." : "Aplicar filtros"}
                    </button>

                    <button
                        type="button"
                        onClick={resetFilters}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Limpiar filtros
                    </button>

                </div>

            </section>


            {/* ERROR */}
            {error && (
                <section className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>
                </section>
            )}


            {/* RESUMEN */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Ventas totales
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(totalSales)}
                    </p>
                </div>


                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Cantidad de ventas
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {totalOrders}
                    </p>
                </div>


                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Ticket promedio
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(averageTicket)}
                    </p>
                </div>

            </section>

                        {/* RESUMEN POR TIPO DE VENTA */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Resumen por tipo de venta
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Distribución de las ventas según su canal de origen.
                    </p>
                </div>

                {resumenTipos.length === 0 ? (

                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                        No existen ventas para mostrar.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Tipo de venta
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Ventas
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Total
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">

                                {resumenTipos.map((item) => (

                                    <tr key={item.tipo}>

                                        <td className="px-5 py-3 text-sm font-medium text-gray-900">
                                            {item.tipo}
                                        </td>

                                        <td className="px-5 py-3 text-right text-sm text-gray-600">
                                            {item.cantidad}
                                        </td>

                                        <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">
                                            {formatCurrency(item.total)}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

                        {/* RESUMEN POR MEDIO DE PAGO */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Resumen por medio de pago
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Distribución de las ventas según su medio de pago.
                    </p>
                </div>

                {resumenMediosPago.length === 0 ? (

                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                        No existen ventas para mostrar.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Medio de pago
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Ventas
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Total
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">

                                {resumenMediosPago.map((item) => (

                                    <tr key={item.medio}>

                                        <td className="px-5 py-3 text-sm font-medium text-gray-900">
                                            {item.medio}
                                        </td>

                                        <td className="px-5 py-3 text-right text-sm text-gray-600">
                                            {item.cantidad}
                                        </td>

                                        <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">
                                            {formatCurrency(item.total)}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>
            
            {/* TABLA */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Ventas contabilizadas
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Solo se muestran órdenes con estado de pago pagado.
                    </p>
                </div>


                {loading ? (

                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        Cargando reporte...
                    </div>

                ) : sales.length === 0 ? (

                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        No existen ventas para los filtros seleccionados.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Venta
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Fecha
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Tipo
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Medio de pago
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Total
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-200 bg-white">

                                {sales.map((sale) => (

                                    <tr key={sale.order_id}>

                                        <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-900">
                                            {sale.numero_venta || sale.order_id}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">
                                            {formatDate(sale.fecha_venta)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">
                                            {getTipoVentaLabel(sale.tipo_venta)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">
                                            {getMedioPagoLabel(sale.medio_pago)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold text-gray-900">
                                            {formatCurrency(sale.total)}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}

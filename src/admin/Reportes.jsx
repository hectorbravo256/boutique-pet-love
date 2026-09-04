import React, {
    useState
} from "react";

import {
    createPortal
} from "react-dom";

import useReportes from "./shared/hooks/useReportes";

import ReportesService
    from "./shared/services/ReportesService";

import {
    formatearFechaChile
} from "./utils/fechaChile";


const formatCurrency = (value) => {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value || 0)
    );
};


const normalizarFechaUTC = (fecha) => {

    if (!fecha) {
        return null;
    }

    const fechaTexto =
        String(fecha);


    /*
     * Si ya contiene zona horaria,
     * no modificar.
     */

    if (
        fechaTexto.endsWith("Z") ||
        /[+-]\d{2}:\d{2}$/.test(fechaTexto)
    ) {

        return fechaTexto;

    }


    /*
     * Las fechas provenientes de orders
     * representan UTC.
     */

    return `${fechaTexto}Z`;
};


const formatDate = (value) => {

    const fechaUTC =
        normalizarFechaUTC(value);

    return formatearFechaChile(
        fechaUTC
    );
};


const getTipoVentaLabel = (
    tipoVenta
) => {

    if (!tipoVenta) {
        return "-";
    }


    const value =
        String(tipoVenta)
            .toLowerCase();


    if (
        value === "online" ||
        value === "web"
    ) {

        return "Online";

    }


    if (value === "rrss") {
        return "RRSS";
    }


    if (
        value === "presencial" ||
        value === "tienda"
    ) {

        return "Presencial";

    }


    return tipoVenta;
};


const getMedioPagoLabel = (
    medioPago
) => {

    if (!medioPago) {
        return "-";
    }


    const value =
        String(medioPago)
            .toLowerCase();


    if (
        value.includes("mercado")
    ) {

        return "Mercado Pago";

    }


    if (
        value.includes("transfer")
    ) {

        return "Transferencia";

    }


    if (
        value.includes("efect")
    ) {

        return "Efectivo";

    }


    if (
        value === "debito"
    ) {

        return "POS TUU";

    }


    return medioPago;
};


const getEstadoPagoLabel = (
    estado
) => {

    if (!estado) {
        return "-";
    }


    const value =
        String(estado)
            .toLowerCase();


    if (
        value === "paid" ||
        value === "pagado"
    ) {

        return "Pagado";

    }


    if (
        value === "pending" ||
        value === "pendiente"
    ) {

        return "Pendiente";

    }


    if (
        value === "failed" ||
        value === "rechazado"
    ) {

        return "Rechazado";

    }


    return estado;
};


const getEstadoLabel = (
    estado
) => {

    if (!estado) {
        return "-";
    }


    const value =
        String(estado)
            .toLowerCase();


    if (
        value === "completed" ||
        value === "completado"
    ) {

        return "Completado";

    }


    if (
        value === "pendiente" ||
        value === "pending"
    ) {

        return "Pendiente";

    }


    return estado;
};


const getItemName = (item) => {

    return (
        item?.name ||
        item?.nombre ||
        item?.product_name ||
        item?.producto ||
        "-"
    );
};


const getItemSize = (item) => {

    return (
        item?.size ||
        item?.talla ||
        item?.variant_name ||
        item?.variante ||
        "-"
    );
};


const getItemQuantity = (item) => {

    return Number(
        item?.qty ??
        item?.quantity ??
        item?.cantidad ??
        0
    );
};


const getItemPrice = (item) => {

    return Number(
        item?.price ??
        item?.precio ??
        0
    );
};


const getItemLineTotal = (item) => {

    const quantity =
        getItemQuantity(item);

    const price =
        getItemPrice(item);

    return quantity * price;
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


    // ---------------------------------------------------------
    // DETALLE DE VENTA
    // ---------------------------------------------------------

    const [
        selectedSale,
        setSelectedSale
    ] = useState(null);


    const [
        detailLoading,
        setDetailLoading
    ] = useState(false);


    const [
        detailError,
        setDetailError
    ] = useState("");


    const handleViewSale = async (
        orderId
    ) => {

        if (!orderId) {
            return;
        }


        setDetailLoading(true);

        setDetailError("");

        setSelectedSale(null);


        try {

            const detail =
                await ReportesService
                    .getSaleDetail(
                        orderId
                    );


            setSelectedSale(
                detail
            );

        } catch (err) {

            console.error(
                "Reportes.jsx - detalle:",
                err
            );

            setDetailError(
                "No fue posible cargar el detalle de la venta."
            );

        } finally {

            setDetailLoading(false);

        }
    };


    const closeSaleDetail = () => {

        setSelectedSale(null);

        setDetailError("");

    };


    // ---------------------------------------------------------
    // RESUMEN POR TIPO
    // ---------------------------------------------------------

    const summaryByTipoVenta =
        sales.reduce(
            (acc, sale) => {

                const tipo =
                    getTipoVentaLabel(
                        sale.tipo_venta
                    );


                if (!acc[tipo]) {

                    acc[tipo] = {
                        tipo,
                        cantidad: 0,
                        total: 0
                    };

                }


                acc[tipo].cantidad += 1;


                acc[tipo].total +=
                    Number(
                        sale.total_cobrado ??
                        sale.total ??
                        0
                    );


                return acc;

            },
            {}
        );


    const tipoVentaOrder = [
        "Online",
        "RRSS",
        "Presencial"
    ];


    const resumenTipos =
        tipoVentaOrder
            .map(
                (tipo) =>
                    summaryByTipoVenta[tipo]
            )
            .filter(Boolean);


    // ---------------------------------------------------------
    // RESUMEN POR MEDIO DE PAGO
    // ---------------------------------------------------------

    const summaryByMedioPago =
        sales.reduce(
            (acc, sale) => {

                const medio =
                    getMedioPagoLabel(
                        sale.medio_pago
                    );


                if (!acc[medio]) {

                    acc[medio] = {
                        medio,
                        cantidad: 0,
                        total: 0
                    };

                }


                acc[medio].cantidad += 1;


                acc[medio].total +=
                    Number(
                        sale.total_cobrado ??
                        sale.total ??
                        0
                    );


                return acc;

            },
            {}
        );


    const medioPagoOrder = [
        "Mercado Pago",
        "Transferencia",
        "POS TUU",
        "Efectivo"
    ];


    const resumenMediosPago =
        medioPagoOrder
            .map(
                (medio) =>
                    summaryByMedioPago[medio]
            )
            .filter(Boolean);


    // ---------------------------------------------------------
    // DATOS DEL MODAL
    // ---------------------------------------------------------

    const order =
    selectedSale?.order ||
    null;


const reportSale =
    selectedSale?.reportSale ||
    null;


const exchanges =
    selectedSale?.exchanges ||
    [];


    const items =
        Array.isArray(order?.items)
            ? order.items
            : [];

    const subtotalProductosCalculado =
    items.reduce(
        (sum, item) =>
            sum +
            getItemLineTotal(item),
        0
    );


const subtotalProductos =
    order?.subtotal_productos !== null &&
    order?.subtotal_productos !== undefined
        ? Number(order.subtotal_productos)
        : subtotalProductosCalculado;


const additionalPayment =
    Number(
        reportSale?.adicional_cambio ??
        0
    );


const totalCharged =
    Number(
        reportSale?.total_cobrado ??
        order?.total ??
        0
    );


    return (
        <div className="space-y-6">

            {/* =====================================================
                ENCABEZADO
            ====================================================== */}

            <div>

                <h1 className="text-2xl font-bold text-gray-900">
                    Reportes
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Análisis de ventas contabilizadas según estado de pago.
                </p>

            </div>


            {/* =====================================================
                FILTROS
            ====================================================== */}

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

                    {/* DESDE */}

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
                                updateFilter(
                                    "from",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                        />

                    </div>


                    {/* HASTA */}

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
                                updateFilter(
                                    "to",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                        />

                    </div>


                    {/* TIPO */}

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
                                updateFilter(
                                    "tipoVenta",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                        >

                            <option value="todos">
                                Todas
                            </option>

                            <option value="online">
                                Online
                            </option>

                            <option value="rrss">
                                RRSS
                            </option>

                            <option value="presencial">
                                Presencial
                            </option>

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
                                updateFilter(
                                    "medioPago",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                        >

                            <option value="todos">
                                Todos
                            </option>

                            <option value="mercado_pago">
                                Mercado Pago
                            </option>

                            <option value="transferencia">
                                Transferencia
                            </option>

                            <option value="efectivo">
                                Efectivo
                            </option>

                            <option value="debito">
                                POS TUU
                            </option>

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
                        {loading
                            ? "Actualizando..."
                            : "Aplicar filtros"
                        }
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


            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (

                <section className="rounded-xl border border-red-200 bg-red-50 p-4">

                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>

                </section>

            )}


            {/* =====================================================
                RESUMEN GENERAL
            ====================================================== */}

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


            {/* =====================================================
                RESUMEN POR TIPO
            ====================================================== */}

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

                                {resumenTipos.map(
                                    (item) => (

                                        <tr key={item.tipo}>

                                            <td className="px-5 py-3 text-sm font-medium text-gray-900">
                                                {item.tipo}
                                            </td>

                                            <td className="px-5 py-3 text-right text-sm text-gray-600">
                                                {item.cantidad}
                                            </td>

                                            <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    item.total
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
                RESUMEN POR MEDIO DE PAGO
            ====================================================== */}

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

                                {resumenMediosPago.map(
                                    (item) => (

                                        <tr key={item.medio}>

                                            <td className="px-5 py-3 text-sm font-medium text-gray-900">
                                                {item.medio}
                                            </td>

                                            <td className="px-5 py-3 text-right text-sm text-gray-600">
                                                {item.cantidad}
                                            </td>

                                            <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    item.total
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
                VENTAS CONTABILIZADAS
            ====================================================== */}

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

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Detalle
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-200 bg-white">

                                {sales.map(
                                    (sale) => (

                                        <tr
                                            key={sale.order_id}
                                        >

                                            <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-900">

                                                {sale.numero_venta ||
                                                    sale.order_id}

                                            </td>


                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">

                                                {formatDate(
                                                    sale.fecha_venta
                                                )}

                                            </td>


                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">

                                                {getTipoVentaLabel(
                                                    sale.tipo_venta
                                                )}

                                            </td>


                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">

                                                {getMedioPagoLabel(
                                                    sale.medio_pago
                                                )}

                                            </td>


                                            <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold text-gray-900">

                                                {formatCurrency(
                                                    sale.total_cobrado ??
                                                    sale.total ??
                                                    0
                                                )}

                                            </td>


                                            <td className="whitespace-nowrap px-5 py-3 text-center">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewSale(
                                                            sale.order_id
                                                        )
                                                    }
                                                    title="Ver detalle de la venta"
                                                    aria-label={`Ver detalle de venta ${sale.numero_venta || sale.order_id}`}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:border-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className="text-base"
                                                    >
                                                        👁️
                                                    </span>
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
                CARGANDO DETALLE
            ====================================================== */}

            {detailLoading && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="rounded-xl bg-white px-6 py-5 shadow-xl">

                        <p className="text-sm font-medium text-gray-700">
                            Cargando detalle de la venta...
                        </p>

                    </div>

                </div>

            )}


            {/* =====================================================
                ERROR DETALLE
            ====================================================== */}

            {detailError && !selectedSale && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                        <h3 className="text-lg font-semibold text-gray-900">
                            No fue posible abrir la venta
                        </h3>

                        <p className="mt-2 text-sm text-red-600">
                            {detailError}
                        </p>

                        <div className="mt-5 flex justify-end">

                            <button
                                type="button"
                                onClick={closeSaleDetail}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                            >
                                Cerrar
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                MODAL DETALLE DE VENTA
            ====================================================== */}

{selectedSale &&
    order &&
    createPortal(

        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget
                ) {

                    closeSaleDetail();

                }

            }}
        >

                    <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">

                                    Detalle de venta #
                                    {order.numero_venta ||
                                        order.id}

                                </h2>

                                <p className="mt-1 text-sm text-gray-500">

                                    Información completa de la venta contabilizada.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeSaleDetail}
                                aria-label="Cerrar detalle"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            >
                                ×
                            </button>

                        </div>


                        {/* CONTENIDO */}

                        <div className="min-h-0 overflow-y-auto p-6">

                            <div className="space-y-6">


                                {/* =================================================
                                    INFORMACIÓN DE VENTA
                                ================================================== */}

                                <section>

                                    <div className="mb-3 flex items-center justify-between">

                                        <h3 className="text-base font-semibold text-gray-900">
                                            Información de venta
                                        </h3>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                            {getTipoVentaLabel(
                                                order.tipo_venta
                                            )}
                                        </span>

                                    </div>


                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                N.º venta
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.numero_venta ||
                                                    order.id}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Fecha
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatDate(
                                                    order.created_at
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Estado
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {getEstadoLabel(
                                                    order.estado
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Estado de pago
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {getEstadoPagoLabel(
                                                    order.estado_pago
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Medio de pago
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {getMedioPagoLabel(
                                                    order.medio_pago
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Vendedor
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.vendedor ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3 sm:col-span-2">

                                            <p className="text-xs font-medium text-gray-500">
                                                Payment ID
                                            </p>

                                            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                                                {order.payment_id ||
                                                    "-"}
                                            </p>

                                        </div>

                                    </div>

                                </section>


                                {/* =================================================
                                    CLIENTE
                                ================================================== */}

                                <section>

                                    <h3 className="mb-3 text-base font-semibold text-gray-900">
                                        Cliente
                                    </h3>


                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Nombre
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.nombre ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                RUT
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.rut ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Correo
                                            </p>

                                            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                                                {order.correo ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Teléfono
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.telefono ||
                                                    "-"}
                                            </p>

                                        </div>

                                    </div>

                                </section>


                                {/* =================================================
                                    DESPACHO
                                ================================================== */}

                                <section>

                                    <h3 className="mb-3 text-base font-semibold text-gray-900">
                                        Despacho
                                    </h3>


                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                        <div className="rounded-lg border border-gray-200 p-3 sm:col-span-2">

                                            <p className="text-xs font-medium text-gray-500">
                                                Dirección
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.direccion ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Comuna
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.comuna ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Región
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.region ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Empresa de envío
                                            </p>

                                            <p className="mt-1 text-sm font-semibold uppercase text-gray-900">
                                                {order.empresa_envio ||
                                                    "-"}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Costo de envío
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    order.costo_envio
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-gray-200 p-3">

                                            <p className="text-xs font-medium text-gray-500">
                                                Envío por pagar
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {order.envio_por_pagar
                                                    ? "Sí"
                                                    : "No"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </section>


                                {/* =================================================
                                    PRODUCTOS
                                ================================================== */}

                                <section>

                                    <div className="mb-3 flex items-center justify-between">

                                        <h3 className="text-base font-semibold text-gray-900">
                                            Productos
                                        </h3>

                                        <span className="text-sm text-gray-500">
                                            {items.length} línea
                                            {items.length === 1
                                                ? ""
                                                : "s"
                                            }
                                        </span>

                                    </div>


                                    {items.length === 0 ? (

                                        <div className="rounded-lg border border-gray-200 p-5 text-center text-sm text-gray-500">
                                            No hay productos registrados en esta venta.
                                        </div>

                                    ) : (

                                        <div className="overflow-x-auto rounded-lg border border-gray-200">

                                            <table className="min-w-full divide-y divide-gray-200">

                                                <thead className="bg-gray-50">

                                                    <tr>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Producto
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Talla / variante
                                                        </th>

                                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Cantidad
                                                        </th>

                                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Precio unitario
                                                        </th>

                                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Total
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody className="divide-y divide-gray-200 bg-white">

                                                    {items.map(
                                                        (item, index) => {

                                                            const quantity =
                                                                getItemQuantity(
                                                                    item
                                                                );

                                                            const price =
                                                                getItemPrice(
                                                                    item
                                                                );

                                                            const lineTotal =
                                                                getItemLineTotal(
                                                                    item
                                                                );


                                                            return (

                                                                <tr
                                                                    key={
                                                                        item?.variant_id ||
                                                                        item?.id ||
                                                                        index
                                                                    }
                                                                >

                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">

                                                                        {getItemName(
                                                                            item
                                                                        )}

                                                                    </td>


                                                                    <td className="px-4 py-3 text-sm text-gray-600">

                                                                        {getItemSize(
                                                                            item
                                                                        )}

                                                                        {item?.variant_id && (

                                                                            <span className="ml-2 text-xs text-gray-400">
                                                                                ID {item.variant_id}
                                                                            </span>

                                                                        )}

                                                                    </td>


                                                                    <td className="px-4 py-3 text-center text-sm text-gray-600">

                                                                        {quantity}

                                                                    </td>


                                                                    <td className="px-4 py-3 text-right text-sm text-gray-600">

                                                                        {formatCurrency(
                                                                            price
                                                                        )}

                                                                    </td>


                                                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">

                                                                        {formatCurrency(
                                                                            lineTotal
                                                                        )}

                                                                    </td>

                                                                </tr>

                                                            );

                                                        }
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    )}

                                </section>


                                {/* =================================================
                                    OBSERVACIONES
                                ================================================== */}

                                {order.observacion && (

                                    <section>

                                        <h3 className="mb-3 text-base font-semibold text-gray-900">
                                            Observaciones
                                        </h3>

                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                                                {order.observacion}
                                            </p>

                                        </div>

                                    </section>

                                )}


                                {/* =================================================
                                    CAMBIOS
                                ================================================== */}

                                {(
    exchanges.length > 0 ||
    reportSale?.exchange_id
) && (

                                    <section>

                                        <h3 className="mb-3 text-base font-semibold text-gray-900">
                                            Cambios asociados
                                        </h3>

                                        {reportSale?.exchange_id && (

    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-4">

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div>

                <p className="text-xs font-medium text-gray-500">
                    Fecha del cambio
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatDate(
                        reportSale.cambio_fecha
                    )}
                </p>

            </div>


            <div>

                <p className="text-xs font-medium text-gray-500">
                    Cobro adicional
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatCurrency(
                        reportSale.adicional_cambio
                    )}
                </p>

            </div>


            <div>

                <p className="text-xs font-medium text-gray-500">
                    Estado del pago
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                    {getEstadoPagoLabel(
                        reportSale.estado_pago_cambio
                    )}
                </p>

            </div>


            <div>

                <p className="text-xs font-medium text-gray-500">
                    Medio de pago
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                    {getMedioPagoLabel(
                        reportSale.medio_pago_cambio
                    )}
                </p>

            </div>

        </div>

    </div>

)}


                                        <div className="space-y-3">

                                            {exchanges.map(
                                                (exchange) => (

                                                    <div
                                                        key={exchange.id}
                                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                                    >

                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                                            <div>

                                                                <p className="text-xs font-medium text-gray-500">
                                                                    Fecha
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                    {formatDate(
                                                                        exchange.created_at
                                                                    )}
                                                                </p>

                                                            </div>


                                                            <div>

                                                                <p className="text-xs font-medium text-gray-500">
                                                                    Cobro adicional
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                    {formatCurrency(
                                                                        exchange.additional_payment
                                                                    )}
                                                                </p>

                                                            </div>


                                                            <div>

                                                                <p className="text-xs font-medium text-gray-500">
                                                                    Estado de pago
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                    {getEstadoPagoLabel(
                                                                        exchange.payment_status
                                                                    )}
                                                                </p>

                                                            </div>


                                                            <div>

                                                                <p className="text-xs font-medium text-gray-500">
                                                                    Medio de pago
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                    {getMedioPagoLabel(
                                                                        exchange.payment_method
                                                                    )}
                                                                </p>

                                                            </div>

                                                        </div>


                                                        {exchange.observation && (

                                                            <div className="mt-3">

                                                                <p className="text-xs font-medium text-gray-500">
                                                                    Observación del cambio
                                                                </p>

                                                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                                                                    {exchange.observation}
                                                                </p>

                                                            </div>

                                                        )}


                                                        <div className="mt-3">

                                                            <p className="text-xs font-medium text-gray-500">
                                                                ID del cambio
                                                            </p>

                                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                                {exchange.id}
                                                            </p>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </section>

                                )}


                                {/* =================================================
                                    TOTALES
                                ================================================== */}

                                <section>

                                    <h3 className="mb-3 text-base font-semibold text-gray-900">
                                        Totales
                                    </h3>


                                    <div className="ml-auto w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 p-4">

                                        <div className="flex items-center justify-between border-b border-gray-200 py-2">

                                            <span className="text-sm text-gray-600">
                                                Subtotal productos
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    subtotalProductos
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex items-center justify-between border-b border-gray-200 py-2">

                                            <span className="text-sm text-gray-600">
                                                Envío
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    order.costo_envio
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex items-center justify-between border-b border-gray-200 py-2">

                                            <span className="text-sm text-gray-600">
                                                Total original
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    order.total
                                                )}
                                            </span>

                                        </div>


                                        {additionalPayment > 0 && (

                                            <div className="flex items-center justify-between border-b border-gray-200 py-2">

                                                <span className="text-sm text-gray-600">
                                                    Adicional por cambios
                                                </span>

                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        additionalPayment
                                                    )}
                                                </span>

                                            </div>

                                        )}


                                        <div className="flex items-center justify-between pt-3">

                                            <span className="text-base font-bold text-gray-900">
                                                Total cobrado
                                            </span>

                                            <span className="text-xl font-bold text-gray-900">
                                                {formatCurrency(
                                                    totalCharged
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </section>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">

                            <button
                                type="button"
                                onClick={closeSaleDetail}
                                className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Cerrar
                            </button>

                        </div>

                    </div>



        </div>,

        document.body

    )}

</div>
);
}

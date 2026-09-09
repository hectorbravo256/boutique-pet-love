import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CHILE_TIMEZONE = "America/Santiago";

/* =========================================================
   UTILIDADES
========================================================= */

const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));


const normalizeUTC = (value) => {

    if (!value) {
        return null;
    }

    const text = String(value);

    if (
        text.endsWith("Z") ||
        /[+-]\d{2}:\d{2}$/.test(text)
    ) {
        return text;
    }

    return `${text}Z`;
};


const formatDate = (value) => {

    const normalized =
        normalizeUTC(value);

    if (!normalized) {
        return "-";
    }

    const date =
        new Date(normalized);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "es-CL",
        {
            timeZone:
                CHILE_TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }
    ).format(date);
};


const getTipoVentaLabel = (
    value
) => {

    if (!value) {
        return "-";
    }

    const normalized =
        String(value)
            .toLowerCase();

    if (
        normalized === "online" ||
        normalized === "web"
    ) {
        return "Online";
    }

    if (
        normalized === "rrss"
    ) {
        return "RRSS";
    }

    if (
        normalized === "presencial" ||
        normalized === "tienda"
    ) {
        return "Presencial";
    }

    return value;
};


const getMedioPagoLabel = (
    value
) => {

    if (!value) {
        return "-";
    }

    const normalized =
        String(value)
            .toLowerCase();

    if (
        normalized.includes(
            "mercado"
        )
    ) {
        return "Mercado Pago";
    }

    if (
        normalized.includes(
            "transfer"
        )
    ) {
        return "Transferencia";
    }

    if (
        normalized.includes(
            "efect"
        )
    ) {
        return "Efectivo";
    }

    if (
        normalized === "debito" ||
        normalized.includes("tuu")
    ) {
        return "POS TUU";
    }

    return value;
};


const getEstadoPagoLabel = (
    value
) => {

    if (!value) {
        return "-";
    }

    const normalized =
        String(value)
            .toLowerCase();

    if (
        normalized === "paid" ||
        normalized === "pagado"
    ) {
        return "Pagado";
    }

    if (
        normalized === "pending" ||
        normalized === "pendiente"
    ) {
        return "Pendiente";
    }

    if (
        normalized === "failed" ||
        normalized === "rechazado"
    ) {
        return "Rechazado";
    }

    return value;
};


/* =========================================================
   PRODUCTOS
========================================================= */

const getItemName = (
    item
) =>
    item?.name ||
    item?.nombre ||
    item?.product_name ||
    item?.producto ||
    "-";


const getItemSize = (
    item
) =>
    item?.size ||
    item?.talla ||
    item?.variant_name ||
    item?.variante ||
    "-";


const getItemQuantity = (
    item
) =>
    Number(
        item?.qty ??
        item?.quantity ??
        item?.cantidad ??
        0
    );


const getItemPrice = (
    item
) =>
    Number(
        item?.price ??
        item?.precio ??
        0
    );


const getItemTotal = (
    item
) =>
    getItemQuantity(item) *
    getItemPrice(item);


const getItems = (
    order
) =>
    Array.isArray(
        order?.items
    )
        ? order.items
        : [];


/* =========================================================
   TOTALES
========================================================= */

const getSubtotal = (
    order
) => {

    if (
        order?.subtotal_productos !==
            null &&
        order?.subtotal_productos !==
            undefined
    ) {
        return Number(
            order.subtotal_productos
        );
    }

    return getItems(order)
        .reduce(
            (
                sum,
                item
            ) =>
                sum +
                getItemTotal(item),
            0
        );
};


const getAdditionalPayment = (
    reportSale
) =>
    Number(
        reportSale?.adicional_cambio ??
        0
    );


const getTotalCharged = (
    reportSale,
    order
) =>
    Number(
        reportSale?.total_cobrado ??
        order?.total ??
        0
    );


/* =========================================================
   DATOS AUXILIARES
========================================================= */

const findDetail = (
    details,
    orderId
) =>
    details.find(
        (detail) =>
            String(
                detail?.order?.id
            ) ===
            String(orderId)
    ) || null;


const getOrder = (
    detail
) =>
    detail?.order || {};


const getReportSale = (
    detail,
    sale
) =>
    detail?.reportSale ||
    sale ||
    {};


const getFilenameDate = () =>
    new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                CHILE_TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }
    ).format(
        new Date()
    );


/* =========================================================
   EXCEL
========================================================= */

const exportExcel = ({
    sales = [],
    details = [],
    summary = {},
    filters = {},
}) => {

    const workbook =
        XLSX.utils.book_new();

    const dateFrom =
        filters?.from ||
        "Inicio";

    const dateTo =
        filters?.to ||
        "Hoy";


    /* -----------------------------------------------------
       HOJA 1 — RESUMEN
    ----------------------------------------------------- */

    const summaryRows = [

        ["BOUTIQUE PET LOVE"],

        ["REPORTE DE VENTAS"],

        [],

        [
            "Período desde",
            dateFrom
        ],

        [
            "Período hasta",
            dateTo
        ],

        [],

        ["RESUMEN GENERAL"],

        [
            "Ventas totales",
            Number(
                summary?.totalSales ||
                0
            )
        ],

        [
            "Cantidad de ventas",
            Number(
                summary?.totalOrders ||
                0
            )
        ],

        [
            "Ticket promedio",
            Number(
                summary?.averageTicket ||
                0
            )
        ],

        [],

        ["VENTAS POR TIPO"],

        [
            "Tipo",
            "Cantidad",
            "Total cobrado"
        ]

    ];


    const byType = {};


    sales.forEach(
        (sale) => {

            const type =
                getTipoVentaLabel(
                    sale?.tipo_venta
                );

            if (!byType[type]) {

                byType[type] = {
                    count: 0,
                    total: 0
                };

            }

            byType[type].count +=
                1;

            byType[type].total +=
                Number(
                    sale?.total_cobrado ??
                    sale?.total ??
                    0
                );

        }
    );


    Object.entries(
        byType
    ).forEach(
        ([type, data]) => {

            summaryRows.push([
                type,
                data.count,
                data.total
            ]);

        }
    );


    summaryRows.push([]);

    summaryRows.push([
        "VENTAS POR MEDIO DE PAGO"
    ]);

    summaryRows.push([
        "Medio",
        "Cantidad",
        "Total cobrado"
    ]);


    const byPayment = {};


    sales.forEach(
        (sale) => {

            const payment =
                getMedioPagoLabel(
                    sale?.medio_pago
                );

            if (!byPayment[payment]) {

                byPayment[payment] = {
                    count: 0,
                    total: 0
                };

            }

            byPayment[payment].count +=
                1;

            byPayment[payment].total +=
                Number(
                    sale?.total_cobrado ??
                    sale?.total ??
                    0
                );

        }
    );


    Object.entries(
        byPayment
    ).forEach(
        ([payment, data]) => {

            summaryRows.push([
                payment,
                data.count,
                data.total
            ]);

        }
    );


    const summarySheet =
        XLSX.utils.aoa_to_sheet(
            summaryRows
        );


    summarySheet["!cols"] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 20 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Resumen"
    );


    /* -----------------------------------------------------
       HOJA 2 — VENTAS
    ----------------------------------------------------- */

    const salesRows =
        sales.map(
            (sale) => {

                const detail =
                    findDetail(
                        details,
                        sale?.order_id
                    );

                const order =
                    getOrder(detail);

                const reportSale =
                    getReportSale(
                        detail,
                        sale
                    );


                return {

                    "N° Venta":
                        sale?.numero_venta ??
                        order?.numero_venta ??
                        sale?.order_id ??
                        "-",

                    "Fecha":
                        formatDate(
                            sale?.fecha_venta ??
                            order?.created_at
                        ),

                    "Tipo":
                        getTipoVentaLabel(
                            sale?.tipo_venta ??
                            order?.tipo_venta
                        ),

                    "Medio de pago":
                        getMedioPagoLabel(
                            sale?.medio_pago ??
                            order?.medio_pago
                        ),

                    "Estado":
                        order?.estado ??
                        sale?.estado ??
                        "-",

                    "Estado de pago":
                        getEstadoPagoLabel(
                            sale?.estado_pago ??
                            order?.estado_pago
                        ),

                    "Vendedor":
                        order?.vendedor ??
                        sale?.vendedor ??
                        "-",

                    "Subtotal productos":
                        getSubtotal(order),

                    "Costo envío":
                        Number(
                            order?.costo_envio ||
                            0
                        ),

                    "Empresa envío":
                        order?.empresa_envio ||
                        "-",

                    "Envío por pagar":
                        order?.envio_por_pagar
                            ? "Sí"
                            : "No",

                    "Total original":
                        Number(
                            order?.total ??
                            sale?.total ??
                            0
                        ),

                    "Adicional cambio":
                        getAdditionalPayment(
                            reportSale
                        ),

                    "Estado pago cambio":
                        getEstadoPagoLabel(
                            reportSale
                                ?.estado_pago_cambio
                        ),

                    "Medio pago cambio":
                        getMedioPagoLabel(
                            reportSale
                                ?.medio_pago_cambio
                        ),

                    "Total cobrado":
                        getTotalCharged(
                            reportSale,
                            order
                        )

                };

            }
        );


    const salesSheet =
        XLSX.utils.json_to_sheet(
            salesRows
        );


    salesSheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 14 },
        { wch: 20 },
        { wch: 16 },
        { wch: 18 },
        { wch: 22 },
        { wch: 20 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        salesSheet,
        "Ventas"
    );


    /* -----------------------------------------------------
       HOJA 3 — PRODUCTOS
    ----------------------------------------------------- */

    const productRows = [];


    details.forEach(
        (detail) => {

            const order =
                getOrder(detail);

            getItems(order).forEach(
                (item) => {

                    productRows.push({

                        "N° Venta":
                            order?.numero_venta ??
                            order?.id ??
                            "-",

                        "Fecha":
                            formatDate(
                                order?.created_at
                            ),

                        "Tipo":
                            getTipoVentaLabel(
                                order?.tipo_venta
                            ),

                        "Producto":
                            getItemName(item),

                        "Talla / Variante":
                            getItemSize(item),

                        "Variant ID":
                            item?.variant_id ??
                            "",

                        "Cantidad":
                            getItemQuantity(
                                item
                            ),

                        "Precio unitario":
                            getItemPrice(
                                item
                            ),

                        "Total línea":
                            getItemTotal(
                                item
                            )

                    });

                }
            );

        }
    );


    const productsSheet =
        XLSX.utils.json_to_sheet(
            productRows
        );


    productsSheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 14 },
        { wch: 35 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        productsSheet,
        "Productos"
    );


    /* -----------------------------------------------------
       HOJA 4 — CLIENTES
    ----------------------------------------------------- */

    const customerRows =
        details.map(
            (detail) => {

                const order =
                    getOrder(detail);

                return {

                    "N° Venta":
                        order?.numero_venta ??
                        order?.id ??
                        "-",

                    "Nombre":
                        order?.nombre ||
                        "-",

                    "RUT":
                        order?.rut ||
                        "-",

                    "Correo":
                        order?.correo ||
                        "-",

                    "Teléfono":
                        order?.telefono ||
                        "-",

                    "Dirección":
                        order?.direccion ||
                        "-",

                    "Comuna":
                        order?.comuna ||
                        "-",

                    "Región":
                        order?.region ||
                        "-"

                };

            }
        );


    const customersSheet =
        XLSX.utils.json_to_sheet(
            customerRows
        );


    customersSheet["!cols"] = [
        { wch: 10 },
        { wch: 30 },
        { wch: 18 },
        { wch: 35 },
        { wch: 18 },
        { wch: 35 },
        { wch: 20 },
        { wch: 25 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        customersSheet,
        "Clientes"
    );


    /* -----------------------------------------------------
       HOJA 5 — DESPACHOS
    ----------------------------------------------------- */

    const shippingRows =
        details.map(
            (detail) => {

                const order =
                    getOrder(detail);

                return {

                    "N° Venta":
                        order?.numero_venta ??
                        order?.id ??
                        "-",

                    "Dirección":
                        order?.direccion ||
                        "-",

                    "Comuna":
                        order?.comuna ||
                        "-",

                    "Región":
                        order?.region ||
                        "-",

                    "Empresa envío":
                        order?.empresa_envio ||
                        "-",

                    "Costo envío":
                        Number(
                            order?.costo_envio ||
                            0
                        ),

                    "Envío por pagar":
                        order?.envio_por_pagar
                            ? "Sí"
                            : "No"

                };

            }
        );


    const shippingSheet =
        XLSX.utils.json_to_sheet(
            shippingRows
        );


    shippingSheet["!cols"] = [
        { wch: 10 },
        { wch: 35 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        shippingSheet,
        "Despachos"
    );


    /* -----------------------------------------------------
       HOJA 6 — CAMBIOS
    ----------------------------------------------------- */

    const exchangeRows = [];


    details.forEach(
        (detail) => {

            const order =
                getOrder(detail);

            const reportSale =
                detail?.reportSale ||
                {};

            const exchanges =
                Array.isArray(
                    detail?.exchanges
                )
                    ? detail.exchanges
                    : [];


            if (
                exchanges.length === 0 &&
                !reportSale?.exchange_id
            ) {
                return;
            }


            if (
                exchanges.length > 0
            ) {

                exchanges.forEach(
                    (exchange) => {

                        exchangeRows.push({

                            "N° Venta":
                                order?.numero_venta ??
                                order?.id ??
                                "-",

                            "Fecha cambio":
                                formatDate(
                                    exchange?.created_at
                                ),

                            "Cobro adicional":
                                Number(
                                    exchange
                                        ?.additional_payment ||
                                    0
                                ),

                            "Estado pago":
                                getEstadoPagoLabel(
                                    exchange
                                        ?.payment_status
                                ),

                            "Medio pago":
                                getMedioPagoLabel(
                                    exchange
                                        ?.payment_method
                                ),

                            "Observación":
                                exchange
                                    ?.observation ||
                                "",

                            "ID cambio":
                                exchange?.id ||
                                ""

                        });

                    }
                );

            } else {

                exchangeRows.push({

                    "N° Venta":
                        order?.numero_venta ??
                        order?.id ??
                        "-",

                    "Fecha cambio":
                        formatDate(
                            reportSale
                                ?.cambio_fecha
                        ),

                    "Cobro adicional":
                        Number(
                            reportSale
                                ?.adicional_cambio ||
                            0
                        ),

                    "Estado pago":
                        getEstadoPagoLabel(
                            reportSale
                                ?.estado_pago_cambio
                        ),

                    "Medio pago":
                        getMedioPagoLabel(
                            reportSale
                                ?.medio_pago_cambio
                        ),

                    "Observación":
                        order?.observacion ||
                        "",

                    "ID cambio":
                        reportSale
                            ?.exchange_id ||
                        ""

                });

            }

        }
    );


    const exchangesSheet =
        XLSX.utils.json_to_sheet(
            exchangeRows
        );


    exchangesSheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 },
        { wch: 50 },
        { wch: 40 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        exchangesSheet,
        "Cambios"
    );


    /* -----------------------------------------------------
       HOJA 7 — OBSERVACIONES
    ----------------------------------------------------- */

    const observationRows =
        details
            .filter(
                (detail) =>
                    getOrder(detail)
                        ?.observacion
            )
            .map(
                (detail) => {

                    const order =
                        getOrder(detail);

                    return {

                        "N° Venta":
                            order?.numero_venta ??
                            order?.id ??
                            "-",

                        "Fecha":
                            formatDate(
                                order?.created_at
                            ),

                        "Observaciones":
                            order?.observacion ||
                            ""

                    };

                }
            );


    const observationsSheet =
        XLSX.utils.json_to_sheet(
            observationRows
        );


    observationsSheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 100 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        observationsSheet,
        "Observaciones"
    );


    /* -----------------------------------------------------
       DESCARGA
    ----------------------------------------------------- */

    XLSX.writeFile(
        workbook,
        `Reporte_Ventas_${getFilenameDate()}.xlsx`
    );
};


/* =========================================================
   PDF
========================================================= */

const exportPDF = ({
    sales = [],
    details = [],
    summary = {},
    filters = {},
}) => {

    const doc =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });


    const pageWidth =
        doc.internal.pageSize
            .getWidth();


    const pageHeight =
        doc.internal.pageSize
            .getHeight();


    const generatedAt =
        formatDate(
            new Date().toISOString()
        );


    /* -----------------------------------------------------
       ENCABEZADO
    ----------------------------------------------------- */

    doc.setFontSize(18);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "BOUTIQUE PET LOVE",
        14,
        15
    );


    doc.setFontSize(13);

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "REPORTE DE VENTAS",
        14,
        23
    );


    doc.setFontSize(9);

    doc.text(
        `Período: ${
            filters?.from ||
            "Inicio"
        } al ${
            filters?.to ||
            "Hoy"
        }`,
        14,
        30
    );


    doc.text(
        `Generado: ${
            generatedAt
        }`,
        pageWidth - 14,
        30,
        {
            align: "right"
        }
    );


    /* -----------------------------------------------------
       RESUMEN
    ----------------------------------------------------- */

    autoTable(
        doc,
        {

            startY: 36,

            head: [[
                "Ventas totales",
                "Cantidad de ventas",
                "Ticket promedio"
            ]],

            body: [[

                formatCurrency(
                    summary?.totalSales
                ),

                String(
                    summary?.totalOrders ||
                    0
                ),

                formatCurrency(
                    summary?.averageTicket
                )

            ]],

            styles: {
                fontSize: 9
            },

            headStyles: {
                fontStyle: "bold"
            }

        }
    );


    /* -----------------------------------------------------
       TABLA PRINCIPAL
    ----------------------------------------------------- */

    const salesStartY =
        doc.lastAutoTable.finalY +
        8;


    doc.setFontSize(12);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Ventas contabilizadas",
        14,
        salesStartY
    );


    const salesTable =
        sales.map(
            (sale) => {

                const detail =
                    findDetail(
                        details,
                        sale?.order_id
                    );

                const order =
                    getOrder(detail);

                const reportSale =
                    getReportSale(
                        detail,
                        sale
                    );


                return [

                    sale?.numero_venta ??
                    order?.numero_venta ??
                    sale?.order_id ??
                    "-",

                    formatDate(
                        sale?.fecha_venta ??
                        order?.created_at
                    ),

                    getTipoVentaLabel(
                        sale?.tipo_venta
                    ),

                    getMedioPagoLabel(
                        sale?.medio_pago
                    ),

                    formatCurrency(
                        getSubtotal(order)
                    ),

                    formatCurrency(
                        order?.costo_envio
                    ),

                    formatCurrency(
                        order?.total ??
                        sale?.total
                    ),

                    formatCurrency(
                        getAdditionalPayment(
                            reportSale
                        )
                    ),

                    formatCurrency(
                        getTotalCharged(
                            reportSale,
                            order
                        )
                    )

                ];

            }
        );


    autoTable(
        doc,
        {

            startY:
                salesStartY + 4,

            head: [[
                "Venta",
                "Fecha",
                "Tipo",
                "Pago",
                "Subtotal",
                "Envío",
                "Original",
                "Cambio",
                "Cobrado"
            ]],

            body: salesTable,

            styles: {
                fontSize: 7,
                cellPadding: 2
            },

            headStyles: {
                fontStyle: "bold"
            },

            columnStyles: {

                0: {
                    cellWidth: 13
                },

                1: {
                    cellWidth: 27
                },

                2: {
                    cellWidth: 18
                },

                3: {
                    cellWidth: 25
                },

                4: {
                    cellWidth: 24
                },

                5: {
                    cellWidth: 20
                },

                6: {
                    cellWidth: 24
                },

                7: {
                    cellWidth: 20
                },

                8: {
                    cellWidth: 25
                }

            }

        }
    );


    /* -----------------------------------------------------
       DETALLE DE CADA VENTA
    ----------------------------------------------------- */

    details.forEach(
        (detail) => {

            const order =
                getOrder(detail);

            const reportSale =
                detail?.reportSale ||
                {};

            const items =
                getItems(order);


            doc.addPage();


            /* ENCABEZADO */

            doc.setFontSize(15);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                `Detalle de venta #${
                    order?.numero_venta ??
                    order?.id ??
                    "-"
                }`,
                14,
                15
            );


            doc.setFontSize(9);

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Fecha: ${
                    formatDate(
                        order?.created_at
                    )
                }`,
                14,
                22
            );


            doc.text(
                `Tipo: ${
                    getTipoVentaLabel(
                        order?.tipo_venta
                    )
                }`,
                14,
                28
            );


            doc.text(
                `Medio de pago: ${
                    getMedioPagoLabel(
                        order?.medio_pago
                    )
                }`,
                14,
                34
            );


            doc.text(
                `Estado: ${
                    order?.estado ||
                    "-"
                }`,
                14,
                40
            );


            doc.text(
                `Estado de pago: ${
                    getEstadoPagoLabel(
                        order?.estado_pago
                    )
                }`,
                14,
                46
            );


            /* ------------------------------------------------
               CLIENTE
            ------------------------------------------------ */

            doc.setFontSize(11);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                "Cliente",
                14,
                57
            );


            doc.setFontSize(9);

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Nombre: ${
                    order?.nombre ||
                    "-"
                }`,
                14,
                64
            );


            doc.text(
                `RUT: ${
                    order?.rut ||
                    "-"
                }`,
                14,
                70
            );


            doc.text(
                `Correo: ${
                    order?.correo ||
                    "-"
                }`,
                14,
                76
            );


            doc.text(
                `Teléfono: ${
                    order?.telefono ||
                    "-"
                }`,
                14,
                82
            );


            /* ------------------------------------------------
               DESPACHO
            ------------------------------------------------ */

            doc.setFontSize(11);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                "Despacho",
                14,
                94
            );


            doc.setFontSize(9);

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Dirección: ${
                    order?.direccion ||
                    "-"
                }`,
                14,
                101
            );


            doc.text(
                `Comuna: ${
                    order?.comuna ||
                    "-"
                }`,
                14,
                107
            );


            doc.text(
                `Región: ${
                    order?.region ||
                    "-"
                }`,
                14,
                113
            );


            doc.text(
                `Empresa envío: ${
                    order?.empresa_envio ||
                    "-"
                }`,
                14,
                119
            );


            doc.text(
                `Costo envío: ${
                    formatCurrency(
                        order?.costo_envio
                    )
                }`,
                14,
                125
            );


            doc.text(
                `Envío por pagar: ${
                    order?.envio_por_pagar
                        ? "Sí"
                        : "No"
                }`,
                14,
                131
            );


            /* ------------------------------------------------
               PRODUCTOS
            ------------------------------------------------ */

            doc.setFontSize(11);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                "Productos",
                100,
                57
            );


            autoTable(
                doc,
                {

                    startY: 61,

                    margin: {
                        left: 100,
                        right: 14
                    },

                    head: [[
                        "Producto",
                        "Talla",
                        "Cant.",
                        "Precio",
                        "Total"
                    ]],

                    body:
                        items.map(
                            (item) => [

                                getItemName(
                                    item
                                ),

                                getItemSize(
                                    item
                                ),

                                getItemQuantity(
                                    item
                                ),

                                formatCurrency(
                                    getItemPrice(
                                        item
                                    )
                                ),

                                formatCurrency(
                                    getItemTotal(
                                        item
                                    )
                                )

                            ]
                        ),

                    styles: {
                        fontSize: 7,
                        cellPadding: 2
                    },

                    headStyles: {
                        fontStyle: "bold"
                    }

                }
            );


            let currentY =
                doc.lastAutoTable.finalY +
                10;


            /* ------------------------------------------------
               CAMBIO
            ------------------------------------------------ */

            if (
                reportSale?.exchange_id
            ) {

                doc.setFontSize(11);

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "Cambio",
                    100,
                    currentY
                );


                currentY += 7;


                doc.setFontSize(9);

                doc.setFont(
                    "helvetica",
                    "normal"
                );


                doc.text(
                    `Fecha: ${
                        formatDate(
                            reportSale
                                ?.cambio_fecha
                        )
                    }`,
                    100,
                    currentY
                );


                currentY += 6;


                doc.text(
                    `Adicional: ${
                        formatCurrency(
                            reportSale
                                ?.adicional_cambio
                        )
                    }`,
                    100,
                    currentY
                );


                currentY += 6;


                doc.text(
                    `Estado: ${
                        getEstadoPagoLabel(
                            reportSale
                                ?.estado_pago_cambio
                        )
                    }`,
                    100,
                    currentY
                );


                currentY += 6;


                doc.text(
                    `Medio: ${
                        getMedioPagoLabel(
                            reportSale
                                ?.medio_pago_cambio
                        )
                    }`,
                    100,
                    currentY
                );

            }


            /* ------------------------------------------------
               TOTALES
            ------------------------------------------------ */

            const totalsY =
                Math.max(
                    currentY + 10,
                    140
                );


            autoTable(
                doc,
                {

                    startY: totalsY,

                    margin: {
                        left: 145,
                        right: 14
                    },

                    body: [

                        [
                            "Subtotal productos",
                            formatCurrency(
                                getSubtotal(
                                    order
                                )
                            )
                        ],

                        [
                            "Envío",
                            formatCurrency(
                                order?.costo_envio
                            )
                        ],

                        [
                            "Total original",
                            formatCurrency(
                                order?.total
                            )
                        ],

                        [
                            "Adicional por cambios",
                            formatCurrency(
                                getAdditionalPayment(
                                    reportSale
                                )
                            )
                        ],

                        [
                            "TOTAL COBRADO",
                            formatCurrency(
                                getTotalCharged(
                                    reportSale,
                                    order
                                )
                            )
                        ]

                    ],

                    styles: {
                        fontSize: 9,
                        cellPadding: 3
                    },

                    columnStyles: {

                        0: {
                            fontStyle:
                                "bold"
                        },

                        1: {
                            halign:
                                "right"
                        }

                    }

                }
            );


            /* ------------------------------------------------
               OBSERVACIONES
            ------------------------------------------------ */

            if (
                order?.observacion
            ) {

                let observationY =
                    doc.lastAutoTable.finalY +
                    8;


                if (
                    observationY >
                    pageHeight - 35
                ) {

                    doc.addPage();

                    observationY = 20;

                }


                doc.setFontSize(10);

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "Observaciones",
                    14,
                    observationY
                );


                observationY += 6;


                doc.setFontSize(8);

                doc.setFont(
                    "helvetica",
                    "normal"
                );


                const lines =
                    doc.splitTextToSize(
                        String(
                            order.observacion
                        ),
                        125
                    );


                doc.text(
                    lines,
                    14,
                    observationY
                );

            }

        }
    );


    /* -----------------------------------------------------
       PIE DE PÁGINA
    ----------------------------------------------------- */

    const totalPages =
        doc.internal
            .getNumberOfPages();


    for (
        let page = 1;
        page <= totalPages;
        page += 1
    ) {

        doc.setPage(page);

        doc.setFontSize(7);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            `Boutique Pet Love — Página ${page} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 7,
            {
                align: "center"
            }
        );

    }


    /* -----------------------------------------------------
       DESCARGA
    ----------------------------------------------------- */

    doc.save(
        `Reporte_Ventas_${getFilenameDate()}.pdf`
    );
};


/* =========================================================
   EXPORTACIÓN PÚBLICA
========================================================= */

const ReportesExportService = {

    exportExcel,

    exportPDF,

};


export default ReportesExportService;

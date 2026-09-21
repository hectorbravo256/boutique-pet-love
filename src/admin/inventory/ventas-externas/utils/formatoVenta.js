import {
    formatearFechaHoraChile
} from "../../utils/fechaChile";


/* =====================================================
   FORMATO MONEDA
===================================================== */

export const moneda = (valor) =>
    `$${Number(valor || 0).toLocaleString("es-CL")}`;


/* =====================================================
   NORMALIZAR FECHA DE ORDERS
===================================================== */

/*
 * orders.created_at se almacena sin zona horaria,
 * pero representa un timestamp UTC.
 *
 * Se agrega explícitamente "Z" para que JavaScript
 * lo interprete como UTC antes de convertirlo a
 * America/Santiago mediante formatearFechaHoraChile().
 */

export const normalizarFechaOrderUTC = (fecha) => {

    if (!fecha) {
        return null;
    }

    const fechaTexto = String(fecha);

    /*
     * Si ya contiene información de zona horaria
     * (+00:00, -03:00, Z, etc.), no modificar.
     */

    if (
        fechaTexto.endsWith("Z") ||
        /[+-]\d{2}:\d{2}$/.test(fechaTexto)
    ) {
        return fechaTexto;
    }

    return `${fechaTexto}Z`;
};


/* =====================================================
   FORMATO FECHA DE VENTA
===================================================== */

export const fechaVenta = (fecha) => {

    const fechaUTC =
        normalizarFechaOrderUTC(fecha);

    return formatearFechaHoraChile(fechaUTC);
};


/* =====================================================
   ETIQUETA CANAL
===================================================== */

export const etiquetaCanal = (tipo) => {

    if (tipo === "rrss") {
        return "📱 RRSS";
    }

    return "🏪 Presencial";
};


/* =====================================================
   ETIQUETA MEDIO DE PAGO
===================================================== */

export const etiquetaPago = (medio) => {

    switch (medio) {

        case "efectivo":
            return "💵 Efectivo";

        case "transferencia":
            return "🏦 Transferencia";

        case "POS TUU":
            return "💳 POS TUU";

        case "mercado_pago":
            return "🟢 Mercado Pago";

        default:
            return medio || "-";

    }

};

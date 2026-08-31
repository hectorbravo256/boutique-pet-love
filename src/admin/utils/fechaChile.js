const CHILE_TIMEZONE = "America/Santiago";

export const formatearFechaChile = (
    fecha,
    opciones = {}
) => {

    if (!fecha) {
        return "-";
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return "-";
    }

    return fechaObj.toLocaleDateString(
        "es-CL",
        {
            timeZone: CHILE_TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            ...opciones
        }
    );
};


export const formatearFechaHoraChile = (
    fecha,
    opciones = {}
) => {

    if (!fecha) {
        return "-";
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return "-";
    }

    return fechaObj.toLocaleString(
        "es-CL",
        {
            timeZone: CHILE_TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            ...opciones
        }
    );
};


export const formatearHoraChile = (
    fecha
) => {

    if (!fecha) {
        return "-";
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return "-";
    }

    return fechaObj.toLocaleTimeString(
        "es-CL",
        {
            timeZone: CHILE_TIMEZONE,
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};


export const CHILE_TIMEZONE_VALUE =
    CHILE_TIMEZONE;

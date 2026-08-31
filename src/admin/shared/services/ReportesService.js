import ApiClient from "../api/ApiClient";

const CHILE_TIMEZONE = "America/Santiago";

const chileDateToUTC = (dateString) => {

    const [year, month, day] =
        dateString.split("-").map(Number);

    const targetUTC =
        Date.UTC(
            year,
            month - 1,
            day,
            0,
            0,
            0
        );

    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: CHILE_TIMEZONE,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23"
            }
        );

    const parts =
        formatter
            .formatToParts(
                new Date(targetUTC)
            )
            .reduce(
                (acc, part) => {
                    if (part.type !== "literal") {
                        acc[part.type] = part.value;
                    }
                    return acc;
                },
                {}
            );

    const chileWallUTC =
        Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
            Number(parts.hour),
            Number(parts.minute),
            Number(parts.second)
        );

    const offset =
        chileWallUTC - targetUTC;

    return new Date(
        targetUTC - offset
    ).toISOString();
};

class ReportesService {

    async getSales({ from, to, tipoVenta, medioPago } = {}) {

        try {

            let query = ApiClient.db
                .from("vw_reportes_ventas")
                .select("*")
                .order("fecha_venta", { ascending: false });

            // Filtro por fecha inicial
if (from) {
    query = query.gte(
        "fecha_venta",
        chileDateToUTC(from)
    );
}

// Filtro por fecha final
// Se usa el día siguiente como límite exclusivo
// para incluir todas las ventas del día seleccionado.
if (to) {

    const [year, month, day] =
        to.split("-").map(Number);

    const nextDay =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day + 1
            )
        );

    const nextDayString =
        nextDay
            .toISOString()
            .slice(0, 10);

    query = query.lt(
        "fecha_venta",
        chileDateToUTC(nextDayString)
    );
}

            // Filtro por tipo de venta
            if (tipoVenta && tipoVenta !== "todos") {
                query = query.eq("tipo_venta", tipoVenta);
            }

            // Filtro por medio de pago
            if (medioPago && medioPago !== "todos") {
                query = query.eq("medio_pago", medioPago);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            return data ?? [];

        } catch (error) {

            console.error(
                "ReportesService.getSales:",
                error
            );

            throw error;
        }
    }


    async getSummary(filters = {}) {

        const sales = await this.getSales(filters);

        const totalSales = sales.reduce(
            (sum, sale) =>
                sum + Number(sale.total || 0),
            0
        );

        const totalOrders = sales.length;

        const averageTicket =
            totalOrders > 0
                ? totalSales / totalOrders
                : 0;

        return {
            totalSales,
            totalOrders,
            averageTicket,
            sales
        };
    }

}


export default new ReportesService();

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

    /**
     * Obtiene las ventas contabilizadas para el reporte.
     *
     * NO modifica la lógica existente del reporte.
     */
    async getSales({
        from,
        to,
        tipoVenta,
        medioPago
    } = {}) {

        try {

            let query = ApiClient.db
                .from("vw_reportes_ventas")
                .select("*")
                .order("fecha_venta", {
                    ascending: false
                });


            // Filtro por fecha inicial
            if (from) {

                query = query.gte(
                    "fecha_venta",
                    chileDateToUTC(from)
                );

            }


            // Filtro por fecha final
            // Se utiliza el día siguiente como
            // límite exclusivo para incluir
            // todo el día seleccionado.

            if (to) {

                const [
                    year,
                    month,
                    day
                ] =
                    to
                        .split("-")
                        .map(Number);

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
            if (
                tipoVenta &&
                tipoVenta !== "todos"
            ) {

                query = query.eq(
                    "tipo_venta",
                    tipoVenta
                );

            }


            // Filtro por medio de pago
            if (
                medioPago &&
                medioPago !== "todos"
            ) {

                query = query.eq(
                    "medio_pago",
                    medioPago
                );

            }


            const {
                data,
                error
            } = await query;


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


    /**
     * Obtiene el detalle completo de una venta.
     *
     * Se consulta directamente orders para no
     * sobrecargar ni modificar la vista de reportes.
     *
     * También recupera los cambios asociados
     * a la venta, si existen.
     */
    async getSaleDetail(orderId) {

        try {

            if (!orderId) {

                throw new Error(
                    "Debe indicar el ID de la venta."
                );

            }


            // -------------------------------------------------
            // VENTA
            // -------------------------------------------------

            const {
                data: order,
                error: orderError
            } = await ApiClient.db
                .from("orders")
                .select("*")
                .eq("id", orderId)
                .single();


            if (orderError) {
                throw orderError;
            }


            // -------------------------------------------------
            // CAMBIOS ASOCIADOS
            // -------------------------------------------------

            const {
                data: exchanges,
                error: exchangesError
            } = await ApiClient.db
                .from("sale_exchanges")
                .select("*")
                .eq("order_id", orderId)
                .order("created_at", {
                    ascending: false
                });


            if (exchangesError) {

                console.warn(
                    "ReportesService.getSaleDetail: no se pudieron obtener los cambios.",
                    exchangesError
                );

            }


            return {
                order,
                exchanges: exchanges ?? []
            };

        } catch (error) {

            console.error(
                "ReportesService.getSaleDetail:",
                error
            );

            throw error;
        }
    }


    /**
     * Obtiene los totales del reporte.
     *
     * total_cobrado mantiene prioridad sobre
     * total para considerar cobros adicionales
     * generados por cambios.
     */
    async getSummary(filters = {}) {

        const sales =
            await this.getSales(filters);


        const totalSales =
            sales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.total_cobrado ??
                        sale.total ??
                        0
                    ),
                0
            );


        const totalOrders =
            sales.length;


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

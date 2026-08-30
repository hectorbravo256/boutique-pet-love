import ApiClient from "../api/ApiClient";

class ReportesService {

    async getSales({ from, to, tipoVenta, medioPago } = {}) {

        try {

            let query = ApiClient.db
                .from("vw_reportes_ventas")
                .select("*")
                .order("fecha_venta", { ascending: false });

            // Filtro por fecha inicial
            if (from) {
                query = query.gte("fecha_venta", from);
            }

            // Filtro por fecha final
            if (to) {
                query = query.lte("fecha_venta", to);
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

import ApiClient from "../api/ApiClient";

class DashboardService {

    async getSummary() {

        try {

            // ---------------------------------------------------------
            // DASHBOARD GENERAL
            // ---------------------------------------------------------

            const { data, error } =
                await ApiClient.db
                    .from("vw_dashboard_summary")
                    .select("*")
                    .single();

            if (error) {
                throw error;
            }

            // ---------------------------------------------------------
            // ALERTAS
            // ---------------------------------------------------------

            const alerts =
                await this.getAlerts();

            // ---------------------------------------------------------
            // PAKET
            // ---------------------------------------------------------
            // PAKET es un módulo complementario del Dashboard.
            //
            // Un error en vw_dashboard_shipping NO debe impedir
            // que ventas, inventario y compras continúen funcionando.
            // ---------------------------------------------------------

            let shipping = {

                paketShipments: 0,

                paketCost: 0,

                paketReimbursementPending: 0,

                paketReimbursed: 0,

                paketCostAbsorbed: 0,

                paketChargedToCustomers: 0

            };

            const {
                data: shippingData,
                error: shippingError
            } =
                await ApiClient.db
                    .from("vw_dashboard_shipping")
                    .select("*")
                    .single();

            if (shippingError) {

                console.warn(
                    "DashboardService.getSummary: no fue posible cargar las métricas PAKET. El Dashboard general continuará funcionando.",
                    shippingError
                );

            } else if (shippingData) {

                shipping = {

                    paketShipments:
                        shippingData.paket_shipments ?? 0,

                    paketCost:
                        shippingData.paket_cost ?? 0,

                    paketReimbursementPending:
                        shippingData.paket_reimbursement_pending ?? 0,

                    paketReimbursed:
                        shippingData.paket_reimbursed ?? 0,

                    paketCostAbsorbed:
                        shippingData.paket_cost_absorbed ?? 0,

                    paketChargedToCustomers:
                        shippingData.paket_charged_to_customers ?? 0

                };

            }

            // ---------------------------------------------------------
            // RESPUESTA DEL DASHBOARD
            // ---------------------------------------------------------

            return {

                inventory: {

                    totalUnits:
                        data.inventory_units,

                    outOfStock:
                        data.out_of_stock,

                    lowStock:
                        data.low_stock,

                    inventoryValue:
                        data.inventory_value

                },

                sales: {

                    totalSales:
                        data.total_sales,

                    totalOrders:
                        data.total_orders,

                    averageTicket:
                        data.average_ticket,

                    salesMonth:
                        data.sales_month,

                    salesToday:
                        data.sales_today

                },

                purchases: {

                    totalMonth:
                        data.purchases_month,

                    countMonth:
                        data.purchases_count

                },

                shipping,

                alerts

            };

        } catch (error) {

            // ---------------------------------------------------------
            // FALLBACK GENERAL
            // ---------------------------------------------------------

            console.error(
                "DashboardService.getSummary:",
                error
            );

            return {

                inventory: {},

                sales: {},

                purchases: {},

                // Mantener siempre la estructura de shipping
                // para evitar errores en Dashboard.jsx.

                shipping: {

                    paketShipments: 0,

                    paketCost: 0,

                    paketReimbursementPending: 0,

                    paketReimbursed: 0,

                    paketCostAbsorbed: 0,

                    paketChargedToCustomers: 0

                },

                alerts: {

                    outOfStock: 0,

                    lowStock: 0,

                    alerts: []

                }

            };

        }

    }

    // =============================================================
    // ALERTAS DEL DASHBOARD
    // =============================================================

    async getAlerts() {

        try {

            const { data, error } =
                await ApiClient.db
                    .from("vw_dashboard_alerts")
                    .select("*");

            if (error) {
                throw error;
            }

            return {

                outOfStock:
                    data.filter(
                        a =>
                            a.alert_type === "OUT_OF_STOCK"
                    ).length,

                lowStock:
                    data.filter(
                        a =>
                            a.alert_type === "LOW_STOCK"
                    ).length,

                alerts: data

            };

        } catch (error) {

            console.error(
                "DashboardService.getAlerts:",
                error
            );

            return {

                outOfStock: 0,

                lowStock: 0,

                alerts: []

            };

        }

    }

}

export default new DashboardService();

import ApiClient from "../api/ApiClient";

class DashboardService {

async getSummary() {

    try {

        const { data, error } =
            await ApiClient.db
                .from("vw_dashboard_summary")
                .select("*")
                .single();

        if (error) throw error;

const alerts =
    await this.getAlerts();

const {
    data: shippingData,
    error: shippingError
} =
    await ApiClient.db
        .from("vw_dashboard_shipping")
        .select("*")
        .single();

if (shippingError) {
    throw shippingError;
}

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

    shipping: {

        paketShipments:
            shippingData.paket_shipments,

        paketCost:
            shippingData.paket_cost,

        paketReimbursementPending:
            shippingData.paket_reimbursement_pending,

        paketReimbursed:
            shippingData.paket_reimbursed,

        paketCostAbsorbed:
            shippingData.paket_cost_absorbed,

        paketChargedToCustomers:
            shippingData.paket_charged_to_customers

    },

    alerts

};

    } catch (error) {

        console.error(error);

return {

    inventory: {},

    sales: {},

    purchases: {},

    alerts: {

        outOfStock: 0,

        lowStock: 0,

        alerts: []

    }

};

    }

}



    async getAlerts() {

    try {

        const { data, error } =
            await ApiClient.db
                .from("vw_dashboard_alerts")
                .select("*");

        if (error) throw error;

        return {

            outOfStock:
                data.filter(
                    a => a.alert_type === "OUT_OF_STOCK"
                ).length,

            lowStock:
                data.filter(
                    a => a.alert_type === "LOW_STOCK"
                ).length,

            alerts: data

        };

    } catch (error) {

        console.error(error);

        return {

            outOfStock: 0,

            lowStock: 0,

            alerts: []

        };

    }

}

}

export default new DashboardService();

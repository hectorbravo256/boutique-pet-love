import ApiClient from "../api/ApiClient";

class DashboardService {

async getSummary() {

    const [

        inventory,

        sales

    ] = await Promise.all([

        this.getInventoryStats(),

        this.getSalesStats()

    ]);

    return {

        inventory,

        sales

    };

}

    async getInventoryStats() {

    const { data, error } = await ApiClient.db
        .from("product_variants")
        .select("stock");

    if (error) throw error;

    const totalUnits = data.reduce(
        (sum, item) => sum + (item.stock || 0),
        0
    );

    const outOfStock = data.filter(
        item => (item.stock || 0) === 0
    ).length;

    const lowStock = data.filter(
        item => (item.stock || 0) > 0 && (item.stock || 0) < 5
    ).length;

    return {
        totalUnits,
        outOfStock,
        lowStock
    };

}

    async getSalesStats() {

    try {

        const response = await fetch(
            "/.netlify/functions/get-orders"
        );

        const orders = await response.json();

        const totalOrders = orders.length;

        const totalSales = orders.reduce(
            (acc, order) =>
                acc + Number(order.total || 0),
            0
        );

        const averageTicket =
            totalOrders > 0
                ? totalSales / totalOrders
                : 0;

        const today = new Date().toLocaleDateString();

        const salesToday = orders
            .filter(order => {

                const date = new Date(
                    order.created_at
                ).toLocaleDateString();

                return date === today;

            })
            .reduce(
                (acc, order) =>
                    acc + Number(order.total || 0),
                0
            );

        const now = new Date();

        const salesMonth = orders
            .filter(order => {

                const date =
                    new Date(order.created_at);

                return (

                    date.getMonth() ===
                    now.getMonth()

                    &&

                    date.getFullYear() ===
                    now.getFullYear()

                );

            })
            .reduce(
                (acc, order) =>
                    acc + Number(order.total || 0),
                0
            );

        return {

            totalOrders,

            totalSales,

            averageTicket,

            salesToday,

            salesMonth

        };

    } catch (error) {

        console.error(error);

        return {

            totalOrders: 0,

            totalSales: 0,

            averageTicket: 0,

            salesToday: 0,

            salesMonth: 0

        };

    }

}

}

export default new DashboardService();

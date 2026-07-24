import ApiClient from "../api/ApiClient";

class DashboardService {

async getSummary() {

    const inventory = await this.getInventoryStats();

    return {
        inventory
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

}

export default new DashboardService();

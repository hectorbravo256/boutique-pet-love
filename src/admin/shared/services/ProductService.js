import BaseService from "@/admin/shared/services/BaseService";
import ApiClient from "@/admin/shared/api/ApiClient";

class ProductService extends BaseService {

    constructor() {
        super("products");
    }

    async getWithVariants() {

        const { data, error } = await ApiClient.db

            .from("products")

            .select(`
                *,
                product_variants(*),
                product_images(*)
            `)

            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        return data || [];

    }

    // 👇 NUEVO MÉTODO
    async getProducts() {

        const { data, error } = await ApiClient.db

            .from("products")

            .select(`
                *,
                product_variants(*),
                product_images(*)
            `)

            .order("sort_order", {
                foreignTable: "product_images",
                ascending: true
            })

            .order("name", {
                ascending: true
            });

        if (error) throw error;

        return data || [];

    }

    async deleteProduct(productId) {

    await ApiClient.db
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

    await ApiClient.db
        .from("product_images")
        .delete()
        .eq("product_id", productId);

    await ApiClient.db
        .from("products")
        .delete()
        .eq("id", productId);

}

}

export default new ProductService();

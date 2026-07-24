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

}

export default new ProductService();

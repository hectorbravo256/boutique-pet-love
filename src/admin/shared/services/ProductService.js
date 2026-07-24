import BaseService from "@/admin/shared/services/BaseService";
import { supabase } from "@/supabaseClient";

class ProductService extends BaseService {

    constructor() {
        super("products");
    }

    async getWithVariants() {

        const { data, error } = await supabase

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

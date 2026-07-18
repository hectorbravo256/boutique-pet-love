import { supabase } from "../../../lib/supabase";

const InventoryService = {

  async getDashboard() {

    const [
      { data: products, error: productsError },
      { data: variants, error: variantsError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id"),

      supabase
        .from("product_variants")
        .select("stock"),
    ]);

    if (productsError) throw productsError;
    if (variantsError) throw variantsError;

    const stockTotal = variants.reduce(
      (sum, item) => sum + (item.stock || 0),
      0
    );

    const stockCritico = variants.filter(
      item => (item.stock || 0) <= 5
    ).length;

    return {
      stockTotal,
      productos: products.length,
      variantes: variants.length,
      stockCritico,
    };

  }

};

export default InventoryService;

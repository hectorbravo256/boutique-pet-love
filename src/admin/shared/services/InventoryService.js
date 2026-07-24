import ApiClient from "@/admin/shared/api/ApiClient";

const InventoryService = {
  async getDashboard() {
    const [
      { data: variantes, error: variantesError },
      { count: productos, error: productosError },
      { count: variantesCount, error: variantesCountError },
    ] = await Promise.all([
      ApiClient.db
        .from("product_variants")
        .select("stock"),

      ApiClient.db
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("active", true),

      ApiClient.db
        .from("product_variants")
        .select("*", {
          count: "exact",
          head: true,
        }),
    ]);

    if (variantesError) throw variantesError;
    if (productosError) throw productosError;
    if (variantesCountError) throw variantesCountError;

    const stockTotal = (variantes || []).reduce(
      (sum, item) => sum + Number(item.stock || 0),
      0
    );

    const stockCritico = (variantes || []).filter(
      (item) => Number(item.stock) <= 3
    ).length;

    return {
      stockTotal,
      productos,
      variantes: variantesCount,
      stockCritico,
    };
  },
  
  async getMovements(limit = 15) {

    const { data, error } = await ApiClient.db

        .from("inventory_movements")

        .select(`
            *,
            products(name),
            product_variants(size)
        `)

        .order("created_at", {
            ascending: false
        })

        .limit(limit);

    if (error) throw error;

    return data || [];

},

  async getActiveProducts() {

    const { data, error } = await ApiClient.db

        .from("products")

        .select(`
            id,
            name,
            product_images(url)
        `)

        .eq("active", true)

        .order("name");

    if (error) throw error;

    return data || [];

}

  async getVariants(productId) {

    const { data, error } = await ApiClient.db

        .from("product_variants")

        .select("*")

        .eq("product_id", productId)

        .order("size");

    if (error) throw error;

    return data || [];

}
  
};

export default InventoryService;

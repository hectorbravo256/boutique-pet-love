import { supabase } from "../../../supabaseClient";

const InventoryService = {
  async getDashboard() {
    const [
      { data: variantes, error: variantesError },
      { count: productos, error: productosError },
      { count: variantesCount, error: variantesCountError },
    ] = await Promise.all([
      supabase
        .from("product_variants")
        .select("stock"),

      supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("active", true),

      supabase
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
};

export default InventoryService;

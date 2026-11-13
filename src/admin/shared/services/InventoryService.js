import ApiClient from "@/admin/shared/api/ApiClient";

const InventoryService = {

    //---------------------------------------------------------
    // DASHBOARD
    //---------------------------------------------------------

    async getDashboard() {

        const [

            { data: variants, error: variantsError },

            { count: products, error: productsError },

            { count: variantsCount, error: variantsCountError }

        ] = await Promise.all([

            ApiClient.db

                .from("product_variants")

                .select("stock"),

            ApiClient.db

                .from("products")

                .select("*", {

                    count: "exact",

                    head: true

                })

                .eq("active", true),

            ApiClient.db

                .from("product_variants")

                .select("*", {

                    count: "exact",

                    head: true

                })

        ]);

        if (variantsError) throw variantsError;
        if (productsError) throw productsError;
        if (variantsCountError) throw variantsCountError;

        const stockTotal =

            (variants || []).reduce(

                (sum, item) =>

                    sum + Number(item.stock || 0),

                0

            );

const stockCritico =
    (variants || []).filter(
        item => {
            const stock = Number(item.stock || 0);

            return stock > 0 && stock <= 3;
        }
    ).length;

        return {

            stockTotal,

            productos: products,

            variantes: variantsCount,

            stockCritico

        };

    },

    //---------------------------------------------------------
    // MOVIMIENTOS
    //---------------------------------------------------------


async getMovements({
  page = 1,
  pageSize = 20,
  type = "all",
  from = "",
  to = ""
} = {}) {
  const start = (page - 1) * pageSize;

  let query = ApiClient.db
    .from("inventory_movements")
    .select(`
      *,
      products(name),
      product_variants(size)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (type === "purchase") {
    query = query.eq("movement_type", "PURCHASE");
  } else if (type === "sale") {
    query = query.eq("movement_type", "SALE");
  } else if (type === "adjustment") {
    query = query.not(
      "physical_count_session_id",
      "is",
      null
    );
  }

  if (from) {
    query = query.gte(
      "created_at",
      new Date(`${from}T00:00:00`).toISOString()
    );
  }

  if (to) {
    const nextDay = new Date(`${to}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);

    query = query.lt(
      "created_at",
      nextDay.toISOString()
    );
  }

  const { data, count, error } = await query.range(
    start,
    start + pageSize - 1
  );

  if (error) throw error;

  return {
    movimientos: data || [],
    total: count || 0
  };
},

    //---------------------------------------------------------
    // PRODUCTOS ACTIVOS
    //---------------------------------------------------------

    async getActiveProducts() {

        const { data, error } = await ApiClient.db

            .from("products")

            .select(`
                id,
                name,
                category,
                product_images(
                    url,
                    sort_order
                )
            `)

            .eq("active", true)

            .order("name");

        if (error) throw error;

        //---------------------------------------
        // Ordenar imágenes
        //---------------------------------------

        (data || []).forEach(product => {

            product.product_images.sort(

                (a, b) =>

                    (a.sort_order ?? 999) -

                    (b.sort_order ?? 999)

            );

        });

        return data || [];

    },

    //---------------------------------------------------------
    // VARIANTES
    //---------------------------------------------------------

    async getVariants(productId) {

        const { data, error } = await ApiClient.db

            .from("product_variants")

            .select("*")

            .eq("product_id", productId);

        if (error) throw error;

        //---------------------------------------
        // Orden natural de tallas
        //---------------------------------------

        (data || []).sort((a, b) => {

            const sizeA = parseInt(

                String(a.size).replace(/\D/g, "")

            );

            const sizeB = parseInt(

                String(b.size).replace(/\D/g, "")

            );

            return sizeA - sizeB;

        });

        return data || [];

    },

    //---------------------------------------------------------
    // INFORMACIÓN VARIANTE
    //---------------------------------------------------------

    async getVariantInfo(variantId) {

        const { data, error } = await ApiClient.db

            .rpc("inventory_variant_info", {

                p_variant_id: variantId

            });

        if (error) throw error;

        return data?.[0] ?? null;

    },

    //---------------------------------------------------------
    // RESUMEN VARIANTE
    //---------------------------------------------------------

    async getVariantSummary(variantId) {

        const { data, error } = await ApiClient.db

            .from("vw_variant_summary")

            .select("*")

            .eq("variant_id", variantId)

            .single();

        if (error) throw error;

        return data;

    },

    //---------------------------------------------------------
    // INVENTARIO MAESTRO
    //---------------------------------------------------------

    async getInventoryMaster() {

        const { data, error } = await ApiClient.db

            .from("vw_inventory_master")

            .select("*")

            .order("product_name");

        if (error) throw error;

        return data || [];

    }

};

export default InventoryService;

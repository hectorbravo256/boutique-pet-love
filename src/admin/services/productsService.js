import { supabase }
from "../../supabaseClient";

export async function getProductById(id) {
  
 return await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq("id", id)
      .order("sort_order", {
  foreignTable: "product_images",
  ascending: true
})
      .single();

}

export async function getCategories() {

  return await supabase
  .from("categories")
  .select("*")
  .eq("active", true)
  .order("sort_order", {
    ascending: true
  });

}

export async function updateProductField(
  id,
  campo,
  valor
) {

  return await supabase
  .from("products")
  .update({
    [campo]: valor
  })
  .eq("id", id);

}

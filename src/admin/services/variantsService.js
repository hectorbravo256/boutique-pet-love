import { supabase }
from "../../supabaseClient";

export async function updateVariantPrice(
  variantId,
  price
) {

  return await supabase
  .from("product_variants")
  .update({
    price
  })
  .eq("id", variantId);

}

export async function updateVariantStock(
  variantId,
  stock
) {

  return await supabase
  .from("product_variants")
  .update({
    stock
  })
  .eq("id", variantId);

}

export async function deleteVariant(
  variantId
) {

  return await supabase
  .from("product_variants")
  .delete()
  .eq("id", variantId);

}

export async function createVariant(
  variant
) {

  return await supabase
  .from("product_variants")
  .insert([variant])
  .select()
  .single();

}

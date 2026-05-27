import { supabase }
from "../../supabaseClient";

export async function uploadImage(
  nombre,
  file
) {

  return await supabase.storage
  .from("products")
  .upload(nombre, file);

}

export async function createProductImage(
  image
) {

  return await supabase
  .from("product_images")
  .insert([image])
  .select()
  .single();

}

export async function deleteProductImage(
  imageId
) {

  return await supabase
  .from("product_images")
  .delete()
  .eq("id", imageId);

}

export async function updateImageSort(
  imageId,
  sort_order
) {

  return await supabase
  .from("product_images")
  .update({
    sort_order
  })
  .eq("id", imageId);

}

export function getImageUrl(
  nombre
) {

  return supabase.storage
  .from("products")
  .getPublicUrl(nombre);

}

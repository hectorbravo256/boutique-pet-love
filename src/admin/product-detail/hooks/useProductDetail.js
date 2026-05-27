import { useEffect, useState } from "react";

import { arrayMove }
from "@dnd-kit/sortable";

import {
  getProductById,
  getCategories,
  updateProductField
}
from "../../services/productsService";

import {
  updateVariantPrice,
  updateVariantStock,
  deleteVariant,
  createVariant
}
from "../../services/variantsService";

import {
  uploadImage,
  createProductImage,
  deleteProductImage,
  updateImageSort,
  getImageUrl
}
from "../../services/imageService";

export default function useProductDetail(id) {

    const [producto, setProducto] = useState(null);

  const [categories, setCategories] =
  useState([]);

  const [guardandoInfo, setGuardandoInfo] =
  useState(false);

  const [estadoGuardado, setEstadoGuardado] =
    useState({});
  
  const [mostrarModal, setMostrarModal] =
  useState(false);

const [nuevaTalla, setNuevaTalla] =
  useState("");

const [nuevoPrecio, setNuevoPrecio] =
  useState("");

const [nuevoStock, setNuevoStock] =
  useState("");

  const [subiendoImagen, setSubiendoImagen] =
  useState(false);
  

    // 🔄 cargar producto
useEffect(() => {

  cargarProducto();

  cargarCategorias();

}, [id]);

  
    const cargarProducto = async () => {

    const { data } =
  await getProductById(id);


    if (!data) return;

    if (!data.slug) {

  data.slug =
    generarSlug(data.name);

}

if (!data.meta_title) {

  data.meta_title =
    data.name;

}

if (!data.meta_description) {

  data.meta_description =
    data.description || "";

}

    const ordenTallas = {
      XXS: 1,
      XS: 2,
      S: 3,
      M: 4,
      L: 5,
      XL: 6,
      XXL: 7,
      XXXL: 8,

      "TALLA 0": 20,
      "TALLA 1": 21,
      "TALLA 2": 22,
      "TALLA 3": 23,
      "TALLA 4": 24,
      "TALLA 5": 25,
      "TALLA 6": 26,
      "TALLA 7": 27,
      "TALLA 8": 28,
      "TALLA 9": 29,
      "TALLA 10": 30,
      "TALLA 11": 31,
      "TALLA 12": 32
    };

    data.product_variants.sort((a, b) => {

      const tallaA =
        ordenTallas[
          a.size?.trim().toUpperCase()
        ] || 999;

      const tallaB =
        ordenTallas[
          b.size?.trim().toUpperCase()
        ] || 999;

      return tallaA - tallaB;

    });

    data.product_images.sort(
  (a, b) =>
    (a.sort_order || 0)
    -
    (b.sort_order || 0)
);

setProducto(data);

  };

    const cargarCategorias = async () => {

  const { data } =
    await getCategories();


  setCategories(data || []);

};

    const actualizarProducto = async (
  campo,
  valor
) => {

  try {

    setGuardandoInfo(true);

    // 🔥 UI inmediata
    setProducto(prev => ({
      ...prev,
      [campo]: valor
    }));

    // 🔥 guardar db
    const { error } =
      await updateProductField(
  producto.id,
  campo,
  valor
);

    if (error) {
      console.error(error);
    }

  } catch (err) {

    console.error(err);

  } finally {

    setGuardandoInfo(false);

  }

};

    const generarSlug = (texto) => {

  return texto
    ?.toLowerCase()

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )

    .replace(/\s+/g, "-")

    .replace(/-+/g, "-");

};

  // 🔥 actualizar precio
  const actualizarPrecio = async (
    variantId,
    nuevoPrecio
  ) => {

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.map(v =>
          v.id === variantId
            ? { ...v, price: nuevoPrecio }
            : v
        )
    }));

    setEstadoGuardado(prev => ({
      ...prev,
      [variantId]: "saving"
    }));

await updateVariantPrice(
  variantId,
  nuevoPrecio
);
    setEstadoGuardado(prev => ({
      ...prev,
      [variantId]: "saved"
    }));

    setTimeout(() => {

      setEstadoGuardado(prev => ({
        ...prev,
        [variantId]: "idle"
      }));

    }, 1800);

  };

  // 🔥 actualizar stock
  const actualizarStock = async (
    variantId,
    nuevoStock
  ) => {

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.map(v =>
          v.id === variantId
            ? { ...v, stock: nuevoStock }
            : v
        )
    }));

    setEstadoGuardado(prev => ({
      ...prev,
      [`stock-${variantId}`]: "saving"
    }));

await updateVariantStock(
  variantId,
  nuevoStock
);

    setEstadoGuardado(prev => ({
      ...prev,
      [`stock-${variantId}`]: "saved"
    }));

    setTimeout(() => {

      setEstadoGuardado(prev => ({
        ...prev,
        [`stock-${variantId}`]: "idle"
      }));

    }, 1800);

  };

  // 🔥 eliminar talla
  const eliminarVariante = async (variantId) => {

    if (!confirm("¿Eliminar talla?")) return;

await deleteVariant(
  variantId
);

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.filter(
          v => v.id !== variantId
        )
    }));

  };

  // 🔥 agregar talla

  const agregarVariante = async () => {

  if (!nuevaTalla) {
    alert("Selecciona una talla");
    return;
  }

  // 🔥 evitar duplicados
  const existe =
    producto.product_variants.some(
      v =>
        v.size?.trim().toUpperCase()
        ===
        nuevaTalla.trim().toUpperCase()
    );

  if (existe) {
    alert("La talla ya existe");
    return;
  }

const { data } =
  await createVariant({
    product_id: producto.id,

    size: nuevaTalla,

    price:
      parseInt(nuevoPrecio)
      || 0,

    stock:
      parseInt(nuevoStock)
      || 0
  });

  setProducto(prev => ({
    ...prev,
    product_variants: [
      ...prev.product_variants,
      data
    ]
  }));

  // reset
  setNuevaTalla("");
  setNuevoPrecio("");
  setNuevoStock("");

  setMostrarModal(false);

  cargarProducto();

};

      const subirImagen = async (file) => {

  if (!file) return;

  try {

    setSubiendoImagen(true);

    const nombre =
      `${Date.now()}-${file.name}`;

    // 🔥 subir storage
const { error: uploadError } =
  await uploadImage(
    nombre,
    file
  );

   if (uploadError) {

  console.error(
    "SUPABASE STORAGE ERROR:",
    uploadError
  );

  alert(
    uploadError.message ||
    JSON.stringify(uploadError)
  );

  return;
}

    // 🔥 obtener url
const { data } =
  getImageUrl(nombre);

const url =
  data.publicUrl;

    // 🔥 guardar db
const { data: nueva } =
  await createProductImage({
    product_id: producto.id,

    url,

    sort_order:
      producto.product_images.length
  });

    // 🔥 actualizar UI
    setProducto(prev => ({
      ...prev,
      product_images: [
        ...prev.product_images,
        nueva
      ]
    }));

  } catch (err) {

    console.error(err);

  } finally {

    setSubiendoImagen(false);

  }

};

  const eliminarImagen = async (id) => {

  if (!confirm("¿Eliminar imagen?"))
    return;

await deleteProductImage(id);

  setProducto(prev => ({
    ...prev,
    product_images:
      prev.product_images.filter(
        img => img.id !== id
      )
  }));

};


const handleDragEnd = async (
  event
) => {

  const {
    active,
    over
  } = event;

  if (!over) return;

  if (active.id === over.id)
    return;

  const oldIndex =
    producto.product_images.findIndex(
      img => img.id === active.id
    );

  const newIndex =
    producto.product_images.findIndex(
      img => img.id === over.id
    );

  // 🔥 nuevo orden
  const nuevas =
    arrayMove(
      producto.product_images,
      oldIndex,
      newIndex
    );

  // 🔥 asignar sort_order correcto
  const actualizadas =
    nuevas.map((img, index) => ({
      ...img,
      sort_order: index
    }));

  // 🔥 actualizar UI inmediato
  setProducto(prev => ({
    ...prev,
    product_images: actualizadas
  }));

  try {

    // 🔥 guardar TODAS
const updates =
  actualizadas.map(img =>

    updateImageSort(
      img.id,
      img.sort_order
    )

  );

    await Promise.all(updates);

    // 🔥 recargar desde DB
    await cargarProducto();

  } catch (err) {

    console.error(
      "Error guardando orden",
      err
    );

  }

};

return {

  producto,
  setProducto,

  categories,

  guardandoInfo,

  estadoGuardado,
  setEstadoGuardado,

  mostrarModal,
  setMostrarModal,

  nuevaTalla,
  setNuevaTalla,

  nuevoPrecio,
  setNuevoPrecio,

  nuevoStock,
  setNuevoStock,

  subiendoImagen,
  setSubiendoImagen,

  cargarProducto,

  actualizarProducto,

  generarSlug,

  actualizarPrecio,
  actualizarStock,

  eliminarVariante,
  agregarVariante,

  subirImagen,
  eliminarImagen,

  handleDragEnd

};

}

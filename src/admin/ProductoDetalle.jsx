import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AdminCard from "./components/AdminCard";
import AdminButton from "./components/AdminButton";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import {
  CSS
} from "@dnd-kit/utilities";

import AdminModal
from "./components/AdminModal";

function SortableImage({
  img,
  index,
  eliminarImagen
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: img.id
  });

  const style = {
    transform:
      CSS.Transform.toString(transform),

    transition
  };


  return (

<div
  ref={setNodeRef}

  style={style}

  className="
    group
    relative

    overflow-hidden

    rounded-[30px]

    border
    border-slate-100

    bg-white

    shadow-[0_10px_30px_rgba(15,23,42,0.05)]

    hover:-translate-y-1
    hover:shadow-[0_25px_60px_rgba(236,72,153,0.10)]

    transition-all
    duration-300
  "
>

      {/* drag handle */}
<div
  {...attributes}
  {...listeners}

  className="
    absolute

    top-3
    left-3

    z-20

    flex
    items-center
    justify-center

    w-11
    h-11

    rounded-2xl

    bg-white/90
    backdrop-blur-md

    border
    border-white

    shadow-lg

    cursor-grab

    text-slate-700
    font-black

    opacity-0
    group-hover:opacity-100

    transition-all
  "
>
        ⋮⋮
      </div>

      {/* imagen */}
<img
  src={img.url}

  className="
    w-full
    h-[240px]

    object-cover

    transition-all
    duration-500

    group-hover:scale-105
  "
/>

      {/* portada */}
      {index === 0 && (

<div className="
  absolute

  bottom-3
  left-3

  rounded-full

  bg-black/80
  backdrop-blur-md

  px-4
  py-2

  text-xs
  font-black

  text-white

  shadow-lg
">
          Portada
        </div>

      )}

      {/* eliminar */}
      <button
        onClick={() =>
          eliminarImagen(img.id)
        }

className="
  absolute

  top-3
  right-3

  z-20

  flex
  items-center
  justify-center

  w-11
  h-11

  rounded-2xl

  bg-white/90
  backdrop-blur-md

  border
  border-white

  shadow-lg

  text-red-500
  font-black

  opacity-0
  group-hover:opacity-100

  hover:bg-red-500
  hover:text-white

  transition-all
"
      >
        ✕
      </button>

    </div>

  );

}

export default function ProductoDetalle() {

  const { id } = useParams();

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

    const { data } = await supabase
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
    await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", {
        ascending: true
      });

  setCategories(data || []);

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

    await supabase
      .from("product_variants")
      .update({ price: nuevoPrecio })
      .eq("id", variantId);

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

    await supabase
      .from("product_variants")
      .update({ stock: nuevoStock })
      .eq("id", variantId);

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

    await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

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

  const { data } = await supabase
    .from("product_variants")
    .insert([{
      product_id: producto.id,

      size: nuevaTalla,

      price:
        parseInt(nuevoPrecio)
        || 0,

      stock:
        parseInt(nuevoStock)
        || 0
    }])
    .select()
    .single();

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
      await supabase.storage
        .from("products")
        .upload(nombre, file);

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
      supabase.storage
        .from("products")
        .getPublicUrl(nombre);

    const url =
      data.publicUrl;

    // 🔥 guardar db
    const { data: nueva } =
      await supabase
        .from("product_images")
        .insert([{
  product_id: producto.id,

  url,

  sort_order:
    producto.product_images.length
}])
        .select()
        .single();

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

  await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  setProducto(prev => ({
    ...prev,
    product_images:
      prev.product_images.filter(
        img => img.id !== id
      )
  }));

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
      await supabase
        .from("products")
        .update({
          [campo]: valor
        })
        .eq("id", producto.id);

    if (error) {
      console.error(error);
    }

  } catch (err) {

    console.error(err);

  } finally {

    setGuardandoInfo(false);

  }

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
        supabase
          .from("product_images")
          .update({
            sort_order:
              img.sort_order
          })
          .eq("id", img.id)
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

  if (!producto) {

    return (
      <div style={{ padding: 30 }}>
        Cargando...
      </div>
    );

  }

  const stockTotal =
  producto.product_variants.reduce(
    (acc, v) =>
      acc + (v.stock || 0),
    0
  );

const valorInventario =
  producto.product_variants.reduce(
    (acc, v) =>
      acc +
      (
        (v.stock || 0)
        *
        (v.price || 0)
      ),
    0
  );

const variantesAgotadas =
  producto.product_variants.filter(
    v => (v.stock || 0) <= 0
  ).length;

const variantesBajoStock =
  producto.product_variants.filter(
    v =>
      (v.stock || 0) > 0
      &&
      (v.stock || 0) <= 3
  ).length;

const precioPromedio =
  producto.product_variants.length > 0

    ? Math.round(

        producto.product_variants.reduce(
          (acc, v) =>
            acc + (v.price || 0),
          0
        )

        /

        producto.product_variants.length
      )

    : 0;
  
  

  return (

<>
    
<div className="
  sticky
  top-0

  z-50

  mb-6

  border
  border-white/50

  bg-white/80
  backdrop-blur-xl

  px-6
  py-4

  rounded-[24px]

  shadow-[0_10px_40px_rgba(15,23,42,0.08)]
">

<div className="
  flex
  flex-wrap
  items-center
  justify-between

  gap-4
">

  {/* izquierda */}
  <div>

    <div className="
      text-xs

      uppercase
      tracking-[0.2em]

      font-black

      text-slate-400
    ">
      PRODUCTO
    </div>

    <div className="
      text-2xl
      font-black

      text-slate-900
    ">
      {producto.name}
    </div>

  </div>

  {/* derecha */}
  <div className="
    flex
    items-center
    gap-3
  ">

    <div className={`
      px-4
      py-2

      rounded-full

      text-sm
      font-black

      ${
        producto.active
          ? `
            bg-emerald-50
            text-emerald-600
          `
          : `
            bg-red-50
            text-red-600
          `
      }
    `}>

      {producto.active
        ? "● Activo"
        : "● Inactivo"}

    </div>

    <a
      href={`/producto/${producto.slug}`}
      target="_blank"
      rel="noreferrer"

      className="
        px-5
        py-3

        rounded-2xl

        bg-gradient-to-r
        from-pink-500
        to-purple-500

        text-white
        font-bold

        shadow-lg

        hover:scale-[1.02]

        transition-all
      "
    >
      👁 Ver producto
    </a>

  </div>

</div>

</div>

<div className="
  p-4
  md:p-8

  min-h-screen

  bg-gradient-to-b
  from-white
  to-pink-50
">

{/* HEADER PREMIUM */}
<div className="mb-8">

  {/* volver */}
<Link
  to="/admin/productos"

  className="
    inline-flex
    items-center
    gap-2

    text-pink-500
    hover:text-pink-600

    font-bold

    transition-all
    duration-200
  "
>
  ← Volver a productos
</Link>

  {/* card principal */}
<AdminCard className="
  mt-5

  overflow-hidden

  border
  border-white/60

  bg-white/80
  backdrop-blur-xl

  shadow-[0_20px_60px_rgba(15,23,42,0.08)]
">

<div className="
  flex
  flex-wrap
  items-start
  gap-6
">

      {/* imagen */}
<img
  src={
    producto.product_images?.[0]?.url
    || "/placeholder.png"
  }

  className="
    w-32
    h-32

    rounded-[28px]

    object-cover

    shadow-[0_15px_40px_rgba(15,23,42,0.15)]

    border
    border-white
  "
/>

{/* INFO PREMIUM */}
<div className="
  flex-1
  min-w-[320px]
">

  {/* NOMBRE */}
  <input
    value={producto.name || ""}

    onChange={(e) =>
      setProducto(prev => ({
        ...prev,
        name: e.target.value
      }))
    }

    onBlur={(e) =>
      actualizarProducto(
        "name",
        e.target.value
      )
    }

className="
  w-full

  bg-transparent

  text-4xl
  md:text-5xl

  font-black

  text-slate-900

  outline-none

  mb-5
"
  />

  {/* BADGES */}
<div className="
  flex
  flex-wrap
  gap-3

  mb-5
">

    {/* categoría */}
    <select
  value={
    producto.category || ""
  }

  onChange={async (e) => {

    const value =
      e.target.value;

    setProducto(prev => ({
      ...prev,
      category: value
    }));

    await supabase
      .from("products")
      .update({
        category: value
      })
      .eq("id", producto.id);

  }}

  className="
  px-4
  py-3

  rounded-full

  border
  border-slate-200

  bg-slate-50

  font-bold

  text-sm

  cursor-pointer

  transition-all

  hover:border-pink-300
  hover:bg-pink-50
"
>

  <option value="">
    Categoría
  </option>

  {categories.map(cat => (

    <option
      key={cat.id}
      value={cat.slug}
    >
      {cat.name}
    </option>

  ))}

</select>

    {/* género */}
<select
  value={
    producto.gender || "unisex"
  }

  onChange={async (e) => {

    const value =
      e.target.value;

    setProducto(prev => ({
      ...prev,
      gender: value
    }));

    await supabase
      .from("products")
      .update({
        gender: value
      })
      .eq("id", producto.id);

  }}

className="
  px-4
  py-3

  rounded-full

  border
  border-slate-200

  bg-slate-50

  font-bold

  text-sm

  cursor-pointer

  transition-all

  hover:border-pink-300
  hover:bg-pink-50
"
>

  <option value="macho">
    🐶 Macho
  </option>

  <option value="hembra">
    🎀 Hembra
  </option>

  <option value="unisex">
    ✨ Unisex
  </option>

</select>
    
    {/* variantes */}
    <div
      style={{
        background: "#ecfeff",
        color: "#0891b2",

        padding: "10px 16px",

        borderRadius: 999,

        fontWeight: "700",

        fontSize: 13
      }}
    >
      {
        producto.product_variants
          .length
      } variantes
    </div>

    {/* activo */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,

        background:
          producto.active
            ? "#dcfce7"
            : "#fee2e2",

        color:
          producto.active
            ? "#166534"
            : "#991b1b",

        padding:
          "10px 16px",

        borderRadius: 999,

        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(
            producto.active
          )
        }

        onChange={(e) =>
          actualizarProducto(
            "active",
            e.target.checked
          )
        }
      />

      {producto.active
        ? "Activo"
        : "Inactivo"}

    </label>

    {/* destacado */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,

        background:
          producto.featured
            ? "#fef3c7"
            : "#f3f4f6",

        color:
          producto.featured
            ? "#92400e"
            : "#374151",

        padding:
          "10px 16px",

        borderRadius: 999,

        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(
            producto.featured
          )
        }

        onChange={(e) =>
          actualizarProducto(
            "featured",
            e.target.checked
          )
        }
      />

      ⭐ Destacado

       </label>

  </div>

{/* 🔥 COLECCIONES PREMIUM */}
<div className="mt-8">

<h3 className="
  text-2xl
  font-black

  text-slate-900

  mb-5
">
    🏷 Colecciones
  </h3>

<div className="
  flex
  flex-wrap

  gap-4
">

    {/* NUEVA COLECCIÓN */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.new_collection

      ? `
        border-emerald-200

        bg-gradient-to-r
        from-emerald-500
        to-teal-500

        text-white

        shadow-[0_10px_30px_rgba(16,185,129,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-emerald-200
        hover:bg-emerald-50
      `
  }
`}>

      <input
        type="checkbox"

        className="
          w-5
          h-5

          accent-white

          cursor-pointer
        "

        checked={
          Boolean(producto.new_collection)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            new_collection: checked
          }));

          await supabase
            .from("products")
            .update({
              new_collection: checked
            })
            .eq("id", producto.id);

        }}
      />

      🆕 Nueva colección

    </label>

    {/* BEST SELLER */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.best_seller

      ? `
        border-blue-200

        bg-gradient-to-r
        from-blue-500
        to-cyan-500

        text-white

        shadow-[0_10px_30px_rgba(59,130,246,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-blue-200
        hover:bg-blue-50
      `
  }
`}>

      <input
        type="checkbox"
        className="
  w-5
  h-5

  accent-white

  cursor-pointer
"

        checked={
          Boolean(producto.best_seller)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            best_seller: checked
          }));

          await supabase
            .from("products")
            .update({
              best_seller: checked
            })
            .eq("id", producto.id);

        }}
      />

      🔥 Best seller

    </label>

    {/* LUXURY */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.luxury

      ? `
        border-amber-200

        bg-gradient-to-r
        from-amber-400
        to-yellow-500

        text-white

        shadow-[0_10px_30px_rgba(245,158,11,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-amber-200
        hover:bg-amber-50
      `
  }
`}>

      <input
        type="checkbox"
        className="
  w-5
  h-5

  accent-white

  cursor-pointer
"

        checked={
          Boolean(producto.luxury)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            luxury: checked
          }));

          await supabase
            .from("products")
            .update({
              luxury: checked
            })
            .eq("id", producto.id);

        }}
      />

      👑 Luxury

    </label>

    {/* EXCLUSIVO */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.exclusive

      ? `
        border-pink-200

        bg-gradient-to-r
        from-pink-500
        to-purple-500

        text-white

        shadow-[0_10px_30px_rgba(236,72,153,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-pink-200
        hover:bg-pink-50
      `
  }
`}>

      <input
        type="checkbox"
        className="
  w-5
  h-5

  accent-white

  cursor-pointer
"
        checked={
          Boolean(producto.exclusive)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            exclusive: checked
          }));

          await supabase
            .from("products")
            .update({
              exclusive: checked
            })
            .eq("id", producto.id);

        }}
      />

      💎 Exclusivo

    </label>

  </div>

</div>

  {/* DESCRIPCIÓN */}
  <textarea
    value={
      producto.description || ""
    }

    onChange={(e) =>
      setProducto(prev => ({
        ...prev,
        description:
          e.target.value
      }))
    }

    onBlur={(e) =>
      actualizarProducto(
        "description",
        e.target.value
      )
    }

    placeholder="
      Describe el producto...
    "

    rows={4}

className="
  w-full

  rounded-[24px]

  border
  border-slate-200

  bg-slate-50

  p-5

  text-[15px]

  resize-y

  outline-none

  transition-all

  focus:border-pink-400
  focus:bg-white
"
  />

  {/* GUARDANDO */}
<div className="
  fixed
  bottom-6
  right-6

  z-[9999]

  transition-all
  duration-300

  pointer-events-none
">

  {guardandoInfo && (

    <div className="
      flex
      items-center
      gap-3

      rounded-2xl

      bg-slate-900/95
      backdrop-blur-xl

      px-5
      py-4

      text-white

      shadow-[0_20px_60px_rgba(15,23,42,0.35)]

      border
      border-white/10
    ">

      <div className="
        w-3
        h-3

        rounded-full

        bg-emerald-400

        animate-pulse
      " />

      <span className="
        text-sm
        font-bold
      ">
        Guardando cambios...
      </span>

    </div>

  )}

</div>

</div>

  </div>

</AdminCard>
  
      {/* SEO PREMIUM */}
<AdminCard className="
  mb-6

  border
  border-slate-100

  bg-white/90
  backdrop-blur-xl

  shadow-[0_10px_40px_rgba(15,23,42,0.06)]
">

  {/* título */}
<div className="mb-6">

    <h2 className="
  text-2xl
  font-black
  text-slate-900
">
      🔎 SEO Producto
    </h2>

    <p className="
  mt-2

  text-slate-500

  leading-relaxed
">
      Optimiza este producto para Google
    </p>

  </div>

  {/* grid */}
  <div className="
  grid
  grid-cols-1
  md:grid-cols-2

  gap-5
">

    {/* slug */}
    <div>

      <label className="
  block

  mb-2

  text-sm
  font-black

  text-slate-700
">
        URL / Slug
      </label>

      <input
        value={
          producto.slug || ""
        }

        onChange={(e) =>
          setProducto(prev => ({
            ...prev,
            slug:
              generarSlug(
                e.target.value
              )
          }))
        }

        onBlur={(e) =>
          actualizarProducto(
            "slug",
            generarSlug(
              e.target.value
            )
          )
        }

        placeholder="producto-premium"

        className="
  w-full

  rounded-2xl

  border
  border-slate-200

  bg-slate-50

  px-4
  py-3

  font-semibold

  outline-none

  transition-all

  focus:border-pink-400
  focus:bg-white
"
      />

    </div>

    {/* meta title */}
    <div>

      <label className="
  block

  mb-2

  text-sm
  font-black

  text-slate-700
">
        Meta title
      </label>

      <input
        value={
          producto.meta_title || ""
        }

        onChange={(e) =>
          setProducto(prev => ({
            ...prev,
            meta_title:
              e.target.value
          }))
        }

        onBlur={(e) =>
          actualizarProducto(
            "meta_title",
            e.target.value
          )
        }

        placeholder="
          Título SEO Google
        "

className="
  w-full

  rounded-2xl

  border
  border-slate-200

  bg-slate-50

  px-4
  py-3

  font-semibold

  outline-none

  transition-all

  focus:border-pink-400
  focus:bg-white
"
      />

    </div>

  </div>

  {/* descripción */}
  <div
    style={{
      marginTop: 20
    }}
  >

<label className="
  block

  mb-2

  text-sm
  font-black

  text-slate-700
">
      Meta description
    </label>

    <textarea
      value={
        producto.meta_description
        || ""
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          meta_description:
            e.target.value
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "meta_description",
          e.target.value
        )
      }

      rows={4}

      placeholder="
        Descripción SEO Google
      "

className="
  w-full

  rounded-[24px]

  border
  border-slate-200

  bg-slate-50

  p-5

  resize-y

  text-[15px]

  outline-none

  transition-all

  focus:border-pink-400
  focus:bg-white
"
    />

  </div>

  {/* keywords */}
  <div
    style={{
      marginTop: 20
    }}
  >

<label className="
  block

  mb-2

  text-sm
  font-black

  text-slate-700
">
      Keywords SEO
    </label>

    <input
      value={
        producto.seo_keywords || ""
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          seo_keywords:
            e.target.value
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "seo_keywords",
          e.target.value
        )
      }

      placeholder="
        ropa mascotas, luxury pet...
      "

className="
  w-full

  rounded-2xl

  border
  border-slate-200

  bg-slate-50

  px-4
  py-3

  font-semibold

  outline-none

  transition-all

  focus:border-pink-400
  focus:bg-white
"
    />

  </div>

  {/* preview google */}
<div className="
  mt-8

  rounded-[28px]

  border
  border-slate-100

  bg-gradient-to-br
  from-slate-50
  to-white

  p-6

  shadow-inner
">

<div className="
  text-[22px]

  font-semibold

  text-blue-700
">
      {
        producto.meta_title
        || producto.name
      }
    </div>

<div className="
  mt-2

  text-sm

  text-green-700
">
      boutiquepetlove.cl/producto/
      {
        producto.slug
        || generarSlug(
          producto.name
        )
      }
    </div>

<div className="
  mt-3

  text-slate-600

  leading-relaxed
">
      {
        producto.meta_description
        || producto.description
      }
    </div>

  </div>

</AdminCard>

{/* ANALYTICS PREMIUM */}
<div className="
  grid

  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-4

  gap-6

  mb-8
">

  {/* STOCK */}
<AdminCard className="
  group
  relative
  overflow-hidden

  border
  border-white/60

  bg-gradient-to-br
  from-orange-50
  to-white

  shadow-[0_10px_30px_rgba(15,23,42,0.05)]

  hover:-translate-y-1
  hover:shadow-[0_25px_60px_rgba(251,146,60,0.12)]

  transition-all
  duration-300
">

<div className="
  absolute
  -top-10
  -right-10

  w-32
  h-32

  rounded-full

  bg-orange-200/40

  blur-3xl
" />

<div className="
  relative
  z-10

  text-4xl

  mb-5
">
  📦
</div>

<div className="
  relative
  z-10

  text-xs

  uppercase
  tracking-[0.2em]

  font-black

  text-orange-700
">
  STOCK TOTAL
</div>

<div className="
  relative
  z-10

  mt-4

  text-5xl

  font-black

  text-slate-900
">
  {stockTotal}
</div>

</AdminCard>

  {/* INVENTARIO */}
<AdminCard className="
  group
  relative
  overflow-hidden

  border
  border-white/60

  bg-gradient-to-br
  from-emerald-50
  to-white

  shadow-[0_10px_30px_rgba(15,23,42,0.05)]

  hover:-translate-y-1
  hover:shadow-[0_25px_60px_rgba(16,185,129,0.12)]

  transition-all
  duration-300
">

<div className="
  absolute
  -top-10
  -right-10

  w-32
  h-32

  rounded-full

  bg-emerald-200/40

  blur-3xl
" />

<div className="
  relative
  z-10

  text-4xl

  mb-5
">
  💵
</div>

<div className="
  relative
  z-10

  text-xs

  uppercase
  tracking-[0.2em]

  font-black

  text-emerald-700
">
  VALOR INVENTARIO
</div>

<div className="
  relative
  z-10

  mt-4

  text-3xl

  font-black

  text-emerald-600
">
  $
  {valorInventario.toLocaleString("es-CL")}
</div>

</AdminCard>


  {/* PROMEDIO */}
<AdminCard className="
  group
  relative
  overflow-hidden

  border
  border-white/60

  bg-gradient-to-br
  from-blue-50
  to-white

  shadow-[0_10px_30px_rgba(15,23,42,0.05)]

  hover:-translate-y-1
  hover:shadow-[0_25px_60px_rgba(16,185,129,0.12)]

  transition-all
  duration-300
">

<div className="
  absolute
  -top-10
  -right-10

  w-32
  h-32

  rounded-full

  bg-blue-200/40

  blur-3xl
" />

<div className="
  relative
  z-10

  text-4xl

  mb-5
">
  💎
</div>

<div className="
  relative
  z-10

  text-xs

  uppercase
  tracking-[0.2em]

  font-black

  text-blue-700
">
  PRECIO PROMEDIO
</div>

<div className="
  relative
  z-10

  mt-4

  text-3xl

  font-black

  text-blue-600
">
  $
{precioPromedio.toLocaleString("es-CL")}
</div>

</AdminCard>
  

  {/* ALERTAS */}
<AdminCard className="
  group
  relative
  overflow-hidden

  border
  border-white/60

  bg-gradient-to-br
  from-rose-50
  to-white

  shadow-[0_10px_30px_rgba(15,23,42,0.05)]

  hover:-translate-y-1
  hover:shadow-[0_25px_60px_rgba(244,63,94,0.12)]

  transition-all
  duration-300
">

<div className="
  absolute
  -top-10
  -right-10

  w-32
  h-32

  rounded-full

  bg-rose-200/40

  blur-3xl
" />

<div className="
  relative
  z-10

  text-4xl

  mb-5
">
  🚨
</div>

<div className="
  relative
  z-10

  text-xs

  uppercase
  tracking-[0.2em]

  font-black

  text-rose-700
">
  ALERTAS
</div>

<div className="
  relative
  z-10

  mt-5

  flex
  flex-col

  gap-3
">

      {variantesAgotadas > 0 && (

<div className="
  rounded-2xl

  border
  border-red-100

  bg-red-50

  px-4
  py-3

  text-sm
  font-black

  text-red-600
">
          🔴 {variantesAgotadas}
          {" "}agotadas
        </div>

      )}

      {variantesBajoStock > 0 && (

<div className="
  rounded-2xl

  border
  border-orange-100

  bg-orange-50

  px-4
  py-3

  text-sm
  font-black

  text-orange-600
">
          🟠 {variantesBajoStock}
          {" "}bajo stock
        </div>

      )}

      {!producto.meta_title && (
<div className="
  rounded-2xl

  border
  border-purple-100

  bg-purple-50

  px-4
  py-3

  text-sm
  font-black

  text-purple-600
">
          🟣 SEO incompleto
        </div>
      )}

      {producto.product_images
        .length === 0 && (
<div className="
  rounded-2xl

  border
  border-blue-100

  bg-blue-50

  px-4
  py-3

  text-sm
  font-black

  text-blue-600
">
          🔵 Sin imágenes
        </div>
      )}

    </div>

  </AdminCard>

</div>

{/* DESCUENTOS PREMIUM */}
<AdminCard className="
  mb-6

  border
  border-slate-100

  bg-white/90
  backdrop-blur-xl

  shadow-[0_10px_40px_rgba(15,23,42,0.06)]
">

  {/* título */}
<div className="mb-6">

<h2 className="
  text-2xl
  font-black
  text-slate-900
">
      🔥 Descuentos
    </h2>

<p className="
  mt-2

  text-slate-500

  leading-relaxed
">
      Configura promociones del producto
    </p>

  </div>

  {/* activar */}
<div className="
  flex
  items-center
  gap-3

  mb-6
">

<label className={`
  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  font-black

  transition-all

  ${
    producto.discount_active

      ? `
        bg-red-50
        text-red-600

        border
        border-red-100
      `

      : `
        bg-slate-50
        text-slate-700

        border
        border-slate-200
      `
  }
`}>

      <input
        type="checkbox"

        className="
  w-5
  h-5

  accent-pink-500

  cursor-pointer
"

        checked={
          Boolean(
            producto.discount_active
          )
        }

        onChange={(e) =>
          actualizarProducto(
            "discount_active",
            e.target.checked
          )
        }
      />

      🔥 Activar descuento

    </label>

  </div>

  {/* porcentaje */}
<div className="
  max-w-[280px]
">

<label className="
  block

  mb-2

  text-sm
  font-black

  text-slate-700
">
      % descuento
    </label>

    <input
      type="number"

      value={
        producto.discount_percent || 0
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          discount_percent:
            parseInt(e.target.value)
            || 0
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "discount_percent",
          parseInt(e.target.value)
          || 0
        )
      }

      min={0}
      max={90}

className="
  w-full

  rounded-[22px]

  border
  border-slate-200

  bg-slate-50

  px-5
  py-4

  text-xl
  font-black

  outline-none

  transition-all

  focus:border-pink-400
  focus:bg-white

  focus:ring-4
  focus:ring-pink-100
"
    />

  </div>

  {/* preview */}
<div className="
  relative
  overflow-hidden

  mt-8

  rounded-[32px]

  border
  border-pink-100

  bg-gradient-to-br
  from-pink-50
  via-white
  to-purple-50

  p-8

  shadow-[0_20px_60px_rgba(236,72,153,0.08)]
">

<div className="
  relative
  z-10

  text-sm

  font-black

  tracking-[0.2em]

  text-pink-700

  uppercase

  mb-4
">
      PREVIEW DESCUENTO
    </div>

<div className="
  relative
  z-10

  flex
  flex-wrap
  items-center

  gap-4
">

      {/* precio original */}
<div className="
  text-2xl

  font-bold

  text-slate-400

  line-through
">
        $
        {
          precioPromedio.toLocaleString(
            "es-CL"
          )
        }
      </div>

      {/* precio descuento */}
<div className="
  text-5xl
  md:text-6xl

  font-black

  text-pink-600
">
        $
        {
          Math.round(

            precioPromedio *

            (
              1 -
              (
                (
                  producto.discount_percent
                  || 0
                ) / 100
              )
            )

          ).toLocaleString("es-CL")
        }
      </div>

      {/* badge */}
      {producto.discount_active && (

<div className="
  inline-flex
  items-center

  rounded-full

  bg-gradient-to-r
  from-pink-500
  to-purple-500

  px-5
  py-3

  text-sm
  font-black

  text-white

  shadow-lg
">
          🔥 -
          {
            producto.discount_percent
          }%
        </div>

      )}

    </div>

  </div>

</AdminCard>

{/* IMÁGENES PREMIUM */}
<AdminCard className="
  mb-6

  border
  border-slate-100

  bg-white/90
  backdrop-blur-xl

  shadow-[0_10px_40px_rgba(15,23,42,0.06)]
">

  {/* título */}
<div className="
  flex
  flex-col
  md:flex-row

  md:items-center
  md:justify-between

  gap-5

  mb-6
">

    <div>

<h2 className="
  text-2xl
  font-black
  text-slate-900
">
        📸 Imágenes
      </h2>

<p className="
  mt-2

  text-slate-500

  leading-relaxed
">
        Gestiona imágenes del producto
      </p>

    </div>

    {/* subir */}
<label className="
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  bg-gradient-to-r
  from-pink-500
  to-purple-500

  px-6
  py-4

  text-sm
  font-black

  text-white

  cursor-pointer

  shadow-[0_12px_30px_rgba(236,72,153,0.28)]

  hover:scale-[1.02]

  transition-all
  duration-300
">

      {subiendoImagen
        ? "Subiendo..."
        : "➕ Subir imagen"}

      <input
        type="file"
        accept="image/*"

        hidden

        onChange={(e) =>
          subirImagen(
            e.target.files?.[0]
          )
        }
      />

    </label>

  </div>

  {/* grid */}
{/* grid drag */}
<DndContext
  collisionDetection={
    closestCenter
  }

  onDragEnd={handleDragEnd}
>

  <SortableContext
    items={
      producto.product_images.map(
        img => img.id
      )
    }

    strategy={
      rectSortingStrategy
    }
  >

<div className="
  grid

  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4

  gap-5
">

      {producto.product_images.map(
        (img, index) => (

          <SortableImage
            key={img.id}

            img={img}

            index={index}

            eliminarImagen={
              eliminarImagen
            }
          />

        )
      )}

  {producto.product_images.length === 0 && (

  <div className="
    col-span-full

    rounded-[32px]

    border-2
    border-dashed
    border-slate-200

    bg-slate-50/70

    p-16

    text-center
  ">

    <div className="
      text-6xl
      mb-5
    ">
      📸
    </div>

    <div className="
      text-xl
      font-black

      text-slate-800
    ">
      Aún no hay imágenes
    </div>

    <p className="
      mt-3

      text-slate-500
    ">
      Sube imágenes premium para mejorar conversión
    </p>

  </div>

)}

    </div>

  </SortableContext>

</DndContext>

</AdminCard>
      
{/* TABLA PREMIUM */}
<AdminCard className="
  overflow-x-auto
  
  border
  border-slate-100

  bg-white/90
  backdrop-blur-xl

  shadow-[0_10px_40px_rgba(15,23,42,0.06)]
">

  {/* encabezado */}
<div className="
  grid

  grid-cols-[1fr_1fr_1fr_1fr_120px]

  px-4
  pb-5

  border-b
  border-slate-100

  text-xs

  uppercase
  tracking-[0.18em]

  font-black

  text-slate-500
">

  <div>Talla</div>

  <div>Precio</div>

  <div>Stock</div>

  <div>Estado</div>

  <div>Acciones</div>

</div>

  {/* filas */}
<div className="
  mt-3

  flex
  flex-col

  gap-3
">

    {producto.product_variants.map(v => (

<div
  key={v.id}

  className="
    grid

    grid-cols-[1fr_1fr_1fr_1fr_120px]

    items-center

    rounded-[28px]

    border
    border-slate-100

    bg-gradient-to-r
    from-white
    to-slate-50/50

    p-4

    shadow-[0_4px_14px_rgba(15,23,42,0.04)]

    hover:-translate-y-1
    hover:shadow-[0_18px_40px_rgba(236,72,153,0.08)]

    transition-all
    duration-300
  "
>

        {/* TALLA */}
        <div>

<span className="
  inline-flex
  items-center

  rounded-full

  border
  border-slate-200

  bg-white

  px-4
  py-2

  text-sm
  font-black

  shadow-sm
">
            {v.size}
          </span>

        </div>

        {/* PRECIO */}
        <div>

          <input
            type="number"

            value={v.price || 0}

            onChange={(e) => {

              const nuevo =
                parseInt(e.target.value)
                || 0;

              setProducto(prev => ({
                ...prev,
                product_variants:
                  prev.product_variants.map(x =>
                    x.id === v.id
                      ? {
                          ...x,
                          price: nuevo
                        }
                      : x
                  )
              }));

            }}

            onBlur={(e) => {

              actualizarPrecio(
                v.id,
                parseInt(e.target.value)
                || 0
              );

            }}

className="
  w-[150px]

  rounded-2xl

  border
  border-slate-200

  bg-white

  px-4
  py-3

  font-black

  text-slate-900

  outline-none

  transition-all

  focus:border-pink-400
  focus:ring-4
  focus:ring-pink-100
"
          />

        </div>

        {/* STOCK */}
        <div>

<div className="
  flex
  items-center
  gap-3
">

            {/* - */}
            <button
              onClick={() =>
                actualizarStock(
                  v.id,
                  Math.max(
                    (v.stock || 0) - 1,
                    0
                  )
                )
              }

className="
  w-10
  h-10

  rounded-2xl

  border
  border-red-100

  bg-red-50

  text-red-500

  text-xl
  font-black

  hover:bg-red-500
  hover:text-white

  transition-all
"
            >
              −
            </button>

            {/* input */}
            <input
              type="number"

              value={v.stock || 0}

              onChange={(e) => {

                const nuevo =
                  parseInt(e.target.value)
                  || 0;

                setProducto(prev => ({
                  ...prev,
                  product_variants:
                    prev.product_variants.map(x =>
                      x.id === v.id
                        ? {
                            ...x,
                            stock: nuevo
                          }
                        : x
                    )
                }));

              }}

              onBlur={(e) => {

                actualizarStock(
                  v.id,
                  parseInt(e.target.value)
                  || 0
                );

              }}

className="
  w-20

  rounded-2xl

  border
  border-slate-200

  bg-white

  px-3
  py-3

  text-center

  font-black

  outline-none

  transition-all

  focus:border-pink-400
  focus:ring-4
  focus:ring-pink-100
"
            />

            {/* + */}
            <button
              onClick={() =>
                actualizarStock(
                  v.id,
                  (v.stock || 0) + 1
                )
              }

className="
  w-10
  h-10

  rounded-2xl

  border
  border-emerald-100

  bg-emerald-50

  text-emerald-500

  text-xl
  font-black

  hover:bg-emerald-500
  hover:text-white

  transition-all
"
            >
              +
            </button>

          </div>

        </div>

        {/* ESTADO */}
        <div>

          {(v.stock || 0) <= 0 ? (

<span className="
  inline-flex
  items-center

  rounded-full

  bg-red-50

  px-4
  py-2

  text-xs
  font-black

  text-red-600

  border
  border-red-100
">
              ● Agotado
            </span>

          ) : (v.stock || 0) <= 3 ? (

            <span
className="
  inline-flex
  items-center

  rounded-full

  bg-orange-50

  px-4
  py-2

  text-xs
  font-black

  text-orange-600

  border
  border-orange-100
"
            >
              ● Bajo stock
            </span>

          ) : (

            <span
className="
  inline-flex
  items-center

  rounded-full

  bg-emerald-50

  px-4
  py-2

  text-xs
  font-black

  text-emerald-600

  border
  border-emerald-100
"
            >
              ● En stock
            </span>

          )}

        </div>

        {/* ACCIONES */}
        <div>

          <button
            onClick={() =>
              eliminarVariante(v.id)
            }

className="
  w-11
  h-11

  rounded-2xl

  border
  border-red-100

  bg-red-50

  text-red-500

  text-lg
  font-black

  hover:bg-red-500
  hover:text-white

  transition-all
"
          >
            ✕
          </button>

        </div>

      </div>

    ))}

  </div>

</AdminCard>

{/* BOTÓN ABRIR MODAL */}
<AdminButton
  onClick={() =>
    setMostrarModal(true)
  }

  className="mt-6"
>
  ➕ Agregar talla
</AdminButton>

      {/* MODAL PREMIUM */}
<AdminModal
  open={mostrarModal}

  onClose={() =>
    setMostrarModal(false)
  }

  title="Nueva Variante"

  width="max-w-4xl"
>

  <div className="
    grid
    grid-cols-1
    md:grid-cols-2

    gap-6
  ">

    {/* TALLA */}
    <div>

      <label className="
        block

        text-sm
        font-black

        text-slate-700

        mb-3
      ">
        Talla
      </label>

      <input
        value={nuevaTalla}

        onChange={(e) =>
  setNuevaTalla(
    e.target.value
  )
}

        className="
          w-full

          rounded-2xl

          border
          border-slate-200

          bg-slate-50

          px-4
          py-3

          outline-none

          transition-all

          focus:border-pink-400
          focus:bg-white
        "
      />

    </div>

    {/* STOCK */}
    <div>

      <label className="
        block

        text-sm
        font-black

        text-slate-700

        mb-3
      ">
        Stock
      </label>

      <input
        type="number"

        value={nuevoStock}

        onChange={(e) =>
          setNuevoStock(
            e.target.value
          )
        }

        className="
          w-full

          rounded-2xl

          border
          border-slate-200

          bg-slate-50

          px-4
          py-3

          outline-none

          transition-all

          focus:border-pink-400
          focus:bg-white
        "
      />

    </div>

  </div>

  {/* PRECIO */}
<div>

  <label className="
    block

    text-sm
    font-black

    text-slate-700

    mb-3
  ">
    Precio
  </label>

  <input
    type="number"

    value={nuevoPrecio}

    onChange={(e) =>
      setNuevoPrecio(
        e.target.value
      )
    }

    className="
      w-full

      rounded-2xl

      border
      border-slate-200

      bg-slate-50

      px-4
      py-3

      outline-none

      transition-all

      focus:border-pink-400
      focus:bg-white
    "
  />

</div>

  {/* BOTONES */}
  <div className="
    flex
    justify-end
    gap-3

    mt-8
  ">

    <button
      onClick={() =>
        setMostrarModal(false)
      }

      className="
        px-5
        py-3

        rounded-2xl

        bg-slate-100
        hover:bg-slate-200

        font-semibold

        transition-all
      "
    >
      Cancelar
    </button>

    <button
      onClick={agregarVariante}

      className="
        px-6
        py-3

        rounded-2xl

        bg-gradient-to-r
        from-pink-500
        to-purple-500

        text-white
        font-bold

        shadow-lg

        hover:scale-[1.02]

        transition-all
      "
    >
      Guardar variante
    </button>

  </div>

</AdminModal>
  
    </div>

  </div>

</>
        
  );

}

import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AdminCard from "./components/AdminCard";
import { arrayMove } from "@dnd-kit/sortable";
import ProductCollections from "./product-detail/components/ProductCollections";
import ProductVariants from "./product-detail/components/ProductVariants";
import ProductImages from "./product-detail/components/ProductImages";
import ProductSEO from "./product-detail/components/ProductSEO";
import useProductDetail from "./product-detail/hooks/useProductDetail";

export default function ProductoDetalle() {

  const { id } = useParams();

  const {

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
  agregarVariante

} = useProductDetail(id);


  

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

  <ProductCollections
  producto={producto}
  setProducto={setProducto}
  actualizarProducto={actualizarProducto}
/>

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
  
<ProductSEO
  producto={producto}

  setProducto={setProducto}

  actualizarProducto={actualizarProducto}

  generarSlug={generarSlug}
/>
  
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

<ProductImages
  producto={producto}

  subiendoImagen={subiendoImagen}

  subirImagen={subirImagen}

  handleDragEnd={handleDragEnd}

  eliminarImagen={eliminarImagen}
/>
      
<ProductVariants
  producto={producto}

  actualizarPrecio={actualizarPrecio}
  actualizarStock={actualizarStock}
  eliminarVariante={eliminarVariante}
  agregarVariante={agregarVariante}

  mostrarModal={mostrarModal}
  setMostrarModal={setMostrarModal}

  nuevaTalla={nuevaTalla}
  setNuevaTalla={setNuevaTalla}

  nuevoPrecio={nuevoPrecio}
  setNuevoPrecio={setNuevoPrecio}

  nuevoStock={nuevoStock}
  setNuevoStock={setNuevoStock}

  setProducto={setProducto}
/>
  
    </div>

  </div>

</>
        
  );

}

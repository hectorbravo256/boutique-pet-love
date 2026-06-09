import AdminCard from "../../components/AdminCard";

import ProductCollections
from "./ProductCollections";

export default function ProductInfoCard({

  producto,
  setProducto,

  categories,

  actualizarProducto,

  guardandoInfo

}) {

  return (

    <>

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

actualizarProducto(
  "category",
  value
)

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
  value={cat.name}
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

actualizarProducto(
  "gender",
  value
)

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
      
    </>

  );

}

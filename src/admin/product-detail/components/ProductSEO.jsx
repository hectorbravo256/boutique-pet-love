import AdminCard from "../../components/AdminCard";

export default function ProductSEO({
  producto,
  setProducto,
  actualizarProducto,
  generarSlug
}) {

  return (

    <>

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

    
    </>

  );

}

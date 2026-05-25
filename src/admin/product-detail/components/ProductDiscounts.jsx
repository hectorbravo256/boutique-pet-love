import AdminCard from "../../components/AdminCard";

export default function ProductDiscounts({
  producto,
  setProducto,
  actualizarProducto
}) {

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
    
    </>

  );

}

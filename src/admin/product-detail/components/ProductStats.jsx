import AdminCard from "../../components/AdminCard";

export default function ProductStats({
  producto
}) {

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
      
    </>

  );

}

export default function HeroProductos({ productos }) {

    return (

        <>

{/* HERO PREMIUM */}
<div className="
  relative
  overflow-hidden

  rounded-[36px]

  p-6
  md:p-10

  bg-gradient-to-br
  from-pink-500
  via-fuchsia-500
  to-purple-600

  text-white

  shadow-[0_25px_80px_rgba(168,85,247,0.35)]

  mb-8
">

  {/* GLOW */}
  <div className="
    absolute
    -top-32
    -right-32

    w-[420px]
    h-[420px]

    rounded-full

    bg-white/10

    blur-3xl
  " />

  <div className="
    relative
    z-10
  ">

    <p className="
      uppercase
      tracking-[0.35em]
      text-xs
      font-bold
      text-pink-100
    ">
      Inventory Management
    </p>

    <h1 className="
      text-4xl
      md:text-6xl

      font-black

      mt-4
      leading-tight
    ">
      🛒 Productos Enterprise
    </h1>

    <p className="
      mt-5

      text-pink-100

      max-w-2xl

      text-sm
      md:text-lg

      leading-relaxed
    ">
      Gestiona inventario,
      categorías, variantes
      y productos premium
      desde un solo lugar.
    </p>

    {/* STATS */}
    <div className="
      grid
      grid-cols-2
      md:grid-cols-4

      gap-4

      mt-8
    ">

      <MiniStat
        label="Productos"
        value={productosFull.length}
      />

      <MiniStat
        label="Categorías"
        value={
          [
            ...new Set(
              productosFull.map(
                p => p.category
              )
            )
          ].length
        }
      />

      <MiniStat
        label="Variantes"
        value={
          productosFull.reduce(
            (acc, p) =>
              acc +
              (
                p.product_variants
                  ?.length || 0
              ),
            0
          )
        }
      />

      <MiniStat
        label="Resultados"
        value={
          ordenarProductos(
            productosFull
          ).length
        }
      />

    </div>

  </div>

</div>
            </>

    );

}

        function MiniStat({ label, value }) {

    return (

        <div className="
            rounded-3xl
            bg-white/10
            backdrop-blur-xl
            border
            border-white/10
            p-4
        ">

            <div className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-pink-100
                font-bold
            ">
                {label}
            </div>

            <div className="
                mt-3
                text-xl
                md:text-2xl
                font-black
            ">
                {value}
            </div>

        </div>

    );

}

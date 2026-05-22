import AdminCard from "../../components/AdminCard";
import AdminButton from "../../components/AdminButton";
import AdminModal from "../../components/AdminModal";

export default function ProductVariants({
  producto,
  actualizarPrecio,
  actualizarStock,
  eliminarVariante,
  agregarVariante,

  mostrarModal,
  setMostrarModal,

  nuevaTalla,
  setNuevaTalla,

  nuevoPrecio,
  setNuevoPrecio,

  nuevoStock,
  setNuevoStock,

  setProducto
}) {

  return (

    <>
    
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

    </>

  );

}

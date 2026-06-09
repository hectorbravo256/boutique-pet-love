import AdminCard from "../../components/AdminCard";
import AdminInput from "../../components/AdminInput";
import AdminButton from "../../components/AdminButton";

export default function CategoryInfoCard({

  category,
  setCategory,
  guardarCategoria

}) {

  return (

    <AdminCard>

      <h2 className="
        text-2xl
        font-black
        text-slate-900
        mb-6
      ">
        Información de categoría
      </h2>

      <div className="
        grid
        lg:grid-cols-[1fr_320px]
        gap-8
      ">

        {/* FORMULARIO */}
        <div className="
          grid
          gap-4
        ">

          <label className="
  block
  mb-2
  text-sm
  font-bold
  text-slate-700
">
  Nombre categoría
</label>
          
          <AdminInput
            placeholder="Nombre"

            value={category.name || ""}

            onChange={(e) =>
              setCategory(prev => ({
                ...prev,
                name: e.target.value
              }))
            }
          />

          <label className="
  block
  mb-2
  text-sm
  font-bold
  text-slate-700
">
  Slug URL
</label>

          <AdminInput
            placeholder="Slug"

            value={category.slug || ""}

            onChange={(e) =>
              setCategory(prev => ({
                ...prev,
                slug: e.target.value
              }))
            }
          />

          <label className="
  block
  mb-2
  text-sm
  font-bold
  text-slate-700
">
  Orden visual
</label>
          
          <AdminInput
            type="number"

            placeholder="Orden"

            value={
              category.sort_order || 0
            }

            onChange={(e) =>
              setCategory(prev => ({
                ...prev,
                sort_order:
                  Number(e.target.value)
              }))
            }
          />

          <label className="
            flex
            items-center
            gap-3

            font-semibold
            text-slate-700
          ">

<div className="
  flex
  items-center
  justify-between

  p-5

  rounded-3xl

  bg-slate-50
  border
  border-slate-200
">

  <div>

    <div className="
      font-bold
      text-slate-900
    ">
      Estado de publicación
    </div>

    <div className="
      text-sm
      text-slate-500
    ">
      Mostrar categoría en la tienda
    </div>

  </div>

  <button
    type="button"

    onClick={() =>
      setCategory({
        ...category,
        active: !category.active
      })
    }

    className={`
      relative
      w-16
      h-9

      rounded-full

      transition-all

      ${
        category.active
          ? "bg-emerald-500"
          : "bg-slate-300"
      }
    `}
  >

    <span
      className={`
        absolute
        top-1
        left-1

        w-7
        h-7

        bg-white
        rounded-full

        transition-all

        ${
          category.active
            ? "translate-x-7"
            : ""
        }
      `}
    />

  </button>

</div>

          </label>

          <AdminButton
            onClick={guardarCategoria}
          >
            💾 Guardar cambios
          </AdminButton>

        </div>

      </div>

    </AdminCard>

  );

}

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

<button
  type="button"

  onClick={() =>
    setCategory({
      ...category,
      active: !category.active
    })
  }

  className={`
    w-full

    p-5

    rounded-3xl

    font-black
    text-lg

    transition-all

    ${
      category.active
        ? `
          bg-emerald-50
          text-emerald-700
          border
          border-emerald-200
        `
        : `
          bg-red-50
          text-red-700
          border
          border-red-200
        `
    }
  `}
>
  {
    category.active
      ? "🟢 Categoría Visible"
      : "🔴 Categoría Oculta"
  }
</button>

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

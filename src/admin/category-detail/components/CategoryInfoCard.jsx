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

          <AdminInput
            placeholder="URL Imagen"

            value={category.image || ""}

            onChange={(e) =>
              setCategory(prev => ({
                ...prev,
                image: e.target.value
              }))
            }
          />

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

            <input
              type="checkbox"

              checked={
                category.active || false
              }

              onChange={(e) =>
                setCategory(prev => ({
                  ...prev,
                  active:
                    e.target.checked
                }))
              }
            />

            Categoría activa

          </label>

          <AdminButton
            onClick={guardarCategoria}
          >
            💾 Guardar cambios
          </AdminButton>

        </div>

        {/* IMAGEN */}
        <div>

          {category.image && (

            <img
              src={category.image}

              alt={category.name}

              className="
                w-full
                rounded-[24px]
                object-cover

                shadow-[0_15px_35px_rgba(0,0,0,0.12)]

                transition-all
                duration-500

                hover:scale-[1.02]
              "
            />

          )}

        </div>

      </div>

    </AdminCard>

  );

}

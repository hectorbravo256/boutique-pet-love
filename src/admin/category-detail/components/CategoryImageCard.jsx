import AdminCard from "../../components/AdminCard";
import AdminButton from "../../components/AdminButton";

export default function CategoryImageCard({

  category,
  subirImagen

}) {

  return (

    <AdminCard>

      <h2 className="
        text-2xl
        font-black
        text-slate-900
        mb-6
      ">
        Imagen de categoría
      </h2>

      <div className="
        grid
        lg:grid-cols-[400px_1fr]
        gap-8
        items-start
      ">

        <div>

          {category?.image ? (

            <img
              src={category.image}

              alt={category.name}

              className="
                w-full
                rounded-[24px]
                shadow-lg
                object-cover
              "
            />

          ) : (

            <div className="
              h-[300px]

              rounded-[24px]

              border-2
              border-dashed
              border-slate-300

              flex
              items-center
              justify-center

              text-slate-400
            ">
              Sin imagen
            </div>

          )}

        </div>

        <div className="space-y-4">

          <input
            type="file"

            accept="image/*"

            onChange={(e) =>
              subirImagen(
                e.target.files[0]
              )
            }

            className="
              block
              w-full
            "
          />

          <p className="
            text-sm
            text-slate-500
          ">
            Recomendado:
            1200x800 px
          </p>

        </div>

      </div>

    </AdminCard>

  );

}

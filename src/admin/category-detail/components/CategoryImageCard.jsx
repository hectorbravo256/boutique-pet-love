import AdminCard from "../../components/AdminCard";

export default function CategoryImageCard({

  category,
  subirImagen,
  eliminarImagen

}) {

  return (

    <AdminCard>

      <h2 className="
        text-2xl
        font-black
        text-slate-900
        mb-8
      ">
        Imagen de categoría
      </h2>

      <div className="
        flex
        flex-col
        items-center
      ">

        {category?.image ? (

          <img
            src={category.image}
            alt={category.name}

            className="
              w-full
              max-w-[500px]

              rounded-[24px]

              shadow-xl

              object-cover
            "
          />

        ) : (

          <div className="
            w-full
            max-w-[500px]

            h-[320px]

            rounded-[24px]

            border-2
            border-dashed
            border-slate-300

            flex
            items-center
            justify-center

            text-slate-400
            font-semibold
          ">
            Sin imagen
          </div>

        )}

        <p className="
          mt-5
          text-sm
          text-slate-500
        ">
          Recomendado: 1200x800 px
        </p>

        <div className="
          flex
          flex-wrap
          justify-center
          gap-4

          mt-6
        ">

          <label
            className="
              cursor-pointer

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
            📤 Subir imagen

            <input
              hidden
              type="file"
              accept="image/*"

              onChange={(e) =>
                subirImagen(
                  e.target.files[0]
                )
              }
            />

          </label>

          <button
            type="button"

            onClick={() =>
              eliminarImagen()
            }

            className="
              px-6
              py-3

              rounded-2xl

              bg-red-50
              text-red-600

              font-bold

              border
              border-red-200

              hover:bg-red-100

              transition-all
            "
          >
            🗑 Eliminar imagen
          </button>

        </div>

      </div>

    </AdminCard>

  );

}

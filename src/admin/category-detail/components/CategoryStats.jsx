import AdminCard from "../../components/AdminCard";

export default function CategoryStats({

  category,
  totalProducts

}) {

  return (

    <AdminCard>

      <h2 className="
        text-2xl
        font-black
        text-slate-900
        mb-6
      ">
        Estadísticas
      </h2>

      <div className="
        grid
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        {/* PRODUCTOS */}

        <div className="
          p-5
          rounded-3xl

          bg-gradient-to-br
          from-pink-50
          to-white

          border
          border-pink-100
        ">

          <div className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-slate-400
            font-black
          ">
            Productos
          </div>

          <div className="
            text-3xl
            font-black
            text-slate-900
            mt-2
          ">
            {totalProducts}
          </div>

        </div>

        {/* ESTADO */}

        <div className="
          p-5
          rounded-3xl

          bg-gradient-to-br
          from-emerald-50
          to-white

          border
          border-emerald-100
        ">

          <div className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-slate-400
            font-black
          ">
            Estado
          </div>

          <div className="
            text-xl
            font-black
            mt-2

            ${
              category.active
                ? "text-emerald-600"
                : "text-red-600"
            }
          ">
            {category.active
              ? "Activa"
              : "Inactiva"}
          </div>

        </div>

        {/* ORDEN */}

        <div className="
          p-5
          rounded-3xl

          bg-gradient-to-br
          from-blue-50
          to-white

          border
          border-blue-100
        ">

          <div className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-slate-400
            font-black
          ">
            Orden
          </div>

          <div className="
            text-3xl
            font-black
            text-slate-900
            mt-2
          ">
            {category.sort_order || 0}
          </div>

        </div>

        {/* SEO */}

        <div className="
          p-5
          rounded-3xl

          bg-gradient-to-br
          from-purple-50
          to-white

          border
          border-purple-100
        ">

          <div className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-slate-400
            font-black
          ">
            SEO
          </div>

          <div className="
            text-xl
            font-black
            mt-2
          ">

            {
              category.seo_title &&
              category.seo_description
                ? "Optimizado"
                : "Pendiente"
            }

          </div>

        </div>

      </div>

      {/* URL */}

      <div className="
        mt-6

        p-4

        rounded-2xl

        bg-slate-50

        border
        border-slate-200
      ">

        <div className="
          text-xs
          uppercase
          tracking-[0.2em]
          text-slate-400
          font-black
          mb-2
        ">
          URL Pública
        </div>

        <div className="
          text-slate-700
          font-medium
          break-all
        ">
          https://boutiquepetlove.cl/categoria/{category.slug}
        </div>

      </div>

    </AdminCard>

  );

}

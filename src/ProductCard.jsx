import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product
}) {

  const navigate =
    useNavigate();

  const precios =
    product.product_variants
      ?.map(v =>
        Number(v.price)
      )
      .filter(v =>
        !isNaN(v)
      ) || [];

  const precioBase =
    precios.length > 0
      ? Math.min(...precios)
      : 0;

  const portada =
    product.product_images?.[0]?.url
    || "/placeholder.png";

  return (

    <div
      onClick={() =>
        navigate(
          `/producto/${product.id}`
        )
      }

      className="
        group
        cursor-pointer
        bg-white
        rounded-2xl
        md:rounded-3xl
        overflow-hidden
        shadow-sm
        hover:shadow-2xl
        transition-all
        duration-500
        hover:-translate-y-1
      "
    >

      {/* IMAGEN */}
      <div className="
        relative
        overflow-hidden
      ">

        <img
          src={`${portada}?width=800&quality=80`}

          alt={product.name}

          loading="lazy"

          className="
            w-full
            aspect-[4/5]
            object-cover
            transition-all
            duration-700
            group-hover:scale-105
          "
        />

        {/* BADGES */}
        <div className="
          absolute
          top-3
          left-3
          flex
          flex-col
          gap-2
          z-10
        ">

          {product.discount_active && (
            <div className="
              bg-gradient-to-r
              from-pink-500
              to-purple-500
              text-white
              text-[10px]
              md:text-xs
              font-bold
              px-2
              py-1
              rounded-full
              shadow-lg
            ">
              🔥 -{product.discount_percent}% OFF
            </div>
          )}

          {product.best_seller && (
            <div className="
              bg-orange-500
              text-white
              text-[10px]
              md:text-xs
              font-bold
              px-2
              py-1
              rounded-full
            ">
              🔥 BEST SELLER
            </div>
          )}

          {product.new_collection && (
            <div className="
              bg-sky-500
              text-white
              text-[10px]
              md:text-xs
              font-bold
              px-2
              py-1
              rounded-full
            ">
              ✨ NUEVO
            </div>
          )}

        </div>

      </div>

      {/* INFO */}
      <div className="
        p-3
        md:p-5
      ">

        <h3 className="
          font-black
          text-sm
          md:text-xl
          text-gray-900
          line-clamp-2
          min-h-[40px]
          md:min-h-[56px]
        ">
          {product.name}
        </h3>

        <div className="
          mt-3
          text-pink-600
          font-black
          text-lg
          md:text-3xl
        ">
          Desde $
          {precioBase.toLocaleString("es-CL")}
        </div>

        {/* GÉNERO */}
        {product.gender && (

          <div className="
            mt-3
            inline-flex
            items-center
            gap-2
            px-3
            py-1
            rounded-full
            bg-pink-50
            text-pink-600
            text-xs
            md:text-sm
            font-semibold
          ">

            {product.gender === "hembra" && "🎀"}
            {product.gender === "macho" && "🐶"}
            {product.gender === "unisex" && "✨"}

            {product.gender}

          </div>

        )}

        {/* BOTÓN */}
        <button
          onClick={(e) => {

            e.stopPropagation();

            navigate(
              `/producto/${product.id}`
            );

          }}

          className="
            mt-4
            w-full
            bg-gradient-to-r
            from-pink-500
            to-purple-500
            hover:opacity-90
            text-white
            py-2.5
            md:py-3
            rounded-xl
            md:rounded-2xl
            font-semibold
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.02]
          "
        >
          Ver producto
        </button>

      </div>

    </div>

  );

}

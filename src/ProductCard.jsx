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

  const totalStock =
  product.product_variants?.reduce(
    (acc, v) =>
      acc + (v.stock || 0),
    0
  ) || 0;

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
        shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
        transition-all
        duration-500
        hover:-translate-y-0.5
        hover:scale-[1.02]
      "
    >

      {/* IMAGEN */}
      <div className="
        relative
        overflow-hidden
      ">

        <img
          src={`${portada}?width=450&quality=75`}

          alt={product.name}

          loading="lazy"
          width="450"
          height="563"

          className="
            w-full
            aspect-[4/5]
            object-cover
            transition-all
            duration-700
            group-hover:scale-[1.03]
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
              text-[9px] tracking-wide uppercase
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
              text-[9px] tracking-wide uppercase
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
              text-[9px] tracking-wide uppercase
              md:text-xs
              font-bold
              px-2
              py-1
              rounded-full
            ">
              ✨ NUEVO
            </div>
          )}

          {totalStock <= 3 && totalStock > 0 && (

  <div className="
    bg-red-500
    text-white
    text-[9px]
    tracking-wide
    uppercase
    font-bold
    px-2
    py-1
    rounded-full
  ">
    Últimas unidades
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
          text-base
          md:text-2xl
        ">
          Desde $
          {precioBase.toLocaleString("es-CL")}
        </div>

      

        {/* BOTÓN */}
        <button
          onClick={(e) => {

            e.stopPropagation();

            navigate(
              `/producto/${product.id}`
            );

          }}

          className="
            mt-3
            w-full
            bg-gradient-to-r
            from-pink-500
            to-purple-500
            hover:opacity-90
            text-white
            py-1.5
            md:py-2
            rounded-lg
            md:rounded-xl
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

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (*)
        `)
        .eq("category", slug)
        .eq("active", true);

      if (!error) {
        setProducts(data || []);
      }
    };

    cargar();
  }, [slug]);

return (
  <div className="px-4 md:px-8 py-8 bg-pink-50 min-h-screen">

  <h2 className="
  text-3xl
  md:text-4xl
  font-black
  text-pink-600
  mb-8
  tracking-wide
">
  {slug}
</h2>

<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-5
">
        {products.map(p => (
<div
  key={p.id}
  onClick={() => navigate(`/producto/${p.id}`)}
  className="
    group
    cursor-pointer
    bg-white/90
    backdrop-blur-sm
    rounded-3xl
    overflow-hidden
    border
    border-pink-100
    shadow-sm
    hover:shadow-2xl
    transition-all
    duration-500
    hover:-translate-y-1
  "
>

  {/* 🔥 IMAGEN */}
  <div className="relative overflow-hidden">

    <img
      src={
        p.product_images?.[0]?.url
          ? `${p.product_images[0].url}?width=800&quality=80`
          : "/placeholder.png"
      }
      loading="lazy"
      onLoad={(e) =>
        e.target.classList.remove("opacity-0")
      }
      className="
        opacity-0
        transition-all
        duration-700
        group-hover:scale-105
        w-full
        aspect-square
        object-cover
      "
    />

    {/* 🔥 BADGE DESCUENTO */}
    {p.discount_active && (
      <div className="absolute top-3 left-3 z-10">

        <div className="
          bg-gradient-to-r
          from-pink-500
          to-purple-500
          text-white
          text-xs
          font-bold
          px-3
          py-1
          rounded-full
          shadow-lg
        ">
          OFERTA
        </div>

      </div>
    )}

  </div>

  {/* 🔥 CONTENIDO */}
  <div className="p-4 space-y-2">

    <h3 className="
      font-bold
      text-gray-800
      text-sm
      md:text-base
      line-clamp-2
      min-h-[48px]
    ">
      {p.name}
    </h3>

    {/* 💰 PRECIOS */}
    <div className="flex items-center gap-2 flex-wrap">

      {p.discount_active ? (
        <>
          <span className="
            text-sm
            text-gray-400
            line-through
          ">
            ${Number(p.price).toLocaleString("es-CL")}
          </span>

          <span className="
            text-lg
            font-black
            text-pink-600
          ">
            $
            {Math.round(
              p.price *
              (1 - p.discount_percent / 100)
            ).toLocaleString("es-CL")}
          </span>
        </>
      ) : (
        <span className="
          text-lg
          font-black
          text-pink-600
        ">
          ${Number(p.price).toLocaleString("es-CL")}
        </span>
      )}

    </div>

    {/* 🔥 BOTÓN */}
    <button
      className="
        mt-3
        w-full
        bg-gradient-to-r
        from-pink-500
        to-purple-500
        hover:opacity-90
        text-white
        py-3
        rounded-2xl
        font-semibold
        shadow-lg
        transition-all
        duration-300
        hover:scale-[1.02]
        active:scale-[0.98]
      "
    >
      Ver producto
    </button>

  </div>

</div>

))}

</div>

</div>
    );
}

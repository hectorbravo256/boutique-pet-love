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
          product_images (*),
          product_variants (*)
        `)
        .eq("category", slug)
        .eq("active", true)
.order("sort_order", {
  foreignTable: "product_images",
  ascending: true
});

      if (!error) {
        
        setProducts(data || []);
      }
    };

    cargar();
  }, [slug]);

return (
  <div className="
  px-4
  md:px-8
  py-8
  bg-gradient-to-b
  from-pink-50
  via-white
  to-pink-100
  min-h-screen
  overflow-x-hidden
">

  <h2 className="
  text-2xl
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
  gap-3 md:gap-5
">
        {products.map(p => {

  const precios =
  p.product_variants
    ?.map(v => Number(v.price))
    .filter(v => !isNaN(v))
  || [];

const precioBase =
  precios.length > 0
    ? Math.min(...precios)
    : 0;

  return (
    
<div
  key={p.id}
  onClick={() => navigate(`/producto/${p.id}`)}
  className="
    group
    cursor-pointer
    bg-white/90
    backdrop-blur-sm
    rounded-2xl md:rounded-3xl
    overflow-hidden
    border
    border-pink-100
    shadow-sm
    hover:shadow-2xl
    transition-all
    duration-500
    hover:-translate-y-1

  before:absolute
  before:inset-0
  before:bg-gradient-to-b
  before:from-white/40
  before:to-transparent
  before:pointer-events-none
  relative
  "
>

  {/* 🔥 IMAGEN */}
  <div className="relative overflow-hidden">

    <img
      src={
        p.product_images?.[0]?.url
          ? `${p.product_images[0].url}?width=350&quality=65`
          : "/placeholder.png"
      }
      loading="lazy"
      alt={p.name}
      width="450"
      height="450"
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
          🔥 -{p.discount_percent}% OFF
        </div>

      </div>
    )}

  </div>

  {/* 🔥 CONTENIDO */}
  <div className="p-4 space-y-2">

<h3 className="
  font-black
  text-gray-800
  text-sm md:text-xl
  leading-tight
  tracking-tight
  line-clamp-2
  min-h-[42px] md:min-h-[56px]
  transition-all
  duration-300
  group-hover:text-pink-600
">
  {p.name}
</h3>

<div className="mt-2">

  {p.discount_active ? (

    <div className="flex items-center gap-2 mt-2">

  <span className="
    text-xs
    uppercase
    tracking-wide
    text-gray-400
    font-semibold
  ">
    Precio desde
  </span>

  <span className="
    text-pink-600
    font-black
    text-xl
  ">
    ${precioBase.toLocaleString("es-CL")}
  </span>

</div>

  ) : (

    <span className="
  text-pink-600
  font-black
  text-xl
">
  Precio desde $
  {precioBase.toLocaleString("es-CL")}
</span>

  )}

</div>


{/* 🔥 BOTÓN PREMIUM */}
<div className="
  mt-4
  opacity-100
  md:opacity-0
  md:translate-y-3
  group-hover:opacity-100
  group-hover:translate-y-0
  transition-all
  duration-500
">

  <button
    onClick={(e) => {
  e.stopPropagation();
  navigate(`/producto/${p.id}`);
}}
    className="
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

</div>
  );
})}

</div>

</div>
    );
}

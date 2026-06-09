import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Helmet } from "react-helmet-async";

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);

  const categoryName = slug
  ?.replaceAll("-", " ")
  ?.replace(/\b\w/g, l => l.toUpperCase());

const seoTitle =
  category?.seo_title ||
  `${categoryName} para Perros | Boutique Pet Love`;

const seoDescription =
  category?.seo_description ||
  `Descubre nuestra colección ${categoryName} para perros. Diseños premium, máxima comodidad y envíos a todo Chile.`;

const seoUrl =
  `https://boutiquepetlove.cl/categoria/${slug}`;

  const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",

  name: seoTitle,

  description: seoDescription,

  url: seoUrl
};

  const itemListSchema = {
  "@context": "https://schema.org",

  "@type": "ItemList",

  itemListElement: products.map(
    (product, index) => ({
      "@type": "ListItem",

      position: index + 1,

      url:
        `https://boutiquepetlove.cl/producto/${product.slug}`,

      name:
        product.name
    })
  )
};

  const faqSchema = {

  "@context": "https://schema.org",

  "@type": "FAQPage",

  mainEntity: [

    {
      "@type": "Question",

      name:
        "¿Cómo elegir la talla adecuada para mi perro?",

      acceptedAnswer: {

        "@type": "Answer",

        text:
          "Recomendamos medir cuello, pecho y largo de tu mascota antes de seleccionar una talla."
      }
    },

    {
      "@type": "Question",

      name:
        "¿Realizan envíos a todo Chile?",

      acceptedAnswer: {

        "@type": "Answer",

        text:
          "Sí, realizamos envíos a todas las regiones de Chile mediante operadores logísticos."
      }
    },

    {
      "@type": "Question",

      name:
        "¿Qué pasa si la talla no queda bien?",

      acceptedAnswer: {

        "@type": "Answer",

        text:
          "Puedes contactarnos para gestionar un cambio sujeto a disponibilidad y políticas vigentes."
      }
    }

  ]

};

useEffect(() => {

  const cargar = async () => {

    // Buscar categoría por slug
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!categoryData) return;
    
    setCategory(categoryData);

    // Buscar productos usando el nombre real
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        product_variants (*)
      `)
      .eq("category", categoryData.name)
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

  <>
  <Helmet>
    

    <title>
      {seoTitle}
    </title>

    <meta
      name="description"
      content={seoDescription}
    />

    <link
      rel="canonical"
      href={seoUrl}
    />

    <meta
      property="og:title"
      content={seoTitle}
    />

    <meta
      property="og:description"
      content={seoDescription}
    />

<meta
  property="og:image"
  content={
    category?.image ||
    "https://boutiquepetlove.cl/logo-google.webp"
  }
/>

<meta
  name="twitter:card"
  content="summary_large_image"
/>

<meta
  name="twitter:title"
  content={seoTitle}
/>

<meta
  name="twitter:description"
  content={seoDescription}
/>

<meta
  name="twitter:image"
  content={
    category?.image ||
    "https://boutiquepetlove.cl/logo-google.webp"
  }
/>

    <meta
      property="og:url"
      content={seoUrl}
    />

    <meta
      property="og:type"
      content="website"
    />

    <script
  type="application/ld+json"
>
  {JSON.stringify(collectionSchema)}
</script>

    <script
  type="application/ld+json"
>
  {JSON.stringify(itemListSchema)}
</script>

    <script
  type="application/ld+json"
>
  {JSON.stringify(faqSchema)}
</script>

  </Helmet>
  
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
  {category?.name || categoryName}
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
  onClick={() => navigate(`/producto/${p.slug}`)}
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
  navigate(`/producto/${p.slug}`);
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

    {category?.seo_text && (

  <div className="
    mt-16
    bg-white
    rounded-3xl
    p-8
    shadow-sm
  ">

    <h2 className="
      text-2xl
      font-black
      text-gray-900
      mb-4
    ">
      {category.name}
    </h2>

    <p className="
      text-gray-600
      leading-8
      whitespace-pre-line
    ">
      {category.seo_text}
    </p>

  </div>

)}

{products.length > 0 && (

  <div className="
    mt-10
    bg-white
    rounded-3xl
    p-8
    shadow-sm
  ">

    <h2 className="
      text-2xl
      font-black
      text-gray-900
      mb-6
    ">
      Preguntas frecuentes
    </h2>

    <div className="space-y-6">

      <div>
        <h3 className="font-bold text-lg">
          ¿Cómo elegir la talla adecuada?
        </h3>

        <p className="text-gray-600 mt-2">
          Recomendamos medir cuello, pecho y largo de tu mascota antes de comprar.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">
          ¿Realizan envíos a todo Chile?
        </h3>

        <p className="text-gray-600 mt-2">
          Sí, despachamos a todas las regiones del país.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">
          ¿Puedo cambiar una prenda?
        </h3>

        <p className="text-gray-600 mt-2">
          Sí, sujeto a disponibilidad y condiciones de cambio vigentes.
        </p>
      </div>

    </div>

  </div>

)}
    
</div>

</>
);
}

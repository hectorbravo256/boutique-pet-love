
import { ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Checkout from "./Checkout";
import './index.css';
import Login from "./Login";
import { supabase } from "./supabaseClient";
import Category from "./Category";
import Gender from "./Gender";
import Collection from "./Collection";
import Product from "./Product";
import Layout from "./Layout";
import Success from "./Success";
import ScrollToTop from "./ScrollToTop";
import ProductCard from "./ProductCard";

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const Productos = lazy(() => import("./admin/Productos"));
const CrearProducto = lazy(() => import("./admin/CrearProducto"));
const Ventas = lazy(() => import("./admin/Ventas"));
const ProductoDetalle = lazy(() => import("./admin/ProductoDetalle"));
const AdminCategorias = lazy(() => import("./admin/AdminCategorias"));


const WHATSAPP = "https://wa.me/56982700002";


/* ================= PRODUCTOS ================= */


/* ================= APP PRINCIPAL ================= */

function AppContent() {
  const navigate = useNavigate();

const increaseQty = (index) => {
  const updated = [...cart];
  updated[index].qty = (updated[index].qty || 1) + 1;

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const decreaseQty = (index) => {
  const updated = [...cart];

  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};


  const [selectedSizes, setSelectedSizes] = useState({});
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [
  currentHero,
  setCurrentHero
] = useState(0);
	
const heroProduct =
  featuredProducts[
    Math.min(
      currentHero,
      Math.max(
        featuredProducts.length - 1,
        0
      )
    )
  ] || null;
	
const heroPrecios =
  (heroProduct?.product_variants || [])
    .map(v => Number(v.price || 0))
    .filter(v => !isNaN(v));

const heroPrecioBase =
  heroPrecios.length > 0
    ? Math.min(...heroPrecios)
    : 0;

	const nuevosProductos =
  products.filter(
    p => p.new_collection
  );

	useEffect(() => {

  if (
    featuredProducts.length <= 1
  ) return;

  const interval =
    setInterval(() => {

      setCurrentHero(prev =>

        prev ===
        featuredProducts.length - 1

          ? 0

          : prev + 1

      );

    }, 5000);

  return () =>
    clearInterval(interval);

}, [featuredProducts]);

	useEffect(() => {

  if (
    currentHero >
    featuredProducts.length - 1
  ) {

    setCurrentHero(0);

  }

}, [featuredProducts, currentHero]);

	const bestSellers =
  products.filter(
    p => p.best_seller
  );
	const luxuryProducts =
  products.filter(
    p => p.luxury
  );
	const exclusiveProducts =
  products.filter(
    p => p.exclusive
  );
	
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
  nombre: "",
  rut: "",
  direccion: "",
  comuna: "",
  region: "",
  correo: "",
  telefono: "",
  observacion: "",
});
  const [currentIndex, setCurrentIndex] = useState({});
  const touchStartRef = useRef({});
  const [zoomGallery, setZoomGallery] = useState(null);

  const zoomTouchStart = useRef(0);
  const handleTouchStart = (e, productId) => {
   touchStartRef.current[productId] = e.touches[0].clientX;
};
  const handleTouchEnd = (e, product) => {
  const start = touchStartRef.current[product.id];
  if (!start) return;
  const end = e.changedTouches[0].clientX;
  const diff = start - end;
if (Math.abs(diff) > 50 && product.product_images?.length > 0) {
  setCurrentIndex((prev) => {
    const current = prev[product.id] || 0;
    const images = product.product_images?.map(i => i.url) || [];

if (images.length === 0) return prev;

const next =
  diff > 0
    ? (current + 1) % images.length
    : (current - 1 + images.length) % images.length;

    return { ...prev, [product.id]: next };
  });
}

  delete touchStartRef.current[product.id];
};
 
/* ===== CARRITO LOCAL ===== */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // 🧩 CARGAR PRODUCTOS
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
  .from("products")
  .select(`
    *,
    product_variants (*),
    product_images (*)
  `)
  .eq("active", true)
  .order("sort_order", {
    foreignTable: "product_images",
    ascending: true
  });

		(data || []).forEach(product => {

  product.product_images?.sort(
    (a, b) =>
      (a.sort_order || 0)
      -
      (b.sort_order || 0)
  );

});

      setProducts(data || []);

		const destacados =
  (data || [])

    .filter(p => p.featured)

    .sort(
      (a, b) =>
        (a.featured_order || 0)
        -
        (b.featured_order || 0)
    );

setFeaturedProducts(destacados);	
    };

    cargar();
  }, []);

useEffect(() => {
  supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", {
      ascending: true
    })
    .then(({ data }) => {

      setCategories(data || []);

      setLoadingCategories(false);

    });

}, []);



  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  	}, [cart]);


  useEffect(() => {
  	document.body.style.overflow = zoomGallery ? "hidden" : "auto";
	}, [zoomGallery]);

	const AUTO_SLIDE = false; // 🔥 cambiar a true cuando quieras activarlo

  useEffect(() => {
  if (!AUTO_SLIDE) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => {
      const updated = { ...prev };

      products.forEach((product) => {
        if (product.product_images?.length > 0) {
  	  const current = prev[product.id] || 0;

  	  updated[product.id] =
    	     current === product.product_images.length - 1 ? 0 : current + 1;
	}
      });

      return updated;
    });
  }, 3000);

  return () => clearInterval(interval);
}, [products]);


 /* ===== FUNCIONES ===== */
// 🧩 FORMATEAR PRECIO
  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);

    // 🧩 AGREGAR AL CARRITO
  const addToCart = (product) => {

    const size = selectedSizes[product.id];

    if (!size) {
      window.dispatchEvent(
  new CustomEvent("toast", {
    detail: "Selecciona una talla"
  })
);
      return;
    }
 const variant = product.product_variants.find(
      (v) => v.size === size
    );

if (!variant) {
  alert("Error seleccionando producto");
  return;
}

const stock = stockMap[`${product.id}-${size}`] || 0;



if (stock === 0) {
  alert("⚠️ Producto sin stock disponible");
  return;
}

const item = {
  id: variant.id,
  product_id: product.id,
      name: product.name,
      size,
      price: variant?.price || 0,
      qty: 1,
      image:
  (product.product_images?.[0]?.url
    ? product.product_images[0].url + "?width=400&quality=70"
    : "/placeholder.png"),
    };

    setCart((prev) => {
  const existingIndex = prev.findIndex(
    (i) => i.product_id === item.product_id && i.size === item.size
  );

  if (existingIndex !== -1) {
    const updated = [...prev];
    updated[existingIndex].qty += 1;
    return updated;
  }

  return [...prev, item];
});
  };

const removeItem = (i) => {
  const updated = cart.filter((_, idx) => idx !== i);

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

  const total = cart.reduce(
  (acc, i) => acc + i.price * (i.qty || 1),
  0
);

  const regionesConEnvio = [
  	"Región Metropolitana de Santiago",
  	"Región de Valparaíso",
  	"Región del Libertador General Bernardo O'Higgins",
];

  const aplicaEnvio =
  	cart.length > 0 && regionesConEnvio.includes(formData.region);

  const mensajeEnvio = formData.region
  	? regionesConEnvio.includes(formData.region)
    	? "Envío $3.500 por PAKET"
    	: "Envío por pagar (Starken / Blue Express)"
  	: "Selecciona tu región para calcular envío";

  const shipping = aplicaEnvio ? 3500 : 0;

  const totalFinal = total + shipping;

  const handleMercadoPago = async () => {
	  
  	// ✅ VALIDACIÓN FORMULARIO


  try {
  const res = await fetch("/.netlify/functions/create-preference", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
 body: JSON.stringify({
  items: cart,
  formData,
}),
});

    const data = await res.json();

localStorage.setItem(
  "lastOrder",
  JSON.stringify({
    cart,
    formData,
    total: totalFinal,
    date: new Date().toISOString(),
  })
);

    window.location.href = data.init_point;
  } catch (error) {
    alert("Error al iniciar pago");
  }
};

/* ================= UI ================= */
  return (
         <div className="bg-pink-50 min-h-screen">
    
      


{/* 🔥 HERO PREMIUM */}
{heroProduct && (

<section
  key={heroProduct.id}

  className="
    relative
    overflow-hidden
    px-6
    md:px-12
    py-4
    md:py-20
    animate-fade
  "
>

  {/* FONDO */}
  <div
    className="
      absolute
      inset-0
      bg-gradient-to-br
      from-pink-100
      via-white
      to-purple-100
    "
  />

  {/* BLUR */}
  <div
    className="
      absolute
      top-0
      right-0
      w-[500px]
      h-[500px]
      bg-pink-300/30
      blur-3xl
      rounded-full
    "
  />

  <div
    className="
      relative
      z-10
      grid
      md:grid-cols-2
      gap-4
      md:gap-10
      items-center
    "
  >

    {/* TEXTO */}
    <div>

      <span
        className="
          inline-flex
          items-center
          gap-2
          bg-white
          px-3
          py-1.5
          md:px-4
          md:py-2
          rounded-full
          shadow-md
          text-pink-600
          font-semibold
		  text-sm
          md:text-base
        "
      >
        ⭐ Producto Destacado
      </span>

      <h1
        className="
          mt-6
          text-[34px]
          leading-[0.95]
          sm:text-5xl
          md:text-7xl
          font-black
          leading-tight
          text-gray-900
        "
      >
        {heroProduct.name}
      </h1>

	<p
  	  className="
    	  hidden
    	  md:block
    	  mt-6
    	  text-lg
          text-gray-600
          max-w-xl
        "
      >
        {heroProduct.description}
      </p>

<div className="hidden md:block">		
		
      {/* PRECIOS */}
      <div className="mt-8">

        {heroProduct.discount_active ? (

          <div className="flex items-center gap-3 flex-wrap">

            <span
              className="
                text-2xl
                text-gray-400
                line-through
                font-bold
              "
            >
              Desde $

              {
  heroPrecioBase.toLocaleString("es-CL")
}
            </span>

            <span
              className="
                text-4xl
                md:text-5xl
                font-black
                text-pink-600
              "
            >
              $

              {
                Math.round(
  heroPrecioBase *
  (
    1 -
    heroProduct.discount_percent / 100
  )
).toLocaleString("es-CL")
              }
            </span>

          </div>

        ) : (

          <div
            className="
              text-5xl
              font-black
              text-pink-600
            "
          >
            Desde $

            {
  heroPrecioBase.toLocaleString("es-CL")
}
          </div>

        )}

      </div>
	</div>

		{/* INDICADORES */}
<div
  className="
    hidden
    md:flex
    gap-3
    mt-6
    md:mt-10
  "
>

  {featuredProducts.map(
    (_, index) => (

      <button
        key={index}

        onClick={() =>
          setCurrentHero(index)
        }

        className={`
          h-3
          rounded-full
          transition-all
          duration-500

          ${
            currentHero === index

              ? "w-10 bg-pink-600"

              : "w-3 bg-pink-200"
          }
        `}
      />

    )
  )}

</div>
		
      {/* BOTONES */}
      <div
        className="
          flex
          gap-3
          mt-10
          flex-wrap
        "
      >

        <button
          onClick={() =>
            navigate(
              `/producto/${heroProduct.id}`
            )
          }

          className="
            bg-pink-600
            hover:bg-pink-700
            text-white
            px-6
            py-3
            md:px-8
            md:py-4
            rounded-2xl
            font-bold
            text-base
            md:text-lg
            shadow-xl
            transition-all
            duration-300
            hover:scale-105
          "
        >
          Comprar ahora
        </button>

        <a
          href="https://instagram.com/boutique_petlove"
          target="_blank"

          className="
			hidden
			md:flex
            bg-white
            text-gray-800
            px-8
            py-4
            rounded-2xl
            font-bold
            text-lg
            shadow-md
            border
          "
        >
          Ver Instagram
        </a>

      </div>

    </div>

    {/* IMAGEN */}
    <div
      className="
        relative
        flex
        justify-center
      "
    >

      <div
        className="
          absolute
          inset-0
          bg-pink-300/20
          blur-3xl
          rounded-full
        "
      />

      <img
  src={
    heroProduct?.product_images?.[0]?.url
      ? `${heroProduct.product_images[0].url}?width=600&quality=60`
      : "/placeholder.png"
  }

  fetchPriority="high"

  alt={heroProduct.name}
  width="700"
  height="700"


  className="
    relative
    z-10
    w-full
    max-w-xl
    rounded-[40px]
    shadow-2xl
    object-cover
  "
/>

    </div>

  </div>

</section>

)}

			 {/* 🔥 DESTACADOS */}
{featuredProducts.length > 0 && (

<section className="px-6 pt-4 pb-10">

  <div className="flex items-center justify-between mb-6">

    <div>

      <h2 className="text-3xl font-black text-gray-900">
        ⭐ Productos Destacados
      </h2>

      <p className="text-gray-700 mt-1">
        Los favoritos de Boutique Pet Love
      </p>

    </div>

  </div>

  <div
    className="
      grid
      grid-cols-2
      md:grid-cols-3
      xl:grid-cols-4
      gap-3 md:gap-6
    "
  >

{featuredProducts.map(product => (

  <ProductCard
    key={product.id}
    product={product}
  />

))}

  </div>

</section>

)}

			{/* 🔥 NUEVA COLECCIÓN */}
	{nuevosProductos.length > 0 && (
<section className="px-6 pb-14">

  <div className="
    flex
    items-end
    justify-between
    mb-8
    gap-3
    flex-wrap
  ">

    <div>

      <p className="
        text-pink-500
        font-bold
        uppercase
        tracking-[0.25em]
        text-sm
      ">
        NEW DROP
      </p>

      <h2 className="
        text-4xl
        font-black
        text-gray-900
        mt-2
      ">
        Nueva Colección
      </h2>

      <p className="
        text-gray-500
        mt-2
      ">
        Descubre los últimos productos premium
      </p>

    </div>

  </div>

<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-3
  md:gap-6
">

  {nuevosProductos.map(product => (

    <ProductCard
      key={product.id}
      product={product}
    />

  ))}

</div>

</section>
)}
			 
{/* 🔥 BEST SELLERS */}
{bestSellers.length > 0 && (

<section className="px-6 pb-16">

  {/* HEADER */}
  <div className="
    flex
    items-end
    justify-between
    mb-8
    gap-3
    flex-wrap
  ">

    <div>

      <p className="
        text-orange-500
        font-bold
        uppercase
        tracking-[0.25em]
        text-sm
      ">
        TOP SALES
      </p>

      <h2 className="
        text-4xl
        font-black
        text-gray-900
        mt-2
      ">
        🔥 Best Sellers
      </h2>

      <p className="
        text-gray-500
        mt-2
      ">
        Los productos más vendidos y favoritos
      </p>

    </div>

  </div>

<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-3
  md:gap-6
">

  {bestSellers.map(product => (

    <ProductCard
      key={product.id}
      product={product}
    />

  ))}

</div>

</section>

)}

	{/* 👑 LUXURY COLLECTION */}
{luxuryProducts.length > 0 && (

<section className="
  px-6
  py-20
  bg-gradient-to-br
  from-black
  via-gray-900
  to-black
  relative
  overflow-hidden
">

  {/* GLOW */}
  <div className="
    absolute
    top-0
    left-1/2
    -translate-x-1/2
    w-[700px]
    h-[700px]
    bg-yellow-500/10
    blur-3xl
    rounded-full
    pointer-events-none
  " />

  {/* HEADER */}
  <div className="
    relative
    z-10
    flex
    items-end
    justify-between
    mb-10
    gap-3
    flex-wrap
  ">

    <div>

      <p className="
        text-yellow-400
        font-bold
        uppercase
        tracking-[0.3em]
        text-sm
      ">
        PREMIUM COLLECTION
      </p>

      <h2 className="
        text-5xl
        font-black
        text-white
        mt-3
      ">
        👑 Luxury Collection
      </h2>

      <p className="
        text-gray-400
        mt-4
        max-w-2xl
      ">
        Productos exclusivos cuidadosamente seleccionados
        para una experiencia premium.
      </p>

    </div>

  </div>

<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-3
  md:gap-6
">

  {luxuryProducts.map(product => (

    <ProductCard
      key={product.id}
      product={product}
    />

  ))}

</div>

</section>

)} 

	{/* 💎 EXCLUSIVE COLLECTION */}
{exclusiveProducts.length > 0 && (

<section className="
  px-6
  py-24
  relative
  overflow-hidden
  bg-gradient-to-br
  from-fuchsia-950
  via-black
  to-purple-950
">

  {/* GLOW */}
  <div className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.25),transparent_50%)]
    pointer-events-none
  " />

  {/* HEADER */}
  <div className="
    relative
    z-10
    mb-12
    text-center
  ">

    <p className="
      text-pink-400
      uppercase
      tracking-[0.35em]
      text-sm
      font-bold
    ">
      LIMITED EDITION
    </p>

    <h2 className="
      mt-4
      text-5xl
      md:text-6xl
      font-black
      text-white
    ">
      💎 Exclusive Collection
    </h2>

    <p className="
      mt-5
      text-gray-300
      max-w-2xl
      mx-auto
      text-lg
    ">
      Productos únicos y exclusivos disponibles
      por tiempo limitado.
    </p>

  </div>

<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-3
  md:gap-6
">

  {exclusiveProducts.map(product => (

    <ProductCard
      key={product.id}
      product={product}
    />

  ))}

</div>

</section>

)}
			 
      {/* CATÁLOGO */}
      <section id="catalogo" className="p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Tienda online</h2>
          </div>
        </div>

  <div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-4
">
  {loadingCategories ? (

  [...Array(8)].map((_, i) => (
    <div
      key={i}
      className="
        rounded-3xl
        overflow-hidden
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          w-full
          aspect-[4/5]
          bg-gray-200
          animate-pulse
        "
      />

      <div
        className="
          h-16
          bg-gray-100
          animate-pulse
        "
      />
    </div>
  ))

) : (

  categories
    .filter(cat =>
      products.some(product =>
        product.category === cat.slug &&
        product.active
      )
    )
    .map(cat => (

      <div
        key={cat.id}
        onClick={() => navigate(`/categoria/${cat.slug}`)}
        className="
          group
          cursor-pointer
          rounded-3xl
          overflow-hidden
          bg-white
          shadow-sm
          hover:shadow-xl
          transition-all
          duration-500
          hover:-translate-y-1
        "
      >

        <img
          src={
            cat.featured_image || cat.image
              ? `${cat.featured_image || cat.image}?width=320&quality=60`
              : "/placeholder.png"
          }
          alt={cat.name}
          loading="lazy"
          className="
            transition-transform
            duration-700
            group-hover:scale-105
          "
          style={{
            width: "100%",
            aspectRatio: "4/5",
            objectFit: "cover"
          }}
        />

        <div
          className="
            p-4
            text-center
            font-black
            text-gray-800
            text-lg
            bg-white
          "
        >
          {cat.name}
        </div>

      </div>

    ))

)}
</div>
</section>



{/* 🔍 ZOOM IMAGEN */}
{zoomGallery && (
  <div
  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"

  onTouchStart={(e) => {
    zoomTouchStart.current = e.touches[0].clientX;
  }}

  onTouchEnd={(e) => {
    const end = e.changedTouches[0].clientX;
    const diff = zoomTouchStart.current - end;

    if (Math.abs(diff) > 50) {
      setZoomGallery((prev) => ({
        ...prev,
        index:
          diff > 0
            ? (prev.index + 1) % prev.images.length
            : (prev.index - 1 + prev.images.length) % prev.images.length,
      }));
    }
  }}
>

 {/* FONDO CLIC PARA CERRAR */}
<div
  className="absolute inset-0 z-40"
  onClick={() => setZoomGallery(null)}
/>

<button
  onClick={() => setZoomGallery(null)}
  className="absolute top-5 right-5 text-white text-3xl z-50"
>
  ✕
</button>

<img
  src={`${zoomGallery.images[zoomGallery.index]}?width=1200&quality=80`}
  className="max-w-[90%] max-h-[90%] rounded-xl z-50 transition-opacity duration-300 opacity-0"
  onLoad={(e) => e.target.classList.remove("opacity-0")}
  onClick={(e) => e.stopPropagation()}
/>

<button
  onClick={() =>
    setZoomGallery((prev) => ({
      ...prev,
      index:
        prev.index === 0
          ? prev.images.length - 1
          : prev.index - 1,
    }))
  }
  className="absolute left-5 text-white text-3xl z-50 bg-black/40 px-3 py-1 rounded-full"
>
  ◀
</button>

<button
  onClick={() =>
    setZoomGallery((prev) => ({
      ...prev,
      index:
        prev.index === prev.images.length - 1
          ? 0
          : prev.index + 1,
    }))
  }
  className="absolute right-5 text-white text-3xl z-50 bg-black/40 px-3 py-1 rounded-full"
>
  ▶
</button>

  </div>
)}


      </div>
  );
}


/* ================= CHECKOUT WRAPPER ================= */
function CheckoutWrapper() {
  const [cart, setCart] = useState(() => {
  const stored = localStorage.getItem("cart");
  return stored ? JSON.parse(stored) : [];
});

  const [formData, setFormData] = useState({
  nombre: "",
  rut: "",
  direccion: "",
  comuna: "",
  region: "",
  correo: "",
  telefono: "",
  observacion: "",
});

// 🔥 CALCULAR TOTALES (MOVER AQUÍ)
const total = cart.reduce(
  (acc, i) => acc + i.price * (i.qty || 1),
  0
);

const regionesConEnvio = [
  "Región Metropolitana de Santiago",
  "Región de Valparaíso",
  "Región del Libertador General Bernardo O'Higgins",
];

const aplicaEnvio =
  cart.length > 0 && regionesConEnvio.includes(formData.region);

const shipping = aplicaEnvio ? 3500 : 0;

const totalFinal = total + shipping;

const handleMercadoPago = async () => {

  /* ✅ VALIDACIÓN FORMULARIO */

  if (!formData.nombre.trim()) {
    alert("Ingresa tu nombre");
    return;
  }

  if (!formData.rut.trim()) {
    alert("Ingresa tu RUT");
    return;
  }

  if (!formData.direccion.trim()) {
    alert("Ingresa tu dirección");
    return;
  }

  if (!formData.comuna.trim()) {
    alert("Ingresa tu comuna");
    return;
  }

  if (!formData.region) {
    alert("Selecciona una región");
    return;
  }

if (!formData.correo.includes("@")) {
  alert("Correo inválido");
  return;
}

if (!formData.telefono || formData.telefono.length < 8) {
  alert("Teléfono inválido");
  return;
}

/* 🛒 VALIDACIÓN CARRITO */

  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

 /* 💳 PAGO */

  try {
    const res = await fetch("/.netlify/functions/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart,
        formData,
      }),
    });

    const data = await res.json();

// 🔥 GUARDAR PEDIDO (CLAVE)
localStorage.setItem(
  "lastOrder",
  JSON.stringify({
    cart,
    formData,
    total: totalFinal,
    date: new Date().toISOString(),
  })
);

    window.location.href = data.init_point;
  } catch (error) {
    alert("Error al iniciar pago");
  }
};

const increaseQty = (index) => {
  const updated = [...cart];
  updated[index].qty = (updated[index].qty || 1) + 1;

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const decreaseQty = (index) => {
  const updated = [...cart];

  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const removeItem = (index) => {
  const updated = cart.filter((_, i) => i !== index);

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));

  // 🔥 sincroniza con layout / carrito flotante
  window.dispatchEvent(new Event("storage"));
};

const formatPrice = (p) =>
  p ? "$" + p.toLocaleString("es-CL") : "";


	useEffect(() => {
  const updateCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  window.addEventListener("storage", updateCart);

  return () => window.removeEventListener("storage", updateCart);
}, []);


return (
  <Checkout
  cart={cart}
  total={total}
  shipping={shipping}
  totalFinal={totalFinal}
  formData={formData}
  setFormData={setFormData}
  handleMercadoPago={handleMercadoPago}
  aplicaEnvio={aplicaEnvio}

  /* 🔥 NUEVO */
  increaseQty={increaseQty}
  decreaseQty={decreaseQty}
  removeItem={removeItem}
  formatPrice={formatPrice}
/>
  );
}


function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // 🔥 ESCUCHAR CAMBIOS DE LOGIN (CLAVE)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <p>Cargando...</p>;

  if (!session) return <Login />;

const allowedEmail = "hectorbravov@hotmail.es";

if (session?.user?.email !== allowedEmail) {
  return <p style={{ padding: 40 }}>⛔ No tienes acceso</p>;
}

return children;
}

/* ================= ROUTER ================= */
export default function App() {
  return (
  <BrowserRouter>
	  <ScrollToTop />
  <Routes>

    {/* 🟢 PÚBLICO (CON HEADER) */}
    <Route element={<Layout />}>
      <Route path="/" element={<AppContent />} />
      <Route path="/checkout" element={<CheckoutWrapper />} />
      <Route path="/categoria/:slug" element={<Category />} />
	  <Route path="/genero/:slug" element={<Gender />} />
	  <Route path="/coleccion/:slug" element={<Collection />} />
      <Route path="/producto/:id" element={<Product />} />
      <Route path="/success" element={<Success />} />
    </Route>

    {/* 🔴 ADMIN (SIN HEADER) */}
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <Suspense fallback={<div>Cargando...</div>}>
        <AdminLayout />
      </Suspense>
    </ProtectedRoute>
  }
>
      <Route index element={<Dashboard />} />
      <Route path="productos" element={<Productos />} />
      <Route path="crear" element={<CrearProducto />} />
      <Route path="ventas" element={<Ventas />} />
	  <Route
  path="/admin/producto/:id"
  element={<ProductoDetalle />}
/>
		<Route
  path="/admin/categorias"
  element={<AdminCategorias />}
/>
    </Route>

    {/* 🔐 LOGIN */}
    <Route path="/login" element={<Login />} />

  </Routes>
</BrowserRouter>    
  );
}

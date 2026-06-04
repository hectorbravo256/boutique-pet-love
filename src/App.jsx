
import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import './index.css';
import { supabase } from "./supabaseClient";
import Layout from "./Layout";
import ScrollToTop from "./ScrollToTop";
import ProductCard from "./ProductCard";

const CheckoutWrapper = lazy(() => import("./CheckoutWrapper"));
const Login = lazy(() => import("./Login"));
const Category = lazy(() => import("./Category"));
const Gender = lazy(() => import("./Gender"));
const Collection = lazy(() => import("./Collection"));
const Product = lazy(() => import("./Product"));
const Success = lazy(() => import("./Success"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const Productos = lazy(() => import("./admin/Productos"));
const CrearProducto = lazy(() => import("./admin/CrearProducto"));
const Ventas = lazy(() => import("./admin/Ventas"));
const ProductoDetalle = lazy(() => import("./admin/ProductoDetalle"));
const AdminCategorias = lazy(() => import("./admin/AdminCategorias"));



/* ================= PRODUCTOS ================= */


/* ================= APP PRINCIPAL ================= */

function AppContent() {
  const navigate = useNavigate();


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


  // 🧩 CARGAR PRODUCTOS
  useEffect(() => {
const cargar = async () => {

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
	  description,
      slug,
      category,
      active,
      featured,
      best_seller,
      luxury,
      exclusive,
      new_collection,
      discount_active,
      discount_percent,
      product_images (
        url,
        sort_order
      ),
      product_variants (
        price
      )
    `)
    .eq("active", true)
    .order("sort_order", {
      foreignTable: "product_images",
      ascending: true
    });

	if (error) {
  console.error(error);
  return;
}
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
    .filter(p => p.featured);

setFeaturedProducts(destacados);

	};

cargar();

}, []);

useEffect(() => {

  const cargarCategorias = async () => {

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", {
        ascending: true
      });


    if (error) {
      console.error(error);
    }

    setCategories(data || []);
    setLoadingCategories(false);

  };

  cargarCategorias();

}, []);


	
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
		aria-label={`Ir al producto destacado ${index + 1}`}
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
  loading="eager"
  fetchPriority="high"
  src={
    heroProduct?.product_images?.[0]?.url
      ? `${heroProduct.product_images[0].url}?width=550&quality=45`
      : "/placeholder.png"
  }

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
      <section
  id="catalogo"
  className="p-6"
>

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

  [...Array(1)].map((_, i) => (
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

  categories.map(cat => (

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
              ? `${cat.featured_image || cat.image}?width=280&quality=55`
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

      </div>
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

  if (!session)
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Login />
    </Suspense>
  );

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
<Route
  path="/checkout"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <CheckoutWrapper />
    </Suspense>
  }
/>
<Route path="/" element={<AppContent />} />
<Route path="/categoria/:slug" element={ <Suspense fallback={<div>Cargando...</div>}> <Category /> </Suspense> } />
<Route path="/genero/:slug" element={ <Suspense fallback={<div>Cargando...</div>}> <Gender /> </Suspense> } />
<Route path="/coleccion/:slug" element={ <Suspense fallback={<div>Cargando...</div>}> <Collection /> </Suspense> } />
<Route path="/producto/:id" element={ <Suspense fallback={<div>Cargando...</div>}> <Product /> </Suspense> } />
<Route path="/success" element={ <Suspense fallback={<div>Cargando...</div>}> <Success /> </Suspense> } />
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
      <Route
  index
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <Dashboard />
    </Suspense>
  }
/>
<Route
  path="productos"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <Productos />
    </Suspense>
  }
/>

<Route
  path="crear"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearProducto />
    </Suspense>
  }
/>

<Route
  path="ventas"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <Ventas />
    </Suspense>
  }
/>
<Route
  path="producto/:id"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductoDetalle />
    </Suspense>
  }
/>
<Route
  path="categorias"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <AdminCategorias />
    </Suspense>
  }
/>
    </Route>

    {/* 🔐 LOGIN */}
    <Route
  path="/login"
  element={
    <Suspense fallback={<div>Cargando...</div>}>
      <Login />
    </Suspense>
  }
/>

  </Routes>
</BrowserRouter>    
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Helmet } from "react-helmet-async";

const WHATSAPP = "https://wa.me/56982700002";

export default function Product() {
  const { slug } = useParams();

  
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  

  /* ================= SELECT TALLA ================= */
  const handleSelect = (variant) => {
    setSelected(variant.id);
    setSelectedVariant(variant);
    setQty(1);
  };

  /* ================= CANTIDAD ================= */
  const increaseQty = () => {
    if (!selectedVariant) return;

    const stock = selectedVariant.stock || 0;

    if (qty < stock) setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  /* ================= STOCK ================= */
  const currentStock =
  selectedVariant?.stock || 0;

  const isOutOfStock = selectedVariant && currentStock === 0;

  /* ================= CARRITO ================= */
  const addToCart = () => {
    if (!selected) {
      window.dispatchEvent(
  new CustomEvent("toast", {
    detail: "Selecciona una talla"
  })
);
      return;
    }

    const variant = product.product_variants.find(
      v => v.id == selected
    );

    
// 💰 PRECIO FINAL
const precioFinal = tieneDescuento
  ? Math.round(variant.price * (1 - product.discount_percent / 100))
  : variant.price;

    if (!variant) {
      window.dispatchEvent(
  new CustomEvent("toast", {
    detail: "Selecciona una talla"
  })
);
      return;
    }

    const size = variant.size;
    const stock = variant.stock || 0;

    if (stock === 0) {
      window.dispatchEvent(
  new CustomEvent("toast", {
    detail: "⚠️ Sin stock disponible"
  })
);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

const existingIndex = cart.findIndex(

  i =>
    i.product_id === product.id &&
    i.size === size

);

    if (existingIndex !== -1) {
      cart[existingIndex].qty += qty;
    } else {
cart.push({
  id: variant.id,
  product_id: product.id,
  name: product.name,
  size,
  price: precioFinal,
  originalPrice: variant.price,
  discount: tieneDescuento
    ? product.discount_percent
    : 0,

  stock: variant.stock || 0,

  qty,

  image:
    product.product_images?.[0]?.url +
    "?width=400&quality=70"
});
    }

    if (window.gtag) {
  window.gtag("event", "add_to_cart", {
    currency: "CLP",
    value: precioFinal * qty,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_variant: size,
        price: precioFinal,
        quantity: qty
      }
    ]
  });
}

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("openCart"));
  };

  const handleTouchStart = (e) => {
  setTouchStartX(e.targetTouches[0].clientX);
};

const handleTouchMove = (e) => {
  setTouchEndX(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {

  if (!showModal) return;

  if (!touchStartX || !touchEndX) return;

  const distance =
    touchStartX - touchEndX;

  // swipe izquierda
  if (distance > 70) {
    nextImage();
  }

  // swipe derecha
  if (distance < -70) {
    prevImage();
  }

  // reset
  setTouchStartX(0);
  setTouchEndX(0);

};

const nextImage = () => {
  const next =
    (currentIndex + 1) %
    product.product_images.length;

  setCurrentIndex(next);
};

const prevImage = () => {
  const prev =
    (
      currentIndex - 1 +
      product.product_images.length
    ) %
    product.product_images.length;

  setCurrentIndex(prev);
};

  /* ================= CARGA DATOS ================= */
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("products")
        .select(`
          *,
          product_variants (*),
          product_images (*)
        `)
        .eq("slug", slug)
        .order("sort_order", {
  foreignTable: "product_images",
  ascending: true
})
.single();
      

      setProduct(data);

      if (window.gtag && data) {
  window.gtag("event", "view_item", {
    currency: "CLP",
    items: [
      {
        item_id: data.id,
        item_name: data.name,
        item_category: data.category
      }
    ]
  });
}
    };

    cargar();
  }, [slug]);

  useEffect(() => {

  if (!product?.product_images) return;

  product.product_images.forEach((img) => {
    const preload = new Image();
    preload.src = `${img.url}?width=1200&quality=80`;
  });

}, [product]);



  useEffect(() => {

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setShowModal(false);
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };

}, []);

  /* ================= AUTO SELECT ================= */
  useEffect(() => {
    if (!product) return;

    const firstAvailable = product.product_variants.find(
      v => (v.stock || 0) > 0
    );

    if (firstAvailable) {
      setSelected(firstAvailable.id);
      setSelectedVariant(firstAvailable);
    }
  }, [product]);

  if (!product) {
  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-pink-50
    ">

      <div className="
        animate-pulse
        bg-white
        p-10
        rounded-3xl
        shadow-xl
        text-center
      ">

        <div className="
          w-16
          h-16
          border-4
          border-pink-200
          border-t-pink-500
          rounded-full
          animate-spin
          mx-auto
          mb-5
        " />

        <p className="
          text-pink-600
          font-bold
          text-lg
        ">
          Cargando producto...
        </p>

      </div>

    </div>
  );
}

  // 🔥 LÓGICA GLOBAL DESCUENTO
const ahora = new Date();

const inicio = product?.discount_start
  ? new Date(product.discount_start)
  : null;

const fin = product?.discount_end
  ? new Date(product.discount_end)
  : null;

const dentroDeFecha =
  (!inicio || ahora >= inicio) &&
  (!fin || ahora <= fin);

const tieneDescuento =
  product?.discount_active &&
  product?.discount_percent > 0 &&
  dentroDeFecha;

  const seoTitle =
  product.meta_title ||
  `${product.name} | Boutique Pet Love`;

const seoDescription =
  product.meta_description ||
  product.description ||
  "Moda premium para mascotas";

const seoImage =
  product.product_images?.[0]?.url ||
  "https://boutiquepetlove.cl/logo-google.webp";

const seoUrl =
  `https://boutiquepetlove.cl/producto/${product.slug}`;

  const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",

  name: product.name,

  image:
    product.product_images?.map(
      img => img.url
    ) || [],

  description: seoDescription,

  sku: product.slug,

  brand: {
    "@type": "Brand",
    name: "Boutique Pet Love"
  },

  offers: {
    "@type": "Offer",

    price:
      product.product_variants?.length
        ? Math.min(
            ...product.product_variants.map(
              v => Number(v.price)
            )
          )
        : 0,

    priceCurrency: "CLP",

    availability:
      product.product_variants?.some(
        v => v.stock > 0
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",

    url: seoUrl
  }
};

  const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",

  itemListElement: [

    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://boutiquepetlove.cl"
    },

    {
      "@type": "ListItem",
      position: 2,
      name: product.category,

      item:
        `https://boutiquepetlove.cl/categoria/${product.category
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")}`
    },

    {
      "@type": "ListItem",
      position: 3,
      name: product.name,
      item: seoUrl
    }

  ]
};

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
    content={seoImage}
  />

  <meta
    property="og:url"
    content={seoUrl}
  />

  <meta
    property="og:type"
    content="product"
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
  content={seoImage}
/>

<script type="application/ld+json">
  {JSON.stringify(productSchema)}
</script>

    <script type="application/ld+json">
  {JSON.stringify(breadcrumbSchema)}
</script>

  </Helmet>

    
<div className="
  max-w-7xl
  mx-auto
  px-4
  md:px-8
  py-8
  pb-8
">

  <div className="
  mb-6
  text-sm
  text-gray-500
">
  <a
    href="/"
    className="hover:text-pink-500"
  >
    Inicio
  </a>

  {" > "}

  <a
    href={`/categoria/${product.category
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
    }`}
    className="hover:text-pink-500"
  >
    {product.category}
  </a>

  {" > "}

  <span className="text-pink-600">
    {product.name}
  </span>
</div>

<div className="
  grid
  grid-cols-1
  lg:grid-cols-2
  gap-10
  items-start
">

      {/* ================= IMAGEN ================= */}
      <div>
        <div>

  {/* IMAGEN PRINCIPAL */}
  <div
    style={{
      overflow: "hidden",
      borderRadius: 16,
      cursor: "zoom-in"
    }}
  >
<div style={{ position: "relative" }}>

<img
  key={currentIndex}
  src={`${product.product_images[currentIndex]?.url}?width=1200&quality=80`}
  alt={product.name}
  loading="eager"

  onClick={() => {
    setShowModal(true);
  }}

  className="
    w-full
    rounded-3xl
    shadow-2xl
    object-cover

    transition-all
    duration-700
    ease-out

    hover:scale-[1.03]

    animate-[fadeImage_.45s_ease]
  "

  style={{
    aspectRatio: "1 / 1",
    cursor: "zoom-in"
  }}
/>

  {/* 🔥 BADGE DESCUENTO */}
  {tieneDescuento && product.discount_percent > 0 && (
    <div 
      className="
  absolute
  top-4
  right-4
  bg-gradient-to-r
  from-pink-500
  to-purple-500
  text-white
  px-4
  py-2
  rounded-full
  text-sm
  font-black
  shadow-xl
">
      🔥 -{product.discount_percent}% OFF
    </div>
  )}

</div>
  </div>

  {/* MINIATURAS */}
<div className="
  flex
  gap-3
  mt-5
  overflow-x-auto
  pb-2
  scrollbar-hide
">

  {product.product_images?.map((img, i) => (

    <button
      key={i}
      onClick={() => {
        setCurrentIndex(i);
      }}

      className={`
        relative
        flex-shrink-0
        rounded-2xl
        overflow-hidden
        transition-all
        duration-300

        ${
          currentIndex === i
            ? "ring-2 ring-pink-500 scale-105 shadow-2xl"
            : "opacity-70 hover:opacity-100"
        }
      `}
    >

      <img
        src={`${img.url}?width=200&quality=60`}
        alt={`${product.name} miniatura ${i + 1}`}
        className="
          w-20
          h-20
          object-cover
          transition-all
          duration-500
          hover:scale-110
        "
      />

      {/* GLOW PREMIUM */}
      {currentIndex === i && (
        <div className="
          absolute
          inset-0
          bg-gradient-to-tr
          from-pink-500/20
          to-purple-500/20
        " />
      )}

    </button>

  ))}

</div>

</div>
      </div>

      {/* ================= INFO ================= */}
      <div>

        {/* NOMBRE */}
        <h1 className="
  text-3xl
  md:text-5xl
  font-black
  text-gray-900
  leading-tight
  mb-4
">
          {product.name}
        </h1>

        {/* PRECIO */}
{selectedVariant ? (() => {

  const cantidad = qty || 1;

const precioBase = tieneDescuento
  ? Math.round(selectedVariant.price * (1 - product.discount_percent / 100))
  : selectedVariant.price;

const precioFinal = precioBase * cantidad;



  return (
    <div className="
  flex
  items-center
  gap-3
  flex-wrap
  mt-4
">

      {tieneDescuento && (
        <span style={{
          textDecoration: "line-through",
          color: "#999",
          fontSize: 18
        }}>
          ${(selectedVariant.price * cantidad).toLocaleString("es-CL")}
        </span>
      )}

      <span className="
  text-4xl
  font-black
  text-pink-600
">
     ${precioFinal.toLocaleString("es-CL")}
      </span>

      {tieneDescuento && (
        <span className="
  bg-gradient-to-r
  from-pink-500
  to-purple-500
  text-white
  px-3
  py-1
  rounded-full
  text-xs
  font-black
  shadow-md
">
  🔥 Oferta
</span>
      )}

    </div>
  );

})() : (
  <h2>Selecciona talla</h2>
)}

        {/* STOCK */}
        {selectedVariant && (
          <div className="mt-4">

  <div className={`
    inline-flex
    items-center
    gap-2
    px-4
    py-2
    rounded-full
    text-sm
    font-semibold
    ${
      isOutOfStock
        ? "bg-red-100 text-red-600"
        : currentStock <= 3
          ? "bg-yellow-100 text-yellow-700"
          : "bg-emerald-100 text-emerald-700"
    }
  `}>

    {isOutOfStock
      ? "❌ Sin stock"
      : currentStock <= 3
        ? `⚠️ Últimas ${currentStock} unidades`
        : `✔ ${currentStock} disponibles`}

  </div>

</div>
        )}

        {/* MENSAJE PEDIDO */}
        {isOutOfStock && (
          <p style={{
            marginTop: 10,
            color: "#ef4444",
            fontWeight: "bold"
          }}>
            ⚠️ Producto a Pedido - Solicitar por WhatsApp
          </p>
        )}

        {/* TALLAS */}
        <div style={{ marginTop: 25 }}>
          <p style={{ marginBottom: 10 }}>Talla</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[...product.product_variants]
              .sort((a, b) => {

  const orden = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",

    "Talla 0",
    "Talla 1",
    "Talla 2",
    "Talla 3",
    "Talla 4",
    "Talla 5",
    "Talla 6",
    "Talla 7",
    "Talla 8",
    "Talla 9",
    "Talla 10",
    "Talla 11",
    "Talla 12"
  ];

  return (
    orden.indexOf(a.size)
    -
    orden.indexOf(b.size)
  );

})
              .map(v => {
                const stock = v.stock || 0;
                const isActive = selected === v.id;

                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelect(v)}
                    onMouseOver={(e) => {
  if (!e.currentTarget.disabled) {
    e.currentTarget.style.transform = "scale(1.05)";
  }
}}
onMouseOut={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
                    className={`
  px-5
  py-3
  rounded-2xl
  font-semibold
  transition-all
  duration-300
  border
  ${
    isActive
      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-105"
      : "bg-white border-pink-100 hover:border-pink-300 hover:shadow-md"
  }
  ${
    stock === 0
      ? "opacity-40 cursor-not-allowed"
      : ""
  }
`}
                  >
                    {v.size}
                  </button>
                );
              })}
          </div>
        </div>

        {/* CANTIDAD */}
        <div style={{ marginTop: 25 }}>
          <p style={{ marginBottom: 10 }}>Cantidad</p>

          <div className="
  flex
  items-center
  gap-4
">
            <button 
              onClick={decreaseQty} 
              style={btnQty}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                }}
              >
              -
            </button>
            
            <span style={{ fontSize: 18 }}>
            {qty}
            </span>
            
            <button 
              onClick={increaseQty} 
              style={btnQty}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                }}
              >
              +
            </button>
            
          </div>
        </div>

        {/* BOTONES */}
        <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
          <button
            onClick={addToCart}
            onMouseOver={(e) => {
  if (!e.currentTarget.disabled) {
    e.currentTarget.style.transform = "scale(1.05)";
  }
}}
onMouseOut={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            disabled={!selectedVariant || isOutOfStock}
            className={`
  flex-1
  py-4
  rounded-2xl
  font-bold
  text-white
  transition-all
  duration-300
  shadow-xl
  hover:scale-[1.02]
  active:scale-[0.98]
  ${
    (!selectedVariant || isOutOfStock)
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-gradient-to-r from-gray-800 to-black"
  }
`}
          >
            🛒 Agregar
          </button>

          <button
            onClick={() => {
              addToCart();
              window.location.href = "/checkout";
            }}
            onMouseOver={(e) => {
  if (!e.currentTarget.disabled) {
    e.currentTarget.style.transform = "scale(1.05)";
  }
}}
onMouseOut={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            disabled={!selectedVariant || isOutOfStock}
            className={`
  flex-1
  py-4
  rounded-2xl
  font-bold
  text-white
  transition-all
  duration-300
  shadow-xl
  hover:scale-[1.02]
  active:scale-[0.98]
  ${
    (!selectedVariant || isOutOfStock)
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-gradient-to-r from-emerald-500 to-green-500"
  }
`}
          >
            ⚡ Comprar
          </button>
        </div>

        {/* WHATSAPP */}
        {isOutOfStock && (
          <a
            href={`${WHATSAPP}?text=${encodeURIComponent(
              `Hola, quiero consultar por:\n${product.name}\nTalla: ${selectedVariant?.size}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseOver={(e) => {
  if (!e.currentTarget.disabled) {
    e.currentTarget.style.transform = "scale(1.05)";
  }
}}
onMouseOut={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            className="
  block
  mt-5
  bg-gradient-to-r
  from-green-500
  to-emerald-500
  text-white
  py-4
  rounded-2xl
  text-center
  font-bold
  shadow-xl
  transition-all
  duration-300
  hover:scale-[1.02]
"
          >
            💬 Solicitar por WhatsApp
          </a>
        )}

      </div>
    </div>

  </div>

{showModal && (
<div
  onClick={() => {
    setShowModal(false);
  }}

  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}

  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.92), rgba(0,0,0,0.98))",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    transition: "all 0.3s ease",
    cursor: "pointer"
  }}
>
  
{/* BOTÓN CERRAR */}
<div
  onClick={(e) => {
    e.stopPropagation();
    setShowModal(false);
  }}

  onTouchStart={(e) => e.stopPropagation()}
onTouchEnd={(e) => e.stopPropagation()}
  
  className="
    absolute
    top-5
    right-5
    w-12
    h-12
    rounded-full
    bg-white/10
    backdrop-blur-lg
    text-white
    text-2xl
    flex
    items-center
    justify-center
    hover:bg-white/20
    transition-all
    duration-300
    cursor-pointer
  "
>
  ✕
</div>

    {/* IMAGEN */}
  {/* ⬅ ANTERIOR */}
<button
  onClick={(e) => {
    e.stopPropagation();
    prevImage();
  }}

  onTouchStart={(e) => e.stopPropagation()}
onTouchEnd={(e) => e.stopPropagation()}
  
  className="
    hidden
    md:flex
    absolute
    left-6
    top-1/2
    -translate-y-1/2

    w-14
    h-14

    items-center
    justify-center

    rounded-full

    bg-white/10
    backdrop-blur-2xl

    border
    border-white/10

    text-white
    text-5xl
    font-light

    shadow-[0_8px_30px_rgba(0,0,0,0.25)]

    hover:bg-white/20
    hover:scale-110

    transition-all
    duration-300
  "
>
  ‹
</button>

{/* ➡ SIGUIENTE */}
<button
  onClick={(e) => {
    e.stopPropagation();
    nextImage();
  }}

onTouchStart={(e) => e.stopPropagation()}
onTouchEnd={(e) => e.stopPropagation()}
  
  className="
    hidden
    md:flex
    absolute
    right-6
    top-1/2
    -translate-y-1/2

    w-14
    h-14

    items-center
    justify-center

    rounded-full

    bg-white/10
    backdrop-blur-2xl

    border
    border-white/10

    text-white
    text-5xl
    font-light

    shadow-[0_8px_30px_rgba(0,0,0,0.25)]

    hover:bg-white/20
    hover:scale-110

    transition-all
    duration-300
  "
>
  ›
</button>
    <img
  src={`${product.product_images?.[currentIndex]?.url}?width=1200&quality=80`}
      alt={product.name}
      onClick={(e) => {
  e.stopPropagation();
}}
      
      className="
    animate-[fadeZoom_.3s_ease]
  "
  style={{
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: 12
  }}
/>
  <div
  style={{
    position: "absolute",
    bottom: 30,
    display: "flex",
    gap: 8
  }}
>
  {product.product_images.map((_, i) => (
    <div
      key={i}
      onClick={(e) => {
        e.stopPropagation();
        setCurrentIndex(i);
      }}
      style={{
        width: i === currentIndex ? 14 : 10,
        height: i === currentIndex ? 14 : 10,
        transform: i === currentIndex ? "scale(1.2)" : "scale(1)",
        borderRadius: "50%",
        background: i === currentIndex ? "#fff" : "#777",
        cursor: "pointer",
        transition: "0.2s"
      }}
    />
  ))}
</div>

  </div>
)}

    <style>
{`
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeZoom {
  from {
    opacity: 0;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeImage {
  from {
    opacity: 0;
    transform: scale(1.02);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

`}
</style>
    
  </>
);
}

/* BOTONES CANTIDAD */
const btnQty = {
  width: 48,
  height: 48,
  borderRadius: 16,
  border: "1px solid #fbcfe8",
  background: "white",
  fontSize: 20,
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.2s",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

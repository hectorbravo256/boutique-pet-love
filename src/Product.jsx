import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";

const WHATSAPP = "https://wa.me/56982700002";

export default function Product() {
  const { id } = useParams();

  const [stockDB, setStockDB] = useState([]);
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const stockMap = Object.fromEntries(
    stockDB.map(s => [`${s.product_id}-${s.size}`, s.stock])
  );

  /* ================= SELECT TALLA ================= */
  const handleSelect = (variant) => {
    setSelected(variant.id);
    setSelectedVariant(variant);
    setQty(1);
  };

  /* ================= CANTIDAD ================= */
  const increaseQty = () => {
    if (!selectedVariant) return;

    const stock = stockMap[`${product.id}-${selectedVariant.size}`] || 0;

    if (qty < stock) setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  /* ================= STOCK ================= */
  const currentStock = selectedVariant
    ? stockMap[`${product.id}-${selectedVariant.size}`] || 0
    : 0;

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

    // 🔥 LÓGICA DESCUENTO (IGUAL QUE PRODUCTO)
const ahora = new Date();

const inicio = product.discount_start
  ? new Date(product.discount_start)
  : null;

const fin = product.discount_end
  ? new Date(product.discount_end)
  : null;

const dentroDeFecha =
  (!inicio || ahora >= inicio) &&
  (!fin || ahora <= fin);

const tieneDescuento =
  product.discount_active &&
  product.discount_percent > 0 &&
  dentroDeFecha;

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
    const stock = stockMap[`${product.id}-${size}`] || 0;

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
      i => i.id === product.id && i.size === size
    );

    if (existingIndex !== -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
  id: product.id,
  name: product.name,
  size,
  price: precioFinal, // 🔥 precio con descuento
  originalPrice: variant.price, // 💰 precio original
  discount: tieneDescuento ? product.discount_percent : 0,
  qty,
  image: product.product_images?.[0]?.url + "?width=400&quality=70"
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
  if (!touchStartX || !touchEndX) return;

const distance = touchStartX - touchEndX;

  // 🔥 sensibilidad (puedes ajustar)
  if (distance > 50) {
    // swipe izquierda → siguiente
    nextImage();
  }

  if (distance < -50) {
    // swipe derecha → anterior
    prevImage();
  }
};

  const nextImage = () => {
  const next = (currentIndex + 1) % product.product_images.length;
  setCurrentIndex(next);
  setActiveImage(product.product_images[next].url);
};

const prevImage = () => {
  const prev =
    (currentIndex - 1 + product.product_images.length) %
    product.product_images.length;

  setCurrentIndex(prev);
  setActiveImage(product.product_images[prev].url);
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
        .eq("id", id)
        .single();

      setProduct(data);
    };

    cargar();
  }, [id]);

  useEffect(() => {
  if (product?.product_images?.length > 0) {
    setActiveImage(product.product_images[0].url);
  }
}, [product]);

  useEffect(() => {
    const cargarStock = async () => {
      const { data } = await supabase
        .from("product_stock")
        .select("*");

      setStockDB(data || []);
    };

    cargarStock();
  }, []);

  /* ================= AUTO SELECT ================= */
  useEffect(() => {
    if (!product || stockDB.length === 0) return;

    const firstAvailable = product.product_variants.find(
      v => (stockMap[`${product.id}-${v.size}`] || 0) > 0
    );

    if (firstAvailable) {
      setSelected(firstAvailable.id);
      setSelectedVariant(firstAvailable);
    }
  }, [product, stockDB]);

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

return (
  <>
  <div className="
  max-w-7xl
  mx-auto
  px-4
  md:px-8
  py-8
  pb-36
  md:pb-8
">

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
    src={`${activeImage}?width=800&quality=70`}
    loading="lazy"
    onLoad={(e) => e.target.classList.remove("opacity-0")}
    
    onClick={() => {
      const index = product.product_images.findIndex(
        img => img.url === activeImage
      );
      setCurrentIndex(index);
      setShowModal(true);
    }}
    className="
  opacity-0
  transition-all
  duration-700
  w-full
  rounded-3xl
  shadow-2xl
  object-cover
  hover:scale-[1.02]
"
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
  <div style={{
    display: "flex",
    gap: 10,
    marginTop: 15
  }}>
    {product.product_images?.map((img, i) => (
      <img
  key={i}
  src={`${img.url}?width=200&quality=60`}
  loading="lazy"
  onLoad={(e) => e.target.classList.remove("opacity-0")}
  onClick={() => {
    setActiveImage(img.url);
    setCurrentIndex(i);
  }}
  className={`
  opacity-0
  w-20
  h-20
  object-cover
  rounded-2xl
  cursor-pointer
  transition-all
  duration-300
  border-2
  hover:scale-105
  ${
    activeImage === img.url
      ? "border-pink-500 shadow-xl scale-105"
      : "border-transparent opacity-80 hover:opacity-100"
  }
`}
/>
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
              .sort((a, b) =>
                parseInt(a.size.match(/\d+/)) -
                parseInt(b.size.match(/\d+/))
              )
              .map(v => {
                const stock = stockMap[`${product.id}-${v.size}`] || 0;
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
  onClick={(e) => {
  if (e.target.tagName === "IMG") {
    nextImage();
  }
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
    background: "rgba(0,0,0,0.85)",
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
  className="
    absolute
    left-5
    top-1/2
    -translate-y-1/2
    w-14
    h-14
    rounded-full
    bg-white/10
    backdrop-blur-lg
    text-white
    text-2xl
    hover:bg-white/20
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
  className="
    absolute
    right-5
    top-1/2
    -translate-y-1/2
    w-14
    h-14
    rounded-full
    bg-white/10
    backdrop-blur-lg
    text-white
    text-2xl
    hover:bg-white/20
    transition-all
    duration-300
  "
>
  ›
</button>
    <img
  src={`${product.product_images[currentIndex].url}?width=1200&quality=80`}
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
        setActiveImage(product.product_images[i].url);
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

    {/* 🔥 STICKY MOBILE CTA */}
{!showModal && (
<div className="
  fixed
  bottom-0
  left-0
  right-0
  z-50
  bg-white/95
  backdrop-blur-xl
  border-t
  border-pink-100
  p-4 
  pb-[calc(1rem+env(safe-area-inset-bottom))]
  shadow-2xl
  md:hidden
  animate-[slideUp_.35s_ease]
  relative

  before:absolute
  before:top-0
  before:left-0
  before:right-0
  before:h-px
  before:bg-gradient-to-r
  before:from-transparent
  before:via-pink-200
  before:to-transparent
">

  <div className="
    flex
    items-center
    justify-between
    gap-3
  ">

    {/* 💰 PRECIO */}
    <div>

      {selectedVariant && (
        <>
          <p className="
            text-xs
            text-gray-400
          ">
            Total
          </p>

          <p className="
            text-2xl
            font-black
            text-pink-600
          ">
            $
            {(
              (
                tieneDescuento
                  ? Math.round(
                      selectedVariant.price *
                      (1 - product.discount_percent / 100)
                    )
                  : selectedVariant.price
              ) * qty
            ).toLocaleString("es-CL")}
          </p>
        </>
      )}

    </div>

    {/* 🔥 BOTÓN */}
    <button
      onClick={() => {
        addToCart();
      }}
      disabled={!selectedVariant || isOutOfStock}
      className={`
        flex-1
        py-4
        rounded-2xl
        font-bold
        text-white
        shadow-xl
        transition-all
        duration-300
        hover:scale-[1.02]
        active:scale-[0.98]
        ${
          (!selectedVariant || isOutOfStock)
            ? "bg-gray-300"
            : "bg-gradient-to-r from-pink-500 to-purple-500"
        }
      `}
    >
      🛒 Agregar
    </button>

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

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

  if (!product) return <p>Cargando...</p>;

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
  <div style={{
    maxWidth: 1100,
    margin: "0 auto",
    padding: 20
  }}>

    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 40
    }}>

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
    className="opacity-0 transition-opacity duration-500"
    onClick={() => {
      const index = product.product_images.findIndex(
        img => img.url === activeImage
      );
      setCurrentIndex(index);
      setShowModal(true);
    }}
    style={{
      width: "100%",
      borderRadius: 16,
      cursor: "zoom-in"
    }}
  />

  {/* 🔥 BADGE DESCUENTO */}
  {tieneDescuento && product.discount_percent > 0 && (
    <div style={{
      position: "absolute",
      top: 10,
      right: 10,
      background: "#ec4899",
      color: "#fff",
      padding: "6px 10px",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: "bold"
    }}>
      -{product.discount_percent}%
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
  className="opacity-0 transition-opacity duration-300"
  onClick={() => {
    setActiveImage(img.url);
    setCurrentIndex(i);
  }}
  style={{
    width: 70,
    height: 70,
    objectFit: "cover",
    borderRadius: 10,
    cursor: "pointer",
    border: activeImage === img.url
      ? "2px solid #ec4899"
      : "1px solid #ddd",
    transition: "0.2s"
  }}
/>
    ))}
  </div>

</div>
      </div>

      {/* ================= INFO ================= */}
      <div>

        {/* NOMBRE */}
        <h1 style={{
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 10
        }}>
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
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

      {tieneDescuento && (
        <span style={{
          textDecoration: "line-through",
          color: "#999",
          fontSize: 18
        }}>
          ${(selectedVariant.price * cantidad).toLocaleString("es-CL")}
        </span>
      )}

      <span style={{
        fontSize: 28,
        fontWeight: "bold",
        color: tieneDescuento ? "#ec4899" : "#000"
      }}>
     ${precioFinal.toLocaleString("es-CL")}
      </span>

      {tieneDescuento && (
        <span style={{
          background: "#ec4899",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: "bold"
        }}>
          Oferta
        </span>
      )}

    </div>
  );

})() : (
  <h2>Selecciona talla</h2>
)}

        {/* STOCK */}
        {selectedVariant && (
          <p style={{
            marginTop: 5,
            fontWeight: "bold",
            color: isOutOfStock ? "#ef4444" : "#22c55e"
          }}>
            {isOutOfStock
              ? "❌ Sin stock"
              : currentStock <= 3
                ? `⚠️ Últimas ${currentStock} unidades`
                : `✔ Stock disponible: ${currentStock}`}
          </p>
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
                    style={{
                      padding: "10px 16px",
                      borderRadius: 25,
                      border: isActive ? "2px solid #ec4899" : "1px solid #ddd",
                      background: isActive ? "#ec4899" : "white",
                      color: isActive ? "white" : "#333",
                      opacity: stock === 0 ? 0.5 : 1,
                      transition: "0.2s",
                      transform: "scale(1)"
                    }}
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

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={decreaseQty} style={btnQty}>-</button>
            <span style={{ fontSize: 18 }}>{qty}</span>
            <button onClick={increaseQty} style={btnQty}>+</button>
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
            style={{
              flex: 1,
              padding: 14,
              background: (!selectedVariant || isOutOfStock) ? "#ccc" : "#ec4899",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: "scale(1)"
            }}
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
            style={{
              flex: 1,
              padding: 14,
              background: (!selectedVariant || isOutOfStock) ? "#ccc" : "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: "scale(1)"
          }}
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
            style={{
              display: "block",
              marginTop: 15,
              background: "#22c55e",
              color: "white",
              padding: 14,
              borderRadius: 12,
              textAlign: "center",
              fontWeight: "bold",
              textDecoration: "none",
              transition: "all 0.2s ease",
              transform: "scale(1)"
            }}
          >
            💬 Solicitar por WhatsApp
          </a>
        )}

      </div>
    </div>

    {/* RESPONSIVE */}
    <style>
      {`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}
    </style>

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
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    cursor: "pointer"
  }}
>

    {/* BOTÓN CERRAR */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowModal(false);
      }}
      style={{
        position: "absolute",
        top: 20,
        right: 30,
        color: "white",
        fontSize: 30,
        cursor: "pointer"
      }}
    >
      ✕
    </div>

    {/* IMAGEN */}
    <img
  src={`${product.product_images[currentIndex].url}?width=1200&quality=80`}
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
  </>
);
}

/* BOTONES CANTIDAD */
const btnQty = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "white"
};

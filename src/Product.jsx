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
      alert("Selecciona una talla");
      return;
    }

    const variant = product.product_variants.find(
      v => v.id == selected
    );

    if (!variant) {
      alert("Error seleccionando talla");
      return;
    }

    const size = variant.size;
    const stock = stockMap[`${product.id}-${size}`] || 0;

    if (stock === 0) {
      alert("⚠️ Sin stock disponible");
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
        price: variant.price,
        qty,
        image: product.product_images?.[0]?.url
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
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

  return (
    <div style={{
      maxWidth: 500,
      margin: "0 auto",
      padding: 20
    }}>

      {/* IMAGEN */}
      <img
        src={product.product_images?.[0]?.url}
        style={{
          width: "100%",
          borderRadius: 12,
          marginBottom: 20
        }}
      />

      {/* NOMBRE */}
      <h1 style={{ fontSize: 22, fontWeight: "bold" }}>
        {product.name}
      </h1>

      {/* PRECIO */}
      <h2 style={{
        fontSize: 24,
        color: "#ec4899",
        marginTop: 10
      }}>
        {selectedVariant
          ? `$${selectedVariant.price.toLocaleString("es-CL")}`
          : "Selecciona talla"}
      </h2>

      {/* STOCK */}
      {selectedVariant && (
        <p style={{
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
      <div style={{ marginTop: 20 }}>
        <p>Talla</p>

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
                  style={{
                    padding: "10px 14px",
                    borderRadius: 20,
                    border: isActive ? "2px solid #ec4899" : "1px solid #ddd",
                    background: isActive ? "#ec4899" : "white",
                    color: isActive ? "white" : "#333",
                    opacity: stock === 0 ? 0.5 : 1
                  }}
                >
                  {v.size}
                </button>
              );
            })}
        </div>
      </div>

      {/* CANTIDAD */}
      <div style={{ marginTop: 20 }}>
        <p>Cantidad</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={decreaseQty} style={btnQty}>-</button>
          <span>{qty}</span>
          <button onClick={increaseQty} style={btnQty}>+</button>
        </div>
      </div>

      {/* BOTONES */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={addToCart}
          disabled={!selectedVariant || isOutOfStock}
          style={{
            flex: 1,
            padding: 12,
            background: (!selectedVariant || isOutOfStock) ? "#ccc" : "#ec4899",
            color: "#fff",
            border: "none",
            borderRadius: 10
          }}
        >
          🛒 Agregar
        </button>

        <button
          onClick={() => {
            addToCart();
            window.location.href = "/checkout";
          }}
          disabled={!selectedVariant || isOutOfStock}
          style={{
            flex: 1,
            padding: 12,
            background: (!selectedVariant || isOutOfStock) ? "#ccc" : "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 10
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
          style={{
            display: "block",
            marginTop: 15,
            background: "#22c55e",
            color: "white",
            padding: 12,
            borderRadius: 10,
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "none"
          }}
        >
          💬 Solicitar por WhatsApp
        </a>
      )}
    </div>
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

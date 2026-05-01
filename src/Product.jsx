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
const handleSelect = (variant) => {
  setSelected(variant.id);
  setSelectedVariant(variant);
  setQty(1); // 🔥 importante
};
  const increaseQty = () => {
  if (!selectedVariant) return;

  const stock = stockMap[`${product.id}-${selectedVariant.size}`] || 0;

  if (qty < stock) {
    setQty(qty + 1);
  }
};

const decreaseQty = () => {
  if (qty > 1) {
    setQty(qty - 1);
  }
};
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
      qty: qty,
      image: product.product_images?.[0]?.url
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));

  console.log("Producto agregado");
};

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

  useEffect(() => {
  if (product?.product_variants?.length > 0) {
    const firstAvailable = product.product_variants.find(
      v => (stockMap[`${product.id}-${v.size}`] || 0) > 0
    );

    if (firstAvailable) {
      setSelected(firstAvailable.id);
    }
  }
}, [product, stockDB]);

  if (!product) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 30 }}>

      <img
        src={product.product_images?.[0]?.url}
        style={{ width: 300, borderRadius: 12 }}
      />

      <h1>{product.name}</h1>

      <h2 style={{ marginTop: 10, color: "#ec4899" }}>
  {selectedVariant
    ? `$${selectedVariant.price.toLocaleString("es-CL")}`
    : "Selecciona una talla"}
        <p style={{
  marginTop: 5,
  fontWeight: "bold",
  color:
    !selectedVariant
      ? "#999"
      : (stockMap[`${product.id}-${selectedVariant.size}`] || 0) > 0
        ? "#22c55e"
        : "#ef4444"
}}>
  {!selectedVariant
  ? "Selecciona una talla"
  : (stockMap[`${product.id}-${selectedVariant.size}`] || 0) === 0
    ? "❌ Sin stock"
    : (stockMap[`${product.id}-${selectedVariant.size}`] || 0) <= 3
      ? `⚠️ Últimas ${stockMap[`${product.id}-${selectedVariant.size}`]} unidades`
      : `✔ Stock disponible: ${stockMap[`${product.id}-${selectedVariant.size}`]}`}
</p>
</h2>

      <div style={{ marginTop: 20 }}>
  <p style={{ marginBottom: 10 }}>Cantidad</p>

  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 10
  }}>
    
    <button
      onClick={decreaseQty}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        border: "1px solid #ddd"
      }}
    >
      -
    </button>

    <span style={{ fontSize: 18, minWidth: 20, textAlign: "center" }}>
      {qty}
    </span>

    <button
      onClick={increaseQty}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        border: "1px solid #ddd"
      }}
    >
      +
    </button>

  </div>
</div>
      
      {/* TALLAS ORDENADAS */}
<div style={{ marginTop: 20 }}>
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
            disabled={stock === 0}
            style={{
              padding: "10px 16px",
              borderRadius: 20,
              border: isActive ? "2px solid #ec4899" : "1px solid #ddd",
              background: isActive ? "#ec4899" : "white",
              color: isActive ? "white" : "#333",
              cursor: stock === 0 ? "not-allowed" : "pointer",
              opacity: stock === 0 ? 0.4 : 1
            }}
          >
            {v.size}
          </button>
        );
      })}
  </div>
</div>

      <div style={{ marginTop: 20 }}>

<button
  onClick={addToCart}
  style={{
    padding: "10px 20px",
    marginRight: 10,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8
  }}
>
  🛒 Agregar al carrito
</button>

        <button
  onClick={() => {
    addToCart();
    window.location.href = "/checkout";
  }}
  style={{
    padding: "10px 20px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 8
  }}
>
  ⚡ Comprar ahora
</button>

      </div>

      {/* WHATSAPP */}
<a
  href={`${WHATSAPP}?text=${encodeURIComponent(
    `Hola, quiero consultar por:\n${product.name}\nTalla: ${selected || "No seleccionada"}`
  )}`}
  target="_blank"
  style={{
    display: "block",
    marginTop: 20,
    color: "green",
    fontWeight: "bold"
  }}
>
  💬 Consultar por WhatsApp
</a>

    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Product() {
  const { id } = useParams();
  const [stockDB, setStockDB] = useState([]);
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const stockMap = Object.fromEntries(
  stockDB.map(s => [`${s.product_id}-${s.size}`, s.stock])
);

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
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      size,
      price: variant.price,
      qty: 1,
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

      {/* TALLAS ORDENADAS */}
      <select
        onChange={(e) => setSelected(e.target.value)}
        style={{ padding: 10, marginTop: 10 }}
      >
        <option>Selecciona talla</option>

        {[...product.product_variants]
          .sort((a, b) =>
            parseInt(a.size.match(/\d+/)) -
            parseInt(b.size.match(/\d+/))
          )
          .map(v => (
<option key={v.id} value={v.id}>
  {v.size} - ${v.price} 
  ({stockMap[`${product.id}-${v.size}`] || 0} disponibles)
</option>
          ))}
      </select>

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
        href={`https://wa.me/569XXXXXXXX?text=${encodeURIComponent(
  `Hola, quiero el producto:\n${product.name}\nTalla: ${selected || "No seleccionada"}`
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

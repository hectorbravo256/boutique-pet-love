import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Product() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);

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
            </option>
          ))}
      </select>

      <div style={{ marginTop: 20 }}>

        <button style={{
          padding: "10px 20px",
          marginRight: 10,
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: 8
        }}>
          🛒 Agregar al carrito
        </button>

        <button style={{
          padding: "10px 20px",
          background: "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: 8
        }}>
          ⚡ Comprar ahora
        </button>

      </div>

      {/* WHATSAPP */}
      <a
        href={`https://wa.me/569XXXXXXXX?text=Hola quiero ${product.name}`}
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

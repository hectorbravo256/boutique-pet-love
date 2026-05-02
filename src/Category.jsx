import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (*)
        `)
        .eq("category", slug)
        .eq("active", true);

      if (!error) {
        setProducts(data || []);
      }
    };

    cargar();
  }, [slug]);

  return (
    <div style={{ padding: 30 }}>

      <h2 style={{ marginBottom: 20 }}>
        Categoría: {slug}
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20
      }}>
        {products.map(p => (
          <div
            key={p.id}
            onClick={() => navigate(`/producto/${p.id}`)}
            style={{
              cursor: "pointer",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
<img
  src={
    p.product_images?.[0]?.url
      ? `${p.product_images[0].url}?width=600&quality=70`
      : "/placeholder.png"
  }
  loading="lazy"
  onLoad={(e) => e.target.classList.remove("opacity-0")}
  className="opacity-0 transition-opacity duration-500"
  style={{
    width: "100%",
    height: 200,
    objectFit: "cover"
  }}
/>

            <div style={{ padding: 10 }}>
              <strong>{p.name}</strong>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

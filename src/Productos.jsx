import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Productos() {
  const [productosFull, setProductosFull] = useState([]);

  const cargar = async () => {
    const { data } = await supabase
      .from("products")
      .select(`*, product_variants(*), product_images(*)`);

    setProductosFull(data || []);
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div>
      <h1>🛒 Productos</h1>

      {productosFull.map(p => (
        <div key={p.id}>
          <input
            value={p.name}
            onChange={async (e) => {
              const value = e.target.value;

              setProductosFull(prev =>
                prev.map(prod =>
                  prod.id === p.id ? { ...prod, name: value } : prod
                )
              );

              await supabase.from("products").update({ name: value }).eq("id", p.id);
            }}
          />
        </div>
      ))}
    </div>
  );
}

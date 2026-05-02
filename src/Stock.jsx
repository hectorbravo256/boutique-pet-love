import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [productos, setProductos] = useState({});
  const [stockTemp, setStockTemp] = useState({});

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("product_stock").select("*");
      setStock(data || []);
    };
    cargar();
  }, []);

  useEffect(() => {
    const cargarProductos = async () => {
      const { data } = await supabase.from("products").select("id, name");
      const map = {};
      data?.forEach(p => (map[p.id] = p.name));
      setProductos(map);
    };
    cargarProductos();
  }, []);

  const actualizarStock = async (id, nuevoStock) => {
    await supabase.from("product_stock").update({ stock: nuevoStock }).eq("id", id);

    setStock(prev =>
      prev.map(s => (s.id === id ? { ...s, stock: nuevoStock } : s))
    );
  };

  return (
    <div>
      <h1>📦 Gestión de Stock</h1>

      {stock.map(item => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          {productos[item.product_id]} - {item.size}

          <input
            type="number"
            value={item.stock}
            onChange={(e) =>
              actualizarStock(item.id, parseInt(e.target.value))
            }
          />
        </div>
      ))}
    </div>
  );
}

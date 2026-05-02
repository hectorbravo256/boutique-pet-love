import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [productos, setProductos] = useState({});
  const [stockTemp, setStockTemp] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarStock();
    cargarProductos();
  }, []);

  const cargarStock = async () => {
    const { data } = await supabase.from("product_stock").select("*");
    setStock(data || []);
  };

  const cargarProductos = async () => {
    const { data } = await supabase.from("products").select("id, name");
    const map = {};
    data?.forEach(p => (map[p.id] = p.name));
    setProductos(map);
  };

  const guardarCambios = async () => {
    setLoading(true);

    const updates = Object.entries(stockTemp).map(([id, stock]) => ({
      id: Number(id),
      stock
    }));

    await Promise.all(
      updates.map(u =>
        supabase.from("product_stock").update({ stock: u.stock }).eq("id", u.id)
      )
    );

    setStock(prev =>
      prev.map(item => {
        const nuevo = updates.find(u => u.id === item.id);
        return nuevo ? { ...item, stock: nuevo.stock } : item;
      })
    );

    setStockTemp({});
    setLoading(false);
    alert("Stock actualizado");
  };

  return (
    <div>
      <h1>📦 Stock</h1>

      <button onClick={guardarCambios}>
        {loading ? "Guardando..." : "💾 Guardar"}
      </button>

      {stock.map(item => (
        <div key={item.id}>
          {productos[item.product_id]} - {item.size}

          <input
            type="number"
            value={stockTemp[item.id] ?? item.stock}
            onChange={(e) =>
              setStockTemp(prev => ({
                ...prev,
                [item.id]: parseInt(e.target.value)
              }))
            }
          />
        </div>
      ))}
    </div>
  );
}

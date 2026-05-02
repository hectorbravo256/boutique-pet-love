import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Stock() {

  const [stock, setStock] = useState([]);
  const [productos, setProductos] = useState({});
  const [stockTemp, setStockTemp] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 🔄 Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name");

      const map = {};
      data?.forEach((p) => {
        map[p.id] = p.name;
      });

      setProductos(map);
    };

    cargarProductos();
  }, []);

  // 🔄 Cargar stock
  useEffect(() => {
    const cargarStock = async () => {
      const { data } = await supabase
        .from("product_stock")
        .select("*");

      setStock(data || []);
    };

    cargarStock();
  }, []);

  // 🔥 actualizar stock individual
  const actualizarStock = async (id, nuevoStock) => {
    const { error } = await supabase
      .from("product_stock")
      .update({ stock: nuevoStock })
      .eq("id", id);

    if (error) return;

    setStock((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, stock: nuevoStock } : s
      )
    );

    setStockTemp((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  // 💾 guardar todos
  const guardarCambios = async () => {
    try {
      setLoading(true);

      const updates = Object.entries(stockTemp).map(([id, stock]) => ({
        id: Number(id),
        stock,
      }));

      if (!updates.length) return;

      const results = await Promise.all(
        updates.map((u) =>
          supabase
            .from("product_stock")
            .update({ stock: u.stock })
            .eq("id", u.id)
        )
      );

      const hasError = results.some((r) => r.error);
      if (hasError) return;

      setStock((prev) =>
        prev.map((item) => {
          const nuevo = updates.find((u) => u.id === item.id);
          return nuevo ? { ...item, stock: nuevo.stock } : item;
        })
      );

      setStockTemp({});
      alert("✅ Stock actualizado");

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 ordenar + filtrar
  const stockOrdenado = [...stock].sort((a, b) =>
    (productos[a.product_id] || "").localeCompare(productos[b.product_id] || "") ||
    a.size.localeCompare(b.size, undefined, { numeric: true })
  );

  const stockFiltrado = stockOrdenado.filter((item) =>
    (productos[item.product_id] || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🎯 animación botones (igual que original)
  const hoverAnim = {
    onMouseEnter: (e, shadow) => {
      e.currentTarget.style.transform = "scale(1.08)";
      e.currentTarget.style.boxShadow = shadow;
    },
    onMouseLeave: (e, shadow) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = shadow;
    },
    onMouseDown: (e) => {
      e.currentTarget.style.transform = "scale(0.95)";
    },
    onMouseUp: (e, shadow) => {
      e.currentTarget.style.transform = "scale(1.08)";
      e.currentTarget.style.boxShadow = shadow;
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>📦 Gestión de Stock</h1>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="🔍 Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
          borderRadius: 8,
          border: "1px solid #ddd",
          textAlign: "center",
          fontSize: 16,
          fontWeight: "bold"
        }}
      />

      {/* 💾 BOTÓN GUARDAR */}
      <button
        disabled={loading}
        onClick={guardarCambios}
        style={{
          marginBottom: 15,
          background: "#2563eb",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {loading ? "⏳ Guardando..." : "💾 Guardar todos los cambios"}
      </button>

      {/* ⚠️ cambios pendientes */}
      {Object.keys(stockTemp).length > 0 && (
        <p style={{
          color: "#f59e0b",
          fontWeight: "bold"
        }}>
          ⚠️ Cambios sin guardar ({Object.keys(stockTemp).length})
        </p>
      )}

      {/* 📊 TABLA */}
      <table style={{
        width: "100%",
        borderCollapse: "collapse"
      }}>
        <thead>
          <tr style={{ background: "#fce7f3" }}>
            <th>Producto</th>
            <th>Talla</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {stockFiltrado.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>

              <td>{productos[item.product_id]}</td>
              <td>{item.size}</td>

              <td style={{ textAlign: "center" }}>
                <input
                  type="number"
                  value={stockTemp[item.id] ?? item.stock}
                  onChange={(e) =>
                    setStockTemp((prev) => ({
                      ...prev,
                      [item.id]: Math.max(parseInt(e.target.value) || 0, 0),
                    }))
                  }
                  style={{
                    width: 60,
                    padding: 6,
                    fontWeight: "bold"
                  }}
                />
              </td>

              <td style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>

                  {/* + */}
                  <button
                    onClick={() =>
                      actualizarStock(item.id, (stockTemp[item.id] ?? item.stock) + 1)
                    }
                    {...hoverAnim}
                    onMouseEnter={(e) => hoverAnim.onMouseEnter(e, "0 8px 20px rgba(34,197,94,0.4)")}
                    onMouseLeave={(e) => hoverAnim.onMouseLeave(e, "0 4px 12px rgba(34,197,94,0.3)")}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>

                  {/* - */}
                  <button
                    onClick={() =>
                      actualizarStock(item.id, Math.max((stockTemp[item.id] ?? item.stock) - 1, 0))
                    }
                    {...hoverAnim}
                    onMouseEnter={(e) => hoverAnim.onMouseEnter(e, "0 8px 20px rgba(239,68,68,0.4)")}
                    onMouseLeave={(e) => hoverAnim.onMouseLeave(e, "0 4px 12px rgba(239,68,68,0.3)")}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    −
                  </button>

                  {/* guardar */}
                  <button
                    onClick={() =>
                      actualizarStock(item.id, stockTemp[item.id] ?? item.stock)
                    }
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    💾
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

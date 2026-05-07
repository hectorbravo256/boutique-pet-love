import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Stock() {

  const [stock, setStock] = useState([]);
  const [productos, setProductos] = useState({});
  const [stockTemp, setStockTemp] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] =
  useState("Todas");

const [tallasSeleccionadas,
  setTallasSeleccionadas] =
  useState({});

  // 🔄 Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, category");

      const map = {};

data?.forEach((p) => {
  map[p.id] = {
    name: p.name,
    category: p.category
  };
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

      setStock(
  Array.isArray(data) ? data : []
);
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

      const updates = Object.entries(
  stockTemp || {}
).map(([id, stock]) => ({
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
          const nuevo = updates.find(
  (u) => u.id === item.id
);
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
const productosAgrupados = Object.values(

  stock.reduce((acc, item) => {

    if (!acc[item.product_id]) {

      acc[item.product_id] = {
        product_id: item.product_id,
        variants: []
      };

    }

    acc[item.product_id]
      .variants.push(item);

    return acc;

  }, {})

);

const productosFiltrados =
  productosAgrupados.filter(prod => {

    const info =
      productos[prod.product_id];

    if (!info) return false;

    const coincideBusqueda =
      info.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const coincideCategoria =
      categoria === "Todas"
      || info.category === categoria;

    return (
      coincideBusqueda &&
      coincideCategoria
    );

  });

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
    <div style={{
  padding: 30,

  background:
    "linear-gradient(to bottom,#fff,#fff7fb)",

  minHeight: "100vh"
}}>

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

      <select
  value={categoria}
  onChange={(e) =>
    setCategoria(e.target.value)
  }
  style={{
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid #eee",
    marginBottom: 20,
    fontWeight: "600",
    fontSize: 15,
    background: "#fff",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.04)"
  }}
>

  <option>
    Todas
  </option>

  {[...new Set(
    Object.values(productos)
      .map(p => p.category)
      .filter(Boolean)
  )].map(cat => (
    <option
      key={cat}
      value={cat}
    >
      {cat}
    </option>
  ))}

</select>

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

  borderCollapse: "separate",
  borderSpacing: "0 10px",

  background: "transparent",

  overflow: "hidden",
  borderRadius: 24
}}>
        <thead>
          <tr style={{
  background:
    "linear-gradient(90deg,#fff1f2,#fdf2f8)",

  position: "sticky",
  top: 0,

  zIndex: 10,

  backdropFilter: "blur(12px)"
}}>
            <th>Producto</th>
            <th>Talla</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productosFiltrados.map((prod) => {

  const info =
    productos[prod.product_id];

  const tallaActual =
    tallasSeleccionadas[
      prod.product_id
    ]
    || prod.variants[0];

  return (

<tr
  key={prod.product_id}
  style={{
  borderBottom:
    "1px solid #f3f4f6",

  transition: "all .25s ease",

  background:
    "rgba(255,255,255,0.75)",

  backdropFilter:
    "blur(10px)"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background =
    "#fff";

  e.currentTarget.style.transform =
    "scale(1.003)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.background =
    "rgba(255,255,255,0.75)";

  e.currentTarget.style.transform =
    "scale(1)";
}}
  
>
        

              <td>

  <div
    style={{
      fontWeight: "700",
      color: "#111827"
    }}
  >
    {info?.name}
  </div>

  <div
    style={{
      fontSize: 12,
      color: "#9ca3af",
      marginTop: 4
    }}
  >
    {info?.category}
  </div>

</td>
<td>
  <select
    value={tallaActual.id}

    onChange={(e) => {

      const nueva =
        prod.variants.find(
          v =>
            v.id ===
            Number(e.target.value)
        );

      setTallasSeleccionadas(
        prev => ({
          ...prev,
          [prod.product_id]:
            nueva
        })
      );

    }}

    style={{
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #eee",
      background: "#fff",
      fontWeight: "600"
    }}
  >

    {prod.variants.map(v => (

      <option
        key={v.id}
        value={v.id}
      >
        {v.size}
      </option>

    ))}

  </select>
</td>

    

              <td style={{ textAlign: "center" }}>
                <input
                  type="number"
                  value={stockTemp[tallaActual.id] ?? tallaActual.stock}
                  onChange={(e) =>
                    setStockTemp((prev) => ({
                      ...prev,
                      [tallaActual.id]: Math.max(parseInt(e.target.value) || 0, 0),
                    }))
                  }
                  style={{
  width: 80,

  padding: "10px 12px",

  borderRadius: 12,

  border: "1px solid #e5e7eb",

  textAlign: "center",

  fontWeight: "700",

  fontSize: 15,

  background: "#fff",

  boxShadow:
    "0 4px 12px rgba(0,0,0,0.04)"
}}
                />

                <div
  style={{
    marginTop: 6
  }}
>

  {tallaActual.stock <= 0 ? (

    <span style={{
      color: "#ef4444",
      fontSize: 12,
      fontWeight: "700"
    }}>
      ● Agotado
    </span>

  ) : tallaActual.stock <= 3 ? (

    <span style={{
      color: "#f59e0b",
      fontSize: 12,
      fontWeight: "700"
    }}>
      ● Bajo stock
    </span>

  ) : (

    <span style={{
      color: "#22c55e",
      fontSize: 12,
      fontWeight: "700"
    }}>
      ● En stock
    </span>

  )}

</div>
                
              </td>

              <td style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>

                  {/* + */}
                  <button
                    onClick={() =>
                      actualizarStock(tallaActual.id, (stockTemp[tallaActual.id] ?? tallaActual.stock) + 1)
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
                      actualizarStock(tallaActual.id, Math.max((stockTemp[tallaActual.id] ?? tallaActual.stock) - 1, 0))
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
                      actualizarStock(tallaActual.id, stockTemp[tallaActual.id] ?? tallaActual.stock)
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

  );

})}
        </tbody>
      </table>

    </div>
  );
}

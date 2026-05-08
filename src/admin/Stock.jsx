import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Stock() {

  const [stock, setStock] = useState([]);
  const [productos, setProductos] = useState({});
  const [estadoGuardado, setEstadoGuardado] = useState({});
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

    acc[item.product_id].variants.sort((a, b) => {

  const ordenTallas = {
    XXS: 1,
    XS: 2,
    S: 3,
    M: 4,
    L: 5,
    XL: 6,
    XXL: 7
  };

  const tallaA =
    ordenTallas[a.size] ||
    parseInt(a.size.replace(/\D/g, "")) ||
    999;

  const tallaB =
    ordenTallas[b.size] ||
    parseInt(b.size.replace(/\D/g, "")) ||
    999;

  return tallaA - tallaB;

});

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

      {/* ⚠️ cambios pendientes */}
  

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
  value={tallaActual.stock}

  onChange={(e) => {

    const nuevo =
      Math.max(
        parseInt(e.target.value) || 0,
        0
      );

    setStock(prev =>
      prev.map(item =>
        item.id === tallaActual.id
          ? { ...item, stock: nuevo }
          : item
      )
    );

  }}

  onBlur={async (e) => {

    const nuevo =
      Math.max(
        parseInt(e.target.value) || 0,
        0
      );

    setEstadoGuardado(prev => ({
      ...prev,
      [tallaActual.id]: "saving"
    }));

    const { error } = await supabase
      .from("product_stock")
      .update({ stock: nuevo })
      .eq("id", tallaActual.id);

    if (!error) {

      setEstadoGuardado(prev => ({
        ...prev,
        [tallaActual.id]: "saved"
      }));

      setTimeout(() => {
        setEstadoGuardado(prev => ({
          ...prev,
          [tallaActual.id]: "idle"
        }));
      }, 1800);

    }

  }}

  onFocus={(e) => {
    e.target.style.border =
      "1px solid #ec4899";

    e.target.style.boxShadow =
      "0 0 0 4px rgba(236,72,153,0.12)";
  }}

  onBlurCapture={(e) => {
    e.target.style.border =
      "1px solid #e5e7eb";

    e.target.style.boxShadow =
      "0 4px 12px rgba(0,0,0,0.04)";
  }}

  style={{
    width: 80,

    padding: "10px 12px",

    borderRadius: 12,

    border: "1px solid #e5e7eb",

    textAlign: "center",

    fontWeight: "700",

    fontSize: 15,

    background: "#fff",

    transition: "all .25s ease",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)"
  }}
/>

                <div
  style={{
    marginTop: 6
  }}
>

                  <div
  style={{
    position: "relative",
    height: 20,
    marginTop: 6
  }}
>

  <span
    style={{
      position: "absolute",
      left: 0,
      top: 0,

      opacity:
        estadoGuardado[tallaActual.id] === "saving"
          ? 1
          : 0,

      transition: "all .35s ease",

      color: "#f59e0b",
      fontSize: 12,
      fontWeight: "600"
    }}
  >
    ⏳ Guardando...
  </span>

  <span
    style={{
      position: "absolute",
      left: 0,
      top: 0,

      opacity:
        estadoGuardado[tallaActual.id] === "saved"
          ? 1
          : 0,

      transition: "all .35s ease",

      color: "#22c55e",
      fontSize: 12,
      fontWeight: "700"
    }}
  >
    ✓ Guardado
  </span>

</div>
                  

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

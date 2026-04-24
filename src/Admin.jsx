import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Admin() {
  
  const [orders, setOrders] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [stockTemp, setStockTemp] = useState({});
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(false);

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

useEffect(() => {
  const timeout = setTimeout(() => {
    setBusquedaDebounce(busqueda);
  }, 300);

  return () => clearTimeout(timeout);
}, [busqueda]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

useEffect(() => {
  const cargarStock = async () => {
    const { data } = await supabase
      .from("product_stock")
      .select("*");

    setStock(data || []);
  };

  cargarStock();
}, []);

const cambiarEstado = async (id) => {

  console.log("CLICK ENVIADO:", id);

  // 🔍 1. Obtener pedido
  const resPedido = await fetch("/.netlify/functions/get-orders");
  const pedidos = await resPedido.json();

  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) {
    alert("Pedido no encontrado");
    return;
  }

  // 🛑 evitar doble descuento
  if (pedido.estado === "enviado") {
    alert("Ya fue enviado");
    return;
  }

  // 🔥 2. DESCONTAR STOCK
  for (const item of pedido.items) {

    console.log("ITEM:", item);

    const { error } = await supabase.rpc("descontar_stock", {
      p_id: item.product_id || item.id, // 🔥 IMPORTANTE
      p_size: item.size,
      cantidad: item.qty || 1,
    });

    if (error) {
      console.log("❌ ERROR STOCK:", error);
    } else {
      console.log("✅ STOCK DESCONTADO");
    }
  }

  // 📦 3. Cambiar estado
  await fetch("/.netlify/functions/update-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      estado: "enviado",
    }),
  });

  // 🔄 4. Refrescar lista
  const res = await fetch("/.netlify/functions/get-orders");
  const data = await res.json();
  setOrders(data);
};

const actualizarStock = async (id, nuevoStock) => {
  const { error } = await supabase
    .from("product_stock")
    .update({ stock: nuevoStock })
    .eq("id", id);

  if (error) {
    console.log("❌ ERROR:", error);
    return;
  }

  // actualizar local
  setStock((prev) =>
    prev.map((s) =>
      s.id === id ? { ...s, stock: nuevoStock } : s
    )
  );

  // limpiar temp
  setStockTemp((prev) => {
    const nuevo = { ...prev };
    delete nuevo[id];
    return nuevo;
  });
};

const totalVentas = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
const totalPedidos = orders.length;
const pendientes = orders.filter(o => o.estado === "pendiente").length;
const enviados = orders.filter(o => o.estado === "enviado").length;



const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const dataGrafico = useMemo(() => {
  const ventasPorDia = {};

  orders.forEach((o) => {
    const fecha = o.created_at
  ? new Date(o.created_at).toLocaleDateString("es-CL")
  : "Sin fecha";

    if (!ventasPorDia[fecha]) {
      ventasPorDia[fecha] = 0;
    }

    ventasPorDia[fecha] += Number(o.total || 0);
  });

  const data = Object.keys(ventasPorDia).map((fecha) => ({
    fecha,
    total: ventasPorDia[fecha],
  }));

data.sort((a, b) => {
  if (a.fecha === "Sin fecha") return 1;
  if (b.fecha === "Sin fecha") return -1;

  const [d1, m1, y1] = a.fecha.split("/");
  const [d2, m2, y2] = b.fecha.split("/");

  return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
});

  return data;
}, [orders]);

const btnFiltro = (activo) => ({
  padding: "10px 16px",
  marginRight: 10,
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s ease",

  background: activo ? "#ec4899" : "#f3f4f6",
  color: activo ? "white" : "#333",
boxShadow: activo ? "0 4px 10px rgba(236,72,153,0.3)" : "none"

});

const pedidosOrdenados = [...orders].sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
);


const resaltar = (texto) => {
  if (!busquedaDebounce) return texto;

  const partes = texto.split(
    new RegExp(`(${busquedaDebounce})`, "gi")
  );

  return partes.map((parte, i) =>
    parte.toLowerCase() === busquedaDebounce.toLowerCase() ? (
      <span key={i} style={{ background: "#fde68a" }}>
        {parte}
      </span>
    ) : (
      parte
    )
  );
};

const stockOrdenado = [...stock].sort((a, b) =>
  (productos[a.product_id] || "").localeCompare(productos[b.product_id] || "") ||
  a.size.localeCompare(b.size, undefined, { numeric: true })
);




const stockFiltrado = stockOrdenado.filter((item) =>
  (productos[item.product_id] || "")
    .toLowerCase()
    .includes(search.toLowerCase())
);

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
    <div style={{ padding: 40 }}>
      <h1 style={{
  fontSize: "34px",
  fontWeight: "900",
  marginBottom: "25px",
  background: "linear-gradient(90deg, #ec4899, #f97316)",
  WebkitBackgroundClip: "text",
  color: "transparent"
}}>
  📦 Panel de pedidos
</h1>

{/* 📦 PANEL STOCK */}

<div style={{
  marginBottom: 30,
  padding: 20,
  background: "#fafafa",
  borderRadius: 12
}}>
<h2>📦 Gestión de Stock</h2>

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
  fontSize: 18,
  fontWeight: "bold"
}}
/>

<button
  disabled={loading}
  onClick={async () => {
 	try {
	setLoading(true);

    const updates = Object.entries(stockTemp).map(([id, stock]) => ({
      id: Number(id),
      stock,
    }));

    if (!updates.length) {
      console.log("Sin cambios");
      return;
    }

    const results = await Promise.all(
  updates.map((u) =>
    supabase
      .from("product_stock")
      .update({ stock: u.stock })
      .eq("id", u.id)
  )
);

// validar errores
const hasError = results.some((r) => r.error);

if (hasError) {
  console.log("❌ Error al guardar");
  return;
}

    setStock((prev) =>
      prev.map((item) => {
        const nuevo = updates.find((u) => u.id === item.id);
        return nuevo ? { ...item, stock: nuevo.stock } : item;
      })
    );

    setStockTemp({});
    alert("✅ Stock actualizado");

} catch (err) {
    console.log("❌ ERROR GENERAL:", err);
  } finally {
    setLoading(false);
  }

  }}
  style={{
    marginBottom: 15,
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: loading ? 0.6 : 1
  }}
>
  {loading ? "⏳ Guardando..." : "💾 Guardar todos los cambios"}
</button>

{Object.keys(stockTemp).length > 0 && (
 <p style={{
  color: Object.keys(stockTemp).length > 5 ? "red" : "#f59e0b",
  fontWeight: "bold",
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "#fff",
  padding: "8px",
  borderRadius: "6px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>
  ⚠️ Cambios sin guardar ({Object.keys(stockTemp).length})
</p>
)}


<table style={{
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 15
}}>
  <thead>
    <tr style={{ background: "#fce7f3" }}>
      <th style={{ padding: 10, textAlign: "left" }}>Producto</th>
      <th style={{ padding: 10, textAlign: "left" }}>Talla</th>
      <th style={{ padding: 10 }}>Stock</th>
      <th style={{ padding: 10 }}>Acciones</th>
    </tr>
  </thead>

<tbody>
  {stockFiltrado.map((item) => (
    <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>

      {/* PRODUCTO */}
      <td style={{ padding: 10 }}>
        {productos[item.product_id] || "Producto"}
      </td>

      {/* TALLA */}
      <td style={{ padding: 10 }}>
        {item.size}
      </td>

      {/* STOCK */}
     <td style={{
  padding: 10,
  textAlign: "center"
}}>
        <div style={{ display: "flex",
			justifyContent: "center",
			alignItems: "center",
			gap: 6 }}>

          {stockTemp[item.id] !== undefined && (
            <span style={{ color: "#f59e0b", fontSize: 12 }}>
              ✏️
            </span>
          )}

          <input
  type="number"
  min="0"
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
	      fontSize: 16,
	      fontWeight: "bold",
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />
        </div>
      </td>

      {/* ACCIONES */}
      <td style={{
  padding: 10,
  textAlign: "center"
}}>

  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  }}>

    {/* BOTÓN + */}
    <button
  onClick={() =>
    actualizarStock(
      item.id,
      (stockTemp[item.id] ?? item.stock) + 1
    )
  }
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(34,197,94,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
    transition: "all 0.2s ease"
  }}
>
  +
</button>

    {/* BOTÓN - */}
    <button
  onClick={() =>
    actualizarStock(
      item.id,
      Math.max((stockTemp[item.id] ?? item.stock) - 1, 0)
    )
  }
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(239,68,68,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(239,68,68,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(239,68,68,0.4)")
  }
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
    transition: "all 0.2s ease"
  }}
>
  −
</button>

    {/* BOTÓN GUARDAR */}
    <button
  onClick={() =>
    actualizarStock(
      item.id,
      stockTemp[item.id] ?? item.stock
    )
  }
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(59,130,246,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(59,130,246,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(59,130,246,0.4)")
  }
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
    transition: "all 0.2s ease"
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


<button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }}
  style={{
    position: "absolute",
    top: 40,
    right: 40,

    background: "linear-gradient(135deg, #ec4899, #db2777)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(236,72,153,0.4)",
    transition: "all 0.2s ease"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🚪 Cerrar sesión
</button>

<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 15,
  marginBottom: 30
}}>


  <div style={card}>
    <p>💰 Ventas</p>
    <h2>${totalVentas.toLocaleString("es-CL")}</h2>
  </div>

  <div style={card}>
    <p>📦 Pedidos</p>
    <h2>{totalPedidos}</h2>
  </div>

  <div style={card}>
    <p>⏳ Pendientes</p>
    <h2>{pendientes}</h2>
  </div>

  <div style={card}>
    <p>✅ Enviados</p>
    <h2>{enviados}</h2>
  </div>

</div>

{/* 📈 GRÁFICO DE VENTAS */}
<div style={{
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  marginBottom: 30
}}>
  <h3>📈 Ventas por día</h3>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={dataGrafico}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="fecha" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" stroke="#ec4899" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
</div>


{/* 🔍 BUSCADOR */}
<input
  placeholder="🔍 Buscar cliente, correo, RUT o comuna..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none"
  }}
/>



<div style={{ marginBottom: 20 }}>


  <button
    onClick={() => setFiltro("todos")}
    style={btnFiltro(filtro === "todos")}
    onMouseEnter={(e) => {
      if (filtro !== "todos") e.currentTarget.style.background = "#e5e7eb";
    }}
    onMouseLeave={(e) => {
      if (filtro !== "todos") e.currentTarget.style.background = "#f3f4f6";
    }}
  >
    Todos ({totalPedidos})
  </button>

  <button
    onClick={() => setFiltro("pendiente")}
    style={btnFiltro(filtro === "pendiente")}
    onMouseEnter={(e) => {
      if (filtro !== "pendiente") e.currentTarget.style.background = "#fde2f3";
    }}
    onMouseLeave={(e) => {
      if (filtro !== "pendiente") e.currentTarget.style.background = "#f3f4f6";
    }}
  >
    Pendientes ({pendientes})
  </button>

  <button
    onClick={() => setFiltro("enviado")}
    style={btnFiltro(filtro === "enviado")}
    onMouseEnter={(e) => {
      if (filtro !== "enviado") e.currentTarget.style.background = "#dcfce7";
    }}
    onMouseLeave={(e) => {
      if (filtro !== "enviado") e.currentTarget.style.background = "#f3f4f6";
    }}
  >
    Enviados ({enviados})
  </button>

</div>

      {pedidosOrdenados
  .filter((o) => {
    if (filtro === "todos") return true;
    return o.estado === filtro;
  }).map((o) => (
        <div key={o.id} style={{
          background: "#fff",
          padding: 15,
          marginBottom: 15,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
	  <p><strong>Producto:</strong> {o.items?.[0]?.name}</p>
          <p><strong>Nombre:</strong> {resaltar(o.nombre)}</p>
	  <p><strong>RUT:</strong> {resaltar(o.rut)}</p>
          <p><strong>Correo:</strong> {resaltar(o.correo)}</p>
	  <p><strong>Teléfono:</strong> {resaltar(o.telefono)}</p>
          <p><strong>Dirección:</strong> {resaltar(o.direccion)}</p>
	  <p><strong>Comuna:</strong> {resaltar(o.comuna)}</p>
	  <p><strong>Región:</strong> {resaltar(o.region)}</p>

	  <p>
  	   <strong>Observación:</strong>{" "}
  	   {o.observacion ? o.observacion : "Sin observaciones"}
	 </p>

         <h4>Productos:</h4>

		{o.items?.length ? (
 		 o.items.map((i, idx) => (
  		  <p key={idx}>
    		  {i.name} x{i.qty || 1}
    		</p>
  		))
		) : (
 		 <p>Sin productos</p>
		)}

          <p><strong>Total:</strong> ${Number(o.total).toLocaleString("es-CL")}</p>

          <p style={{
  color: o.estado === "pendiente" ? "orange" : "green",
  fontWeight: "bold"
}}>
  Estado: {o.estado || "pendiente"}
</p>

{(o.estado || "pendiente") === "pendiente" && (
  <button
  onClick={() => cambiarEstado(o.id)}
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(34,197,94,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  style={{
    marginTop: 10,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
    transition: "all 0.2s ease"
  }}
>
  📦 Marcar como enviado
</button>
)}
        </div>
      ))}
    </div>
  );
}
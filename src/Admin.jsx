import { useEffect, useState, useMemo } from "react";
import { supabase } from "./lib/supabase";

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

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

const cambiarEstado = async (id) => {
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

  // refrescar lista
  const res = await fetch("/.netlify/functions/get-orders");
  const data = await res.json();
  setOrders(data);
};


const totalVentas = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
const totalPedidos = orders.length;
const pendientes = orders.filter(o => o.estado === "pendiente").length;
const enviados = orders.filter(o => o.estado === "enviado").length;

const pedidosFiltrados = orders.filter((o) => {
  if (filtro === "todos") return true;
  return o.estado === filtro;
});

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

  return (
    <div style={{ padding: 40 }}>
      <h1>📦 Panel de pedidos</h1>

<button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }}
  style={{
    marginBottom: 20,
    background: "#111",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    float: "right"
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
          <p><strong>Nombre:</strong> {o.nombre}</p>
	  <p><strong>RUT:</strong> {o.rut}</p>
          <p><strong>Correo:</strong> {o.correo}</p>
	  <p><strong>Teléfono:</strong> {o.telefono}</p>
          <p><strong>Dirección:</strong> {o.direccion}</p>
	  <p><strong>Comuna:</strong> {o.comuna}</p>
	  <p><strong>Región:</strong> {o.region}</p>

	  <p>
  	   <strong>Observación:</strong>{" "}
  	   {o.observacion ? o.observacion : "Sin observaciones"}
	 </p>

          <h4>Productos:</h4>
          {o.items?.map((i, idx) => (
            <p key={idx}>
              {i.name} x{i.qty || 1}
            </p>
          ))}

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
    style={{
      marginTop: 10,
      background: "#22c55e",
      color: "white",
      padding: "8px 12px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer"
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
import { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then(res => res.json())
      .then(setOrders);
  }, []);

  const totalVentas = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalPedidos = orders.length;
  const pendientes = orders.filter(o => o.estado === "pendiente").length;
  const enviados = orders.filter(o => o.estado === "enviado").length;

  const ticketPromedio =
  totalPedidos > 0
    ? totalVentas / totalPedidos
    : 0;

const ventasHoy =
  orders.filter(o => {

    const fecha =
      new Date(o.created_at)
        .toLocaleDateString();

    const hoy =
      new Date()
        .toLocaleDateString();

    return fecha === hoy;

  }).reduce(
    (acc, o) =>
      acc + Number(o.total || 0),
    0
  );

const ventasMes =
  orders.filter(o => {

    const fecha =
      new Date(o.created_at);

    const ahora =
      new Date();

    return (
      fecha.getMonth()
      ===
      ahora.getMonth()

      &&

      fecha.getFullYear()
      ===
      ahora.getFullYear()
    );

  }).reduce(
    (acc, o) =>
      acc + Number(o.total || 0),
    0
  );

  const dataGrafico = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const f = o.created_at
        ? new Date(o.created_at).toLocaleDateString("es-CL")
        : "Sin fecha";
      map[f] = (map[f] || 0) + Number(o.total || 0);
    });

    return Object.entries(map).map(([fecha, total]) => ({ fecha, total }));
  }, [orders]);

  return (
    <div>
      <div
  style={{
    marginBottom: 35
  }}
>

  <h1
    style={{
      margin: 0,

      fontSize: 42,

      fontWeight: "900",

      color: "#111827"
    }}
  >
    🚀 Dashboard Enterprise
  </h1>

  <p
    style={{
      marginTop: 10,

      color: "#6b7280",

      fontSize: 16
    }}
  >
    Panel premium ecommerce analytics
  </p>

</div>

      <div
  style={{
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 22
  }}
>

  <Card
    title="💰 Ventas Totales"
    value={`$${totalVentas.toLocaleString("es-CL")}`}
    color="#059669"
  />

  <Card
    title="📦 Pedidos"
    value={totalPedidos}
    color="#2563eb"
  />

  <Card
    title="⏳ Pendientes"
    value={pendientes}
    color="#ea580c"
  />

  <Card
    title="✅ Enviados"
    value={enviados}
    color="#7c3aed"
  />

  <Card
    title="🛒 Ticket Promedio"
    value={`$${Math.round(ticketPromedio).toLocaleString("es-CL")}`}
    color="#db2777"
  />

  <Card
    title="📅 Ventas Hoy"
    value={`$${ventasHoy.toLocaleString("es-CL")}`}
    color="#0891b2"
  />

  <Card
    title="📈 Ventas Mes"
    value={`$${ventasMes.toLocaleString("es-CL")}`}
    color="#dc2626"
  />

</div>

      <div
  style={{
    marginTop: 36,

    background: "#fff",

    borderRadius: 30,

    padding: 24,

    boxShadow:
      "0 10px 35px rgba(0,0,0,0.05)"
  }}
>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" stroke="#ec4899" strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color
}) {

  return (

    <div
      style={{
        background: "#fff",

        padding: 24,

        borderRadius: 28,

        boxShadow:
          "0 10px 35px rgba(0,0,0,0.05)"
      }}
    >

      <div
        style={{
          color,

          fontWeight: "700",

          fontSize: 14
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 14,

          fontSize: 34,

          fontWeight: "900",

          color: "#111827"
        }}
      >
        {value}
      </div>

    </div>

  );

}

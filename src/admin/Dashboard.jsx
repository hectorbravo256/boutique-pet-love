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
      <h1>📊 Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 15 }}>
        <Card title="💰 Ventas" value={totalVentas} />
        <Card title="📦 Pedidos" value={totalPedidos} />
        <Card title="⏳ Pendientes" value={pendientes} />
        <Card title="✅ Enviados" value={enviados} />
      </div>

      <div style={{ marginTop: 30 }}>
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

function Card({ title, value }) {
  return (
    <div style={{
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <p>{title}</p>
      <h2>{typeof value === "number" ? value.toLocaleString("es-CL") : value}</h2>
    </div>
  );
}

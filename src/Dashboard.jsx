import { useEffect, useState, useMemo } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const totalVentas = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalPedidos = orders.length;
  const pendientes = orders.filter(o => o.estado === "pendiente").length;
  const enviados = orders.filter(o => o.estado === "enviado").length;

  const dataGrafico = useMemo(() => {
    const ventasPorDia = {};

    orders.forEach((o) => {
      const fecha = o.created_at
        ? new Date(o.created_at).toLocaleDateString("es-CL")
        : "Sin fecha";

      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + Number(o.total || 0);
    });

    return Object.keys(ventasPorDia).map((fecha) => ({
      fecha,
      total: ventasPorDia[fecha]
    }));
  }, [orders]);

  return (
    <div>
      <h1>📊 Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <div>💰 ${totalVentas.toLocaleString("es-CL")}</div>
        <div>📦 {totalPedidos}</div>
        <div>⏳ {pendientes}</div>
        <div>✅ {enviados}</div>
      </div>

      <div style={{ marginTop: 30 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#ec4899" strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

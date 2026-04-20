import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>📦 Panel de pedidos</h1>

      {orders.map((o) => (
        <div key={o.id} style={{
          background: "#fff",
          padding: 15,
          marginBottom: 15,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
          <p><strong>{o.nombre}</strong></p>
          <p>{o.correo}</p>
          <p>{o.direccion}</p>

          <h4>Productos:</h4>
          {o.items.map((i, idx) => (
            <p key={idx}>
              {i.name} x{i.qty || 1}
            </p>
          ))}

          <p><strong>Total:</strong> ${o.total}</p>

          <p style={{
            color: o.estado === "pendiente" ? "orange" : "green"
          }}>
            Estado: {o.estado}
          </p>
        </div>
      ))}
    </div>
  );
}
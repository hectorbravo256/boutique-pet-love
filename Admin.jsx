import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>📦 Pedidos</h1>

      {orders.map((o) => (
        <div key={o.id} style={{
          background: "#fff",
          padding: 15,
          marginBottom: 10,
          borderRadius: 10
        }}>
          <p><strong>{o.formData.nombre}</strong></p>
          <p>{o.formData.correo}</p>
          <p>Total: ${o.total}</p>
        </div>
      ))}
    </div>
  );
}
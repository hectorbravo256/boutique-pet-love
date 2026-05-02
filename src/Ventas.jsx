import { useEffect, useState } from "react";

export default function Ventas() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const cambiarEstado = async (id) => {
    await fetch("/.netlify/functions/update-order", {
      method: "POST",
      body: JSON.stringify({ id, estado: "enviado" })
    });

    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, estado: "enviado" } : o))
    );
  };

  return (
    <div>
      <h1>💰 Ventas</h1>

      {orders.map(o => (
        <div key={o.id}>
          {o.nombre} - ${o.total}

          {o.estado !== "enviado" && (
            <button onClick={() => cambiarEstado(o.id)}>
              Enviar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

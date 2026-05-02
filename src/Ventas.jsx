import { useEffect, useState } from "react";

export default function Ventas() {
  const [orders, setOrders] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then(res => res.json())
      .then(setOrders);
  }, []);

  const cambiarEstado = async (id) => {
    await fetch("/.netlify/functions/update-order", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ id, estado: "enviado" })
    });

    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, estado: "enviado" } : o)
    );
  };

  return (
    <div>
      <h1>💰 Ventas</h1>

      {orders
        .filter(o => filtro === "todos" || o.estado === filtro)
        .map(o => (
          <div key={o.id}>
            {o.nombre} - ${o.total}

            {o.estado !== "enviado" && (
              <button onClick={() => cambiarEstado(o.id)}>
                Marcar enviado
              </button>
            )}
          </div>
        ))}
    </div>
  );
}

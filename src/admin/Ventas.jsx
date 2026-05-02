import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Ventas() {

  const [orders, setOrders] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");

  // 🔄 cargar pedidos
  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  // ⏳ debounce buscador
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusquedaDebounce(busqueda);
    }, 300);

    return () => clearTimeout(timeout);
  }, [busqueda]);

  // 🔥 cambiar estado + descontar stock
  const cambiarEstado = async (id) => {

    const resPedido = await fetch("/.netlify/functions/get-orders");
    const pedidos = await resPedido.json();

    const pedido = pedidos.find(p => p.id === id);

    if (!pedido) {
      alert("Pedido no encontrado");
      return;
    }

    if (pedido.estado === "enviado") {
      alert("Ya fue enviado");
      return;
    }

    // 🔥 descontar stock
    for (const item of pedido.items) {

      await supabase.rpc("descontar_stock", {
        p_id: item.product_id || item.id,
        p_size: item.size,
        cantidad: item.qty || 1,
      });
    }

    // 📦 actualizar estado
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

    // 🔄 actualizar UI
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? { ...o, estado: "enviado" }
          : o
      )
    );
  };

  // 📊 métricas
  const totalVentas = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalPedidos = orders.length;
  const pendientes = orders.filter(o => o.estado === "pendiente").length;
  const enviados = orders.filter(o => o.estado === "enviado").length;

  // 🔍 resaltar búsqueda
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
      ) : parte
    );
  };

  // 📅 ordenar por fecha
  const pedidosOrdenados = [...orders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // 🎨 botón filtro
  const btnFiltro = (activo) => ({
    padding: "10px 16px",
    marginRight: 10,
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: activo ? "#ec4899" : "#f3f4f6",
    color: activo ? "white" : "#333",
  });

  return (
    <div style={{ padding: 20 }}>

      <h1>📦 Panel de pedidos</h1>

      {/* 📊 RESUMEN */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 15,
        marginBottom: 30
      }}>
        <Card title="💰 Ventas" value={`$${totalVentas.toLocaleString("es-CL")}`} />
        <Card title="📦 Pedidos" value={totalPedidos} />
        <Card title="⏳ Pendientes" value={pendientes} />
        <Card title="✅ Enviados" value={enviados} />
      </div>

      {/* 🔍 BUSCADOR */}
      <input
        placeholder="🔍 Buscar cliente, correo, RUT o comuna..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 15,
          borderRadius: 10,
          border: "1px solid #ddd"
        }}
      />

      {/* 🎯 FILTROS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setFiltro("todos")} style={btnFiltro(filtro === "todos")}>
          Todos ({totalPedidos})
        </button>

        <button onClick={() => setFiltro("pendiente")} style={btnFiltro(filtro === "pendiente")}>
          Pendientes ({pendientes})
        </button>

        <button onClick={() => setFiltro("enviado")} style={btnFiltro(filtro === "enviado")}>
          Enviados ({enviados})
        </button>
      </div>

      {/* 📦 LISTADO */}
      {pedidosOrdenados
        .filter((o) => filtro === "todos" || o.estado === filtro)
        .map((o) => (

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

          {/* 🚚 BOTÓN ENVIAR */}
          {(o.estado || "pendiente") === "pendiente" && (
            <button
              onClick={() => cambiarEstado(o.id)}
              style={{
                marginTop: 10,
                background: "#22c55e",
                color: "white",
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: "bold"
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

// 🎨 CARD
function Card({ title, value }) {
  return (
    <div style={{
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

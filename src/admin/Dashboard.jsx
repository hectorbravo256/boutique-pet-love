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

  const topProductos =
  Object.values(

    orders.reduce((acc, order) => {

      order.items?.forEach(item => {

        if (!acc[item.name]) {

          acc[item.name] = {
            name: item.name,
            cantidad: 0
          };

        }

        acc[item.name].cantidad +=
          item.quantity || 1;

      });

      return acc;

    }, {})

  )

  .sort(
    (a, b) =>
      b.cantidad - a.cantidad
  )

  .slice(0, 5);

  const ultimosPedidos =
  [...orders]

    .sort(
      (a, b) =>
        new Date(b.created_at)
        -
        new Date(a.created_at)
    )

    .slice(0, 5);

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
  <div
    style={{
      padding: 30,

      background:
        "#f5f7fb",

      minHeight: "100vh"
    }}
  >
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

    {/* GRID VISUAL */}
<div
  style={{
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(340px,1fr))",

    gap: 24,

    marginTop: 30
  }}
>

  {/* TOP PRODUCTOS */}
  <div
    style={{
      background: "#fff",

      borderRadius: 30,

      padding: 26,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.05)"
    }}
  >

    <h2
      style={{
        marginTop: 0,

        fontSize: 24,

        fontWeight: "800"
      }}
    >
      🔥 Top Productos
    </h2>

    <div
      style={{
        marginTop: 24,

        display: "flex",

        flexDirection: "column",

        gap: 18
      }}
    >

      {topProductos.map(
        (p, index) => (

          <div
            key={p.name}

            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems: "center",

              paddingBottom: 14,

              borderBottom:
                "1px solid #f3f4f6"
            }}
          >

            <div>

              <div
                style={{
                  fontWeight: "700",

                  color: "#111827"
                }}
              >
                #{index + 1}
                {" "}
                {p.name}
              </div>

            </div>

            <div
              style={{
                background:
                  "#fdf2f8",

                color: "#db2777",

                padding:
                  "8px 12px",

                borderRadius: 999,

                fontWeight: "800",

                fontSize: 13
              }}
            >
              {p.cantidad}
              {" "}ventas
            </div>

          </div>

        )
      )}

    </div>

  </div>

  {/* ÚLTIMOS PEDIDOS */}
  <div
    style={{
      background: "#fff",

      borderRadius: 30,

      padding: 26,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.05)"
    }}
  >

    <h2
      style={{
        marginTop: 0,

        fontSize: 24,

        fontWeight: "800"
      }}
    >
      📦 Últimos Pedidos
    </h2>

    <div
      style={{
        marginTop: 24,

        display: "flex",

        flexDirection: "column",

        gap: 18
      }}
    >

      {ultimosPedidos.map(order => (

        <div
          key={order.id}

          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            paddingBottom: 14,

            borderBottom:
              "1px solid #f3f4f6"
          }}
        >

          <div>

            <div
              style={{
                fontWeight: "700"
              }}
            >
              {order.nombre}
            </div>

            <div
              style={{
                marginTop: 4,

                fontSize: 13,

                color: "#6b7280"
              }}
            >
              {
                new Date(
                  order.created_at
                ).toLocaleDateString(
                  "es-CL"
                )
              }
            </div>

          </div>

          <div
            style={{
              textAlign: "right"
            }}
          >

            <div
              style={{
                fontWeight: "800",

                color: "#111827"
              }}
            >
              $
              {
                Number(
                  order.total || 0
                ).toLocaleString(
                  "es-CL"
                )
              }
            </div>

            <div
              style={{
                marginTop: 4,

                fontSize: 13,

                color:
                  order.estado
                    === "pendiente"

                    ? "#ea580c"

                    : "#16a34a",

                fontWeight: "700"
              }}
            >
              {order.estado}
            </div>

          </div>

        </div>

      ))}

    </div>

  </div>

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
            <Tooltip
  contentStyle={{
    borderRadius: 18,

    border: "none",

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.12)"
  }}
/>
            <Line
  type="monotone"

  dataKey="total"

  stroke="#ec4899"

  strokeWidth={4}

  dot={{
    r: 4
  }}
/>
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

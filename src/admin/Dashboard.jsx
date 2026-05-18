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

  <div className="
    p-4
    md:p-8
  ">

    {/* HEADER */}
    <div className="mb-10">

      <p className="
        text-pink-500
        uppercase
        tracking-[0.3em]
        text-xs
        font-bold
      ">
        Analytics
      </p>

      <h1 className="
        text-4xl
        md:text-5xl
        font-black
        text-slate-900
        mt-3
      ">
        🚀 Dashboard Enterprise
      </h1>

      <p className="
        mt-4
        text-slate-500
        text-base
      ">
        Panel premium ecommerce analytics
      </p>

    </div>

    {/* STATS */}
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-4
      xl:grid-cols-4
      gap-5
    ">

      <Card
        title="💰 Ventas Totales"
        value={`$${totalVentas.toLocaleString("es-CL")}`}
        color="text-emerald-600"
      />

      <Card
        title="📦 Pedidos"
        value={totalPedidos}
        color="text-blue-600"
      />

      <Card
        title="⏳ Pendientes"
        value={pendientes}
        color="text-orange-500"
      />

      <Card
        title="✅ Enviados"
        value={enviados}
        color="text-violet-600"
      />

      <Card
        title="🛒 Ticket Promedio"
        value={`$${Math.round(ticketPromedio).toLocaleString("es-CL")}`}
        color="text-pink-600"
      />

      <Card
        title="📅 Ventas Hoy"
        value={`$${ventasHoy.toLocaleString("es-CL")}`}
        color="text-cyan-600"
      />

      <Card
        title="📈 Ventas Mes"
        value={`$${ventasMes.toLocaleString("es-CL")}`}
        color="text-red-600"
      />

    </div>

    {/* GRID */}
    <div className="
      grid
      xl:grid-cols-2
      gap-6
      mt-8
    ">

      {/* TOP PRODUCTOS */}
      <div className="
        bg-white/80
        backdrop-blur-xl

        border
        border-white/60

        rounded-[30px]

        p-6

        shadow-[0_10px_40px_rgba(0,0,0,0.05)]

        transition-all
        duration-300

        hover:-translate-y-1
      ">

        <h2 className="
          text-2xl
          font-black
          text-slate-900
        ">
          🔥 Top Productos
        </h2>

        <div className="
          mt-6
          flex
          flex-col
          gap-5
        ">

          {topProductos.map((p, index) => (

            <div
              key={p.name}

              className="
                flex
                items-center
                justify-between

                border-b
                border-slate-100

                pb-4
              "
            >

              <div>

                <div className="
                  font-bold
                  text-slate-900
                ">
                  #{index + 1} {p.name}
                </div>

              </div>

              <div className="
                bg-pink-50
                text-pink-600

                px-4
                py-2

                rounded-full

                text-sm
                font-black
              ">
                {p.cantidad} ventas
              </div>

            </div>

          ))}

        </div>

      </div>

      {/* PEDIDOS */}
      <div className="
        bg-white/80
        backdrop-blur-xl

        border
        border-white/60

        rounded-[30px]

        p-6

        shadow-[0_10px_40px_rgba(0,0,0,0.05)]

        transition-all
        duration-300

        hover:-translate-y-1
      ">

        <h2 className="
          text-2xl
          font-black
          text-slate-900
        ">
          📦 Últimos Pedidos
        </h2>

        <div className="
          mt-6
          flex
          flex-col
          gap-5
        ">

          {ultimosPedidos.map(order => (

            <div
              key={order.id}

              className="
                flex
                items-center
                justify-between

                border-b
                border-slate-100

                pb-4
              "
            >

              <div>

                <div className="
                  font-bold
                  text-slate-900
                ">
                  {order.nombre}
                </div>

                <div className="
                  mt-1
                  text-sm
                  text-slate-500
                ">
                  {
                    new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "es-CL"
                    )
                  }
                </div>

              </div>

              <div className="text-right">

                <div className="
                  font-black
                  text-slate-900
                ">
                  $
                  {
                    Number(
                      order.total || 0
                    ).toLocaleString(
                      "es-CL"
                    )
                  }
                </div>

                <div className={`
                  mt-1
                  text-sm
                  font-bold

                  ${
                    order.estado === "pendiente"
                      ? "text-orange-500"
                      : "text-emerald-600"
                  }
                `}>
                  {order.estado}
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

    {/* CHART */}
    <div className="
      mt-8

      bg-white/80
      backdrop-blur-xl

      border
      border-white/60

      rounded-[30px]

      p-6

      shadow-[0_10px_40px_rgba(0,0,0,0.05)]
      hover:-translate-y-1
      transition-all
      duration-300
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">

        <div>

          <p className="
            text-sm
            uppercase
            tracking-[0.25em]
            text-pink-500
            font-bold
          ">
            Analytics
          </p>

          <h2 className="
            text-3xl
            font-black
            text-slate-900
            mt-2
          ">
            📈 Ventas por día
          </h2>

        </div>

      </div>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <LineChart data={dataGrafico}>

          <CartesianGrid
            strokeDasharray="3 3"
          />

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

    <div className="
      bg-white/80
      backdrop-blur-xl

      border
      border-white/60

      rounded-[28px]

      p-5

      shadow-[0_10px_35px_rgba(0,0,0,0.05)]

      transition-all
      duration-300

      hover:-translate-y-1
    ">

      <div className={`
        text-sm
        font-bold

        ${color}
      `}>
        {title}
      </div>

      <div className="
        mt-4

        text-2xl
        md:text-4xl

        font-black

        text-slate-900
      ">
        {value}
      </div>

    </div>

  );

}

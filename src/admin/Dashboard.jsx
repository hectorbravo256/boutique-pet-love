import {
  useEffect,
  useState,
  useMemo
} from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import AdminCard
from "./components/AdminCard";
import DashboardSkeleton
from "./components/DashboardSkeleton";

import useDashboard from "@/admin/shared/hooks/useDashboard";

export default function Dashboard() {

  const {

    summary,

    loading,

    reload

} = useDashboard();

const [ordersLoading, setOrdersLoading] = useState(true);

  const [orders, setOrders] =
    useState([]);

  useEffect(() => {

    fetch(
      "/.netlify/functions/get-orders"
    )
      .then(res => res.json())
      .then(data => {

  setOrders(data);
  setOrdersLoading(false);

});

  }, []);

  const totalVentas =
    orders.reduce(
      (acc, o) =>
        acc + Number(o.total || 0),
      0
    );

  const totalPedidos =
    orders.length;

  const pendientes =
    orders.filter(
      o => o.estado === "pendiente"
    ).length;

  const enviados =
    orders.filter(
      o => o.estado === "enviado"
    ).length;

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

  const dataGrafico =
    useMemo(() => {

      const map = {};

      orders.forEach(o => {

        const f =
          o.created_at

            ? new Date(
                o.created_at
              ).toLocaleDateString(
                "es-CL"
              )

            : "Sin fecha";

        map[f] =
          (map[f] || 0)
          +
          Number(o.total || 0);

      });

      return Object.entries(map)
        .map(([fecha, total]) => ({
          fecha,
          total
        }));

    }, [orders]);

if (ordersLoading) {
    return <DashboardSkeleton />;
}
  
  return (

<div className="
  min-h-screen

  p-4
  md:p-8

  bg-gradient-to-b
  from-[#fff7fb]
  via-white
  to-[#fdf2f8]
">

{/* HERO PREMIUM */}
<div className="
  relative
  overflow-hidden

  rounded-[36px]

  p-6
  md:p-10

  bg-gradient-to-br
  from-pink-500
  via-fuchsia-500
  to-purple-600

  text-white

  shadow-[0_25px_80px_rgba(168,85,247,0.35)]

  mb-10
  animate-[fadeIn_.4s_ease]
">

  {/* GLOW */}
  <div className="
    absolute
    -top-32
    -right-32

    w-[420px]
    h-[420px]

    rounded-full

    bg-white/10

    blur-3xl
  " />

  <div className="
    relative
    z-10
  ">

    <p className="
      uppercase
      tracking-[0.35em]
      text-xs
      font-bold
      text-pink-100
    ">
      Ecommerce Analytics
    </p>

    <h1 className="
      text-4xl
      md:text-6xl

      font-black

      mt-4
      leading-tight
    ">
      🚀 Dashboard Enterprise
    </h1>

    <p className="
      mt-5

      text-pink-100

      max-w-2xl

      text-sm
      md:text-lg

      leading-relaxed
    ">
      Controla ventas, pedidos,
      métricas y rendimiento
      completo de tu ecommerce.
    </p>

    {/* QUICK STATS */}
    <div className="
      grid
      grid-cols-2
      md:grid-cols-4

      gap-4

      mt-8
    ">

      <MiniStat
        label="Ventas"
        value={`$${totalVentas.toLocaleString("es-CL")}`}
      />

      <MiniStat
        label="Pedidos"
        value={totalPedidos}
      />

      <MiniStat
        label="Pendientes"
        value={pendientes}
      />

      <MiniStat
        label="Enviados"
        value={enviados}
      />

    </div>

  </div>

</div>

      {/* STATS */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-5
      ">

<StatCard
    title="💰 Ventas Totales"
    value={`$${(
        summary?.sales?.totalSales ?? 0
    ).toLocaleString("es-CL")}`}
    color="text-emerald-600"
/>

        <StatCard
          title="📦 Pedidos"
          value={
    summary?.sales?.totalOrders ?? 0
}
          color="text-blue-600"
        />

        <StatCard
          title="⏳ Pendientes"
          value={pendientes}
          color="text-orange-500"
        />

        <StatCard
          title="✅ Enviados"
          value={enviados}
          color="text-violet-600"
        />

        <StatCard
          title="🛒 Ticket Promedio"
          value={`$${Math.round(
    summary?.sales?.averageTicket ?? 0
).toLocaleString("es-CL")}`}
          color="text-pink-600"
        />

        <StatCard
          title="📅 Ventas Hoy"
          value={`$${(
    summary?.sales?.salesToday ?? 0
).toLocaleString("es-CL")}`}
          color="text-cyan-600"
        />

        <StatCard
          title="📈 Ventas Mes"
          value={`$${(
    summary?.sales?.salesMonth ?? 0
).toLocaleString("es-CL")}`}
          color="text-red-600"
        />

        <StatCard
    title="📦 Unidades en Stock"
    value={
        summary?.inventory?.totalUnits ?? 0
    }
    color="text-emerald-600"
/>
        <StatCard
    title="🚫 Sin Stock"
    value={
        summary?.inventory?.outOfStock ?? 0
    }
    color="text-red-600"
/>
        <StatCard
    title="⚠️ Stock Crítico"
    value={
        summary?.inventory?.lowStock ?? 0
    }
    color="text-orange-600"
/>
        <StatCard
    title="💎 Valor Inventario"
    value={`$${(
        summary?.inventory?.inventoryValue ?? 0
    ).toLocaleString("es-CL")}`}
    color="text-indigo-600"
/>

      </div>

      {/* GRID */}
      <div className="
        grid
        xl:grid-cols-2
        gap-6
        mt-8
      ">

        {/* TOP */}
        <AdminCard className="
  hover:-translate-y-1
  transition-all
  duration-300
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

                <div className="
                  font-bold
                  text-slate-900
                ">
                  #{index + 1} {p.name}
                </div>

                <div className="
                  bg-gradient-to-r
                  from-pink-50
                  to-purple-50

                  border
                  border-pink-100
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

        </AdminCard>

        {/* PEDIDOS */}
        <AdminCard className="
  hover:-translate-y-1
  transition-all
  duration-300
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

                <div className="
                  text-right
                ">

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

        </AdminCard>

      </div>

      {/* CHART */}
      <AdminCard className="mt-8">

        <div className="
          flex
          items-center
          justify-between
          mb-6
          animate-[fadeIn_.4s_ease]
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

          <LineChart data={dataGrafico} 
            margin={{
            top: 20,
            right: 20,
            left: -10,
            bottom: 0
            }}>

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

      </AdminCard>

    </div>

  );

}

function StatCard({
  title,
  value,
  color
}) {

  return (

    <div className="
      relative
      overflow-hidden

      rounded-[32px]

      bg-white/80
      backdrop-blur-xl

      border
      border-white/60

      p-6

      shadow-[0_10px_40px_rgba(15,23,42,0.06)]

      hover:-translate-y-1
      hover:shadow-[0_25px_70px_rgba(236,72,153,0.12)]

      transition-all
      duration-300
    ">

      <div className="
        absolute
        -top-10
        -right-10

        w-32
        h-32

        rounded-full

        bg-gradient-to-br
        from-pink-100
        to-purple-100

        opacity-60
      " />

      <div className="
        relative
        z-10
      ">

        <div className={`
          text-sm
          font-black

          uppercase
          tracking-[0.15em]

          ${color}
        `}>
          {title}
        </div>

        <div className="
          mt-5

          text-3xl
          md:text-5xl

          font-black

          text-slate-900
        ">
          {value}
        </div>

      </div>

    </div>

  );

}

function MiniStat({
  label,
  value
}) {

  return (

    <div className="
      rounded-3xl

      bg-white/10
      backdrop-blur-xl

      border
      border-white/10

      p-4
    ">

      <div className="
        text-xs
        uppercase
        tracking-[0.2em]

        text-pink-100
        font-bold
      ">
        {label}
      </div>

      <div className="
        mt-3

        text-xl
        md:text-2xl

        font-black
      ">
        {value}
      </div>

    </div>

  );

}

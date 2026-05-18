import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../supabaseClient";

import AdminCard
from "./components/AdminCard";

import AdminInput
from "./components/AdminInput";

export default function Ventas() {

  const [orders, setOrders] =
    useState([]);

  const [filtro, setFiltro] =
    useState("todos");

  const [busqueda, setBusqueda] =
    useState("");

  const [busquedaDebounce,
    setBusquedaDebounce] =
      useState("");

  // 🔄 cargar pedidos
  useEffect(() => {

    fetch(
      "/.netlify/functions/get-orders"
    )

      .then(async (res) => {

        if (!res.ok) {

          console.error(
            "Error Netlify:",
            res.status
          );

          setOrders([]);

          return [];

        }

        const data =
          await res.json();

        return Array.isArray(data)
          ? data
          : [];

      })

      .then((data) => {

        setOrders(data);

      })

      .catch((err) => {

        console.error(
          "Error cargando pedidos:",
          err
        );

        setOrders([]);

      });

  }, []);

  // ⏳ debounce
  useEffect(() => {

    const timeout =
      setTimeout(() => {

        setBusquedaDebounce(
          busqueda
        );

      }, 300);

    return () =>
      clearTimeout(timeout);

  }, [busqueda]);

  // 🔥 cambiar estado
  const cambiarEstado =
    async (id) => {

      const resPedido =
        await fetch(
          "/.netlify/functions/get-orders"
        );

      const pedidos =
        await resPedido.json();

      const pedido =
        (
          Array.isArray(pedidos)
            ? pedidos
            : []
        ).find(p => p.id === id);

      if (!pedido) {

        alert(
          "Pedido no encontrado"
        );

        return;

      }

      if (
        pedido.estado === "enviado"
      ) {

        alert(
          "Ya fue enviado"
        );

        return;

      }

      // 🔥 descontar stock
      for (const item of (
        Array.isArray(pedido.items)
          ? pedido.items
          : []
      )) {

        await supabase.rpc(
          "descontar_stock",
          {
            p_id:
              item.product_id
              || item.id,

            p_size:
              item.size,

            cantidad:
              item.qty || 1,
          }
        );

      }

      // 📦 actualizar estado
      await fetch(
        "/.netlify/functions/update-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
            estado: "enviado",
          }),
        }
      );

      // 🔄 actualizar UI
      setOrders(prev =>

        (
          Array.isArray(prev)
            ? prev
            : []
        ).map(o =>

          o.id === id

            ? {
                ...o,
                estado: "enviado"
              }

            : o

        )

      );

    };

  // 📊 métricas
  const totalVentas =
    (
      Array.isArray(orders)
        ? orders
        : []
    ).reduce(
      (acc, o) =>
        acc +
        Number(o.total || 0),
      0
    );

  const totalPedidos =
    Array.isArray(orders)
      ? orders.length
      : 0;

  const pendientes =
    (
      Array.isArray(orders)
        ? orders
        : []
    ).filter(
      o =>
        o.estado === "pendiente"
    ).length;

  const enviados =
    (
      Array.isArray(orders)
        ? orders
        : []
    ).filter(
      o =>
        o.estado === "enviado"
    ).length;

  // 🔍 resaltar
  const resaltar = (texto) => {

    if (!busquedaDebounce)
      return texto;

    const partes =
      String(texto || "").split(
        new RegExp(
          `(${busquedaDebounce})`,
          "gi"
        )
      );

    return partes.map(
      (parte, i) =>

        parte.toLowerCase()
        ===
        busquedaDebounce.toLowerCase()

          ? (

            <span
              key={i}

              className="
                bg-yellow-200
                rounded
                px-1
              "
            >
              {parte}
            </span>

          )

          : parte

    );

  };

  // 📅 ordenar
  const pedidosOrdenados =

    [
      ...(Array.isArray(orders)
        ? orders
        : [])
    ]

      .sort(
        (a, b) =>
          new Date(b.created_at)
          -
          new Date(a.created_at)
      );

  return (

    <div className="
      p-4
      md:p-8
    ">

      {/* HEADER */}
      <div className="mb-8">

        <p className="
          text-pink-500
          uppercase
          tracking-[0.3em]
          text-xs
          font-bold
        ">
          Administración
        </p>

        <h1 className="
          text-4xl
          md:text-5xl
          font-black
          text-slate-900
          mt-3
        ">
          📦 Ventas y pedidos
        </h1>

      </div>

      {/* MÉTRICAS */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-5
        mb-8
      ">

        <StatCard
          title="💰 Ventas"
          value={`$${totalVentas.toLocaleString("es-CL")}`}
        />

        <StatCard
          title="📦 Pedidos"
          value={totalPedidos}
        />

        <StatCard
          title="⏳ Pendientes"
          value={pendientes}
        />

        <StatCard
          title="✅ Enviados"
          value={enviados}
        />

      </div>

      {/* FILTROS */}
      <AdminCard className="mb-6">

        <div className="
          grid
          gap-4
        ">

          <AdminInput
            placeholder="🔍 Buscar cliente, correo, RUT o comuna..."

            value={busqueda}

            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
          />

          {/* BOTONES */}
          <div className="
            flex
            flex-wrap
            gap-3
          ">

            <FiltroBtn
              active={
                filtro === "todos"
              }

              onClick={() =>
                setFiltro("todos")
              }
            >
              Todos ({totalPedidos})
            </FiltroBtn>

            <FiltroBtn
              active={
                filtro === "pendiente"
              }

              onClick={() =>
                setFiltro(
                  "pendiente"
                )
              }
            >
              Pendientes ({pendientes})
            </FiltroBtn>

            <FiltroBtn
              active={
                filtro === "enviado"
              }

              onClick={() =>
                setFiltro(
                  "enviado"
                )
              }
            >
              Enviados ({enviados})
            </FiltroBtn>

          </div>

        </div>

      </AdminCard>

      {/* LISTADO */}
      <div className="
        grid
        gap-5
      ">

        {pedidosOrdenados

          .filter(o =>

            filtro === "todos"
              ? true
              : o.estado === filtro

          )

          .filter(o => {

            const texto = `
              ${o.nombre}
              ${o.correo}
              ${o.rut}
              ${o.comuna}
            `.toLowerCase();

            return texto.includes(
              busquedaDebounce
                .toLowerCase()
            );

          })

          .map(o => (

            <AdminCard
              key={o.id}
            >

              <div className="
                flex
                flex-col
                xl:flex-row
                xl:items-start
                xl:justify-between
                gap-6
              ">

                {/* INFO */}
                <div className="
                  flex-1
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                    flex-wrap
                    mb-5
                  ">

                    <div className="
                      text-xl
                      font-black
                      text-slate-900
                    ">
                      {
                        o.items?.[0]?.name
                      }
                    </div>

                    <span className={`
                      px-3
                      py-1

                      rounded-full

                      text-sm
                      font-bold

                      ${
                        o.estado ===
                        "pendiente"

                          ? `
                            bg-orange-100
                            text-orange-600
                          `

                          : `
                            bg-emerald-100
                            text-emerald-600
                          `
                      }
                    `}>

                      {
                        o.estado ||
                        "pendiente"
                      }

                    </span>

                  </div>

                  <div className="
                    grid
                    md:grid-cols-2
                    gap-4
                  ">

                    <Info
                      label="Nombre"
                      value={resaltar(o.nombre)}
                    />

                    <Info
                      label="RUT"
                      value={resaltar(o.rut)}
                    />

                    <Info
                      label="Correo"
                      value={resaltar(o.correo)}
                    />

                    <Info
                      label="Teléfono"
                      value={resaltar(o.telefono)}
                    />

                    <Info
                      label="Dirección"
                      value={resaltar(o.direccion)}
                    />

                    <Info
                      label="Comuna"
                      value={resaltar(o.comuna)}
                    />

                    <Info
                      label="Región"
                      value={resaltar(o.region)}
                    />

                  </div>

                  {/* OBS */}
                  <div className="
                    mt-5
                  ">

                    <div className="
                      text-sm
                      font-bold
                      text-slate-500
                    ">
                      Observación
                    </div>

                    <div className="
                      mt-2
                      text-slate-800
                    ">
                      {
                        o.observacion
                          || "Sin observaciones"
                      }
                    </div>

                  </div>

                  {/* PRODUCTOS */}
                  <div className="
                    mt-6
                  ">

                    <div className="
                      text-sm
                      font-bold
                      text-slate-500
                      mb-3
                    ">
                      Productos
                    </div>

                    <div className="
                      flex
                      flex-wrap
                      gap-3
                    ">

                      {
                        Array.isArray(o.items)
                        &&
                        o.items.length

                          ? o.items.map(
                              (i, idx) => (

                              <div
                                key={idx}

                                className="
                                  bg-slate-100

                                  px-4
                                  py-2

                                  rounded-2xl

                                  text-sm
                                  font-semibold
                                "
                              >
                                {i.name} x{i.qty || 1}
                              </div>

                            ))

                          : (
                            <div>
                              Sin productos
                            </div>
                          )
                      }

                    </div>

                  </div>

                </div>

                {/* TOTAL */}
                <div className="
                  xl:w-[240px]
                ">

                  <div className="
                    bg-slate-50

                    border
                    border-slate-100

                    rounded-[28px]

                    p-5
                  ">

                    <div className="
                      text-sm
                      font-bold
                      text-slate-500
                    ">
                      Total
                    </div>

                    <div className="
                      mt-3

                      text-3xl
                      font-black

                      text-slate-900
                    ">
                      $
                      {
                        Number(
                          o.total
                        ).toLocaleString(
                          "es-CL"
                        )
                      }
                    </div>

                    {/* BOTÓN */}
                    {
                      (
                        o.estado ||
                        "pendiente"
                      ) === "pendiente"

                      && (

                        <button
                          onClick={() =>
                            cambiarEstado(
                              o.id
                            )
                          }

                          className="
                            mt-5

                            w-full

                            bg-gradient-to-r
                            from-emerald-500
                            to-green-500

                            hover:opacity-90
                            hover:-translate-y-0.5

                            transition-all
                            duration-300

                            text-white
                            font-bold

                            py-3

                            rounded-2xl
                          "
                        >
                          📦 Marcar enviado
                        </button>

                      )
                    }

                  </div>

                </div>

              </div>

            </AdminCard>

          ))}

      </div>

    </div>

  );

}

// 🔥 METRICS
function StatCard({
  title,
  value
}) {

  return (

    <AdminCard>

      <div className="
        text-sm
        font-bold
        text-slate-500
      ">
        {title}
      </div>

      <div className="
        mt-4

        text-3xl
        font-black

        text-slate-900
      ">
        {value}
      </div>

    </AdminCard>

  );

}

// 🔥 INFO
function Info({
  label,
  value
}) {

  return (

    <div>

      <div className="
        text-sm
        font-bold
        text-slate-500
      ">
        {label}
      </div>

      <div className="
        mt-1
        text-slate-900
      ">
        {value}
      </div>

    </div>

  );

}

// 🔥 FILTRO
function FiltroBtn({
  children,
  active,
  ...props
}) {

  return (

    <button
      {...props}

      className={`
        px-5
        py-2.5

        rounded-full

        font-bold

        transition-all
        duration-300

        ${
          active

            ? `
              bg-gradient-to-r
              from-pink-500
              to-purple-500

              text-white
            `

            : `
              bg-slate-100
              text-slate-700

              hover:bg-slate-200
            `
        }
      `}
    >

      {children}

    </button>

  );

}

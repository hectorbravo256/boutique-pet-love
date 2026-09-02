import {
  useEffect,
  useMemo,
  useState
} from "react";

import { supabase }
from "../supabaseClient";

import AdminCard
from "./components/AdminCard";

import AdminInput
from "./components/AdminInput";

import CambioVentaModal
from "./components/CambioVentaModal";


export default function Ventas() {

  const [orders, setOrders] =
    useState([]);

  const [filtro, setFiltro] =
    useState("todos");

  const [filtroDespacho, setFiltroDespacho] =
    useState("todos");

  const [busqueda, setBusqueda] =
    useState("");

  const [busquedaDebounce,
    setBusquedaDebounce] =
      useState("");

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");

  const [ventaCambio, setVentaCambio] =
    useState(null);

  const [pagoCambio, setPagoCambio] =
    useState(null);

  const [medioPagoCambio, setMedioPagoCambio] =
    useState("");

  const [procesandoPago, setProcesandoPago] =
    useState(false);


  // ============================================================
  // CARGAR PEDIDOS
  // ============================================================

  useEffect(() => {

    cargarPedidos();

  }, []);


  const cargarPedidos = async () => {

    try {

      const res =
        await fetch(
          "/.netlify/functions/get-orders"
        );

      if (!res.ok) {

        console.error(
          "Error Netlify:",
          res.status
        );

        setOrders([]);

        return;

      }

      const data =
        await res.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Error cargando pedidos:",
        err
      );

      setOrders([]);

    }

  };


  // ============================================================
  // DEBOUNCE
  // ============================================================

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


  // ============================================================
  // FORMATO FECHA Y HORA
  // ============================================================

  const formatearFechaHora = (valor) => {

    if (!valor) {
      return "Fecha no disponible";
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat(
      "es-CL",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    ).format(fecha);

  };


  // ============================================================
  // LIMPIAR FILTRO DE FECHAS
  // ============================================================

  const limpiarFiltroFechas = () => {

    setFechaDesde("");
    setFechaHasta("");

  };


  // ============================================================
  // CAMBIAR ESTADO
  // ============================================================

  const cambiarEstado =
    async (id) => {

      try {

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
          ).find(
            p => p.id === id
          );

        if (!pedido) {

          alert(
            "Pedido no encontrado"
          );

          return;

        }

        if (
          pedido.estado ===
          "enviado"
        ) {

          alert(
            "Ya fue enviado"
          );

          return;

        }


        const response =
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


        if (!response.ok) {

          alert(
            "No fue posible actualizar el estado."
          );

          return;

        }


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

      } catch (err) {

        console.error(
          "Error cambiando estado:",
          err
        );

        alert(
          "Ocurrió un error al actualizar el pedido."
        );

      }

    };


  // ============================================================
  // REGISTRAR PAGO ADICIONAL DEL CAMBIO
  // ============================================================

  const registrarPagoCambio =
    async () => {

      if (!pagoCambio?.cambio_id) {

        alert(
          "No se encontró el cambio asociado a esta venta."
        );

        return;

      }

      if (!medioPagoCambio) {

        alert(
          "Selecciona el medio de pago."
        );

        return;

      }

      try {

        setProcesandoPago(true);

        const {
          data,
          error
        } = await supabase.rpc(
          "marcar_pago_cambio",
          {
            p_exchange_id:
              pagoCambio.cambio_id,

            p_payment_method:
              medioPagoCambio
          }
        );

        if (error) {

          console.error(
            "Error registrando pago:",
            error
          );

          alert(
            error.message ||
            "No fue posible registrar el pago."
          );

          return;

        }

        const exchange =
          Array.isArray(data)
            ? data[0]
            : data;

        setOrders(prev =>

          (
            Array.isArray(prev)
              ? prev
              : []
          ).map(o =>

            o.id === pagoCambio.id

              ? {
                  ...o,

                  adicional_cambio:
                    Number(
                      o.adicional_cambio || 0
                    ),

                  estado_pago_cambio:
                    "paid",

                  medio_pago_cambio:
                    exchange?.payment_method ||
                    medioPagoCambio,

                  total_cobrado:
                    Number(
                      o.total || 0
                    ) +
                    Number(
                      o.adicional_cambio || 0
                    )
                }

              : o

          )

        );

        setPagoCambio(null);
        setMedioPagoCambio("");

        alert(
          "Pago de la diferencia registrado correctamente."
        );

      } catch (err) {

        console.error(
          "Error registrando pago del cambio:",
          err
        );

        alert(
          "Ocurrió un error al registrar el pago."
        );

      } finally {

        setProcesandoPago(false);

      }

    };


  // ============================================================
  // IDENTIFICAR TIPO DE DESPACHO
  // ============================================================

  const obtenerDespacho = (orden) => {

    const observacion =
      String(
        orden?.observacion || ""
      ).toLowerCase();

    const tipoVenta =
      String(
        orden?.tipo_venta || ""
      ).toLowerCase();


    const esOnline =
      tipoVenta === "online";

    const esRRSS =
      tipoVenta === "rrss";

    const empresaEnvio =
      String(
        orden?.empresa_envio || ""
      ).toLowerCase().trim();

    const envioPorPagar =
      orden?.envio_por_pagar === true;

    // ============================================================
    // EMPRESA DE ENVÍO REGISTRADA
    // ============================================================

    if (
      (esRRSS || esOnline) &&
      empresaEnvio === "paket" &&
      !envioPorPagar
    ) {

      return {
        tipo: "paket",
        nombre: "PAKET",
        icono: "📦",
        clase:
          "bg-pink-100 text-pink-700"
      };

    }


    if (
      (esRRSS || esOnline) &&
      envioPorPagar &&
      empresaEnvio === "starken"
    ) {

      return {
        tipo: "starken",
        nombre: "STARKEN",
        icono: "🚚",
        clase:
          "bg-orange-100 text-orange-700"
      };

    }


    if (
      (esRRSS || esOnline) &&
      envioPorPagar &&
      empresaEnvio === "bluexpress"
    ) {

      return {
        tipo: "bluexpress",
        nombre: "BLUEXPRESS",
        icono: "🚚",
        clase:
          "bg-blue-100 text-blue-700"
      };

    }


    const subtotalProductos =
      Array.isArray(orden?.items)

        ? orden.items.reduce(
            (total, item) => {

              const precio =
                Number(
                  item?.price || 0
                );

              const cantidad =
                Number(
                  item?.qty || 1
                );

              return total +
                (precio * cantidad);

            },
            0
          )

        : 0;


    const totalVenta =
      Number(
        orden?.total || 0
      );


    const despachoCalculado =
      totalVenta -
      subtotalProductos;


    if (
      esOnline &&
      Math.abs(
        despachoCalculado - 3500
      ) < 1
    ) {

      return {
        tipo: "paket",
        nombre: "PAKET",
        icono: "📦",
        clase:
          "bg-pink-100 text-pink-700"
      };

    }


    if (
      observacion.includes("paket")
    ) {

      return {
        tipo: "paket",
        nombre: "PAKET",
        icono: "📦",
        clase:
          "bg-pink-100 text-pink-700"
      };

    }


    if (
      observacion.includes(
        "bluexpress"
      )
    ) {

      return {
        tipo: "bluexpress",
        nombre: "BLUEXPRESS",
        icono: "🚚",
        clase:
          "bg-blue-100 text-blue-700"
      };

    }


    if (
      observacion.includes(
        "starken"
      )
    ) {

      return {
        tipo: "starken",
        nombre: "STARKEN",
        icono: "🚚",
        clase:
          "bg-orange-100 text-orange-700"
      };

    }


    if (
      esOnline &&
      Math.abs(
        despachoCalculado
      ) < 1
    ) {

      return {
        tipo: "por_pagar",
        nombre: "POR PAGAR",
        icono: "💳",
        clase:
          "bg-slate-100 text-slate-700"
      };

    }


    if (
      observacion.includes(
        "por pagar"
      )
    ) {

      return {
        tipo: "por_pagar",
        nombre: "POR PAGAR",
        icono: "💳",
        clase:
          "bg-slate-100 text-slate-700"
      };

    }


    return {
      tipo: "sin_despacho",
      nombre: "SIN DESPACHO",
      icono: "—",
      clase:
        "bg-gray-100 text-gray-600"
    };

  };


  // ============================================================
  // MÉTRICAS
  // ============================================================

  const totalVentas =
    (
      Array.isArray(orders)
        ? orders
        : []
    ).reduce(
      (acc, o) => {

        const totalCobrado =
          Number(
            o.total_cobrado ??
            o.total ??
            0
          );

        return acc +
          (
            Number.isFinite(
              totalCobrado
            )
              ? totalCobrado
              : 0
          );

      },
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
        o.estado ===
        "pendiente"
    ).length;


  const enviados =
    (
      Array.isArray(orders)
        ? orders
        : []
    ).filter(
      o =>
        o.estado ===
        "enviado"
    ).length;


  const cantidadPakets =
    orders.filter(
      o =>
        obtenerDespacho(o).tipo ===
        "paket"
    ).length;


  const cantidadStarken =
    orders.filter(
      o =>
        obtenerDespacho(o).tipo ===
        "starken"
    ).length;


  const cantidadBluexpress =
    orders.filter(
      o =>
        obtenerDespacho(o).tipo ===
        "bluexpress"
    ).length;


  const cantidadPorPagar =
    orders.filter(
      o =>
        obtenerDespacho(o).tipo ===
        "por_pagar"
    ).length;


  // ============================================================
  // RESALTAR BÚSQUEDA
  // ============================================================

  const resaltar = (texto) => {

    if (!busquedaDebounce)
      return texto;

    const partes =
      String(texto || "")
        .split(
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


  // ============================================================
  // PEDIDOS ORDENADOS
  // ============================================================

  const pedidosOrdenados =
    useMemo(

      () =>

        [
          ...(
            Array.isArray(orders)
              ? orders
              : []
          )
        ].sort(
          (a, b) =>
            new Date(
              b.created_at
            ) -
            new Date(
              a.created_at
            )
        ),

      [orders]

    );


  // ============================================================
  // FILTRADO
  // ============================================================

  const pedidosFiltrados =
    pedidosOrdenados

      .filter(o => {

        if (!fechaDesde && !fechaHasta) {
          return true;
        }

        const fechaPedido =
          new Date(o.created_at);

        if (
          Number.isNaN(
            fechaPedido.getTime()
          )
        ) {
          return false;
        }

        if (fechaDesde) {

          const inicio =
            new Date(
              `${fechaDesde}T00:00:00`
            );

          if (
            fechaPedido < inicio
          ) {
            return false;
          }

        }

        if (fechaHasta) {

          const fin =
            new Date(
              `${fechaHasta}T23:59:59.999`
            );

          if (
            fechaPedido > fin
          ) {
            return false;
          }

        }

        return true;

      })

      .filter(o =>

        filtro === "todos"

          ? true

          : o.estado ===
            filtro

      )

      .filter(o => {

        if (
          filtroDespacho ===
          "todos"
        ) {

          return true;

        }

        return (
          obtenerDespacho(o).tipo
          ===
          filtroDespacho
        );

      })

      .filter(o => {

        const texto = `

          ${o.numero_venta || ""}

          ${o.nombre || ""}

          ${o.correo || ""}

          ${o.rut || ""}

          ${o.comuna || ""}

          ${o.observacion || ""}

          ${
            Array.isArray(o.items)
              ? o.items
                  .map(
                    i =>
                      `${i.name || ""}
                       ${i.size || ""}
                       ${i.variant_id || ""}`
                  )
                  .join(" ")
              : ""
          }

        `.toLowerCase();


        return texto.includes(
          busquedaDebounce
            .toLowerCase()
        );

      });


  // ============================================================
  // RETURN
  // ============================================================

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


      <div className="
        relative
        overflow-hidden
        rounded-[32px]
        p-6
        md:p-8
        mb-8
        bg-gradient-to-br
        from-pink-500
        via-fuchsia-500
        to-purple-600
        text-white
        shadow-[0_20px_60px_rgba(168,85,247,0.35)]
      ">

        <div className="
          absolute
          inset-0
          opacity-10
          bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]
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
            Panel administrativo
          </p>


          <h1 className="
            text-4xl
            md:text-5xl
            font-black
            mt-3
          ">
            📦 Ventas y pedidos
          </h1>


          <p className="
            mt-4
            text-pink-100
            max-w-2xl
            text-sm
            md:text-base
          ">
            Gestiona pedidos, clientes,
            estados de envío, transportistas
            y métricas de ventas en tiempo real.
          </p>

        </div>

      </div>


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
          value={
            `$${totalVentas.toLocaleString(
              "es-CL"
            )}`
          }
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


      <AdminCard className="mb-6">

        <div className="
          grid
          gap-5
        ">


          <AdminInput
            placeholder="
              🔍 Buscar N.º venta, cliente,
              correo, RUT, comuna o producto...
            "

            value={busqueda}

            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
          />


          <div>

            <div className="
              text-xs
              uppercase
              tracking-wider
              font-black
              text-slate-500
              mb-3
            ">
              Fecha
            </div>


            <div className="
              grid
              grid-cols-1
              md:grid-cols-[1fr_1fr_auto]
              gap-3
              items-end
            ">

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-500
                  mb-2
                ">
                  Desde
                </label>

                <input
                  type="date"
                  value={fechaDesde}
                  max={fechaHasta || undefined}
                  onChange={(e) =>
                    setFechaDesde(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-pink-100
                    bg-white
                    px-4
                    py-3
                    text-slate-700
                    font-semibold
                    shadow-sm
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                />

              </div>


              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-500
                  mb-2
                ">
                  Hasta
                </label>

                <input
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  onChange={(e) =>
                    setFechaHasta(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-pink-100
                    bg-white
                    px-4
                    py-3
                    text-slate-700
                    font-semibold
                    shadow-sm
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                />

              </div>


              <button
                type="button"
                onClick={limpiarFiltroFechas}
                disabled={
                  !fechaDesde &&
                  !fechaHasta
                }
                className="
                  rounded-2xl
                  bg-slate-100
                  border
                  border-slate-200
                  px-5
                  py-3
                  font-bold
                  text-slate-700
                  hover:bg-slate-200
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  transition-all
                "
              >
                ✕ Limpiar fechas
              </button>

            </div>

          </div>


          <div>

            <div className="
              text-xs
              uppercase
              tracking-wider
              font-black
              text-slate-500
              mb-3
            ">
              Estado
            </div>


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
                ⏳ Pendientes ({pendientes})
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
                ✅ Enviados ({enviados})
              </FiltroBtn>

            </div>

          </div>


          <div>

            <div className="
              text-xs
              uppercase
              tracking-wider
              font-black
              text-slate-500
              mb-3
            ">
              Transportista / despacho
            </div>


            <div className="
              flex
              flex-wrap
              gap-3
            ">

              <FiltroBtn
                active={
                  filtroDespacho ===
                  "todos"
                }

                onClick={() =>
                  setFiltroDespacho(
                    "todos"
                  )
                }
              >
                Todos
              </FiltroBtn>


              <FiltroBtn
                active={
                  filtroDespacho ===
                  "paket"
                }

                onClick={() =>
                  setFiltroDespacho(
                    "paket"
                  )
                }
              >
                📦 PAKET ({cantidadPakets})
              </FiltroBtn>


              <FiltroBtn
                active={
                  filtroDespacho ===
                  "starken"
                }

                onClick={() =>
                  setFiltroDespacho(
                    "starken"
                  )
                }
              >
                🚚 STARKEN ({cantidadStarken})
              </FiltroBtn>


              <FiltroBtn
                active={
                  filtroDespacho ===
                  "bluexpress"
                }

                onClick={() =>
                  setFiltroDespacho(
                    "bluexpress"
                  )
                }
              >
                🚚 BLUEXPRESS ({cantidadBluexpress})
              </FiltroBtn>


              <FiltroBtn
                active={
                  filtroDespacho ===
                  "por_pagar"
                }

                onClick={() =>
                  setFiltroDespacho(
                    "por_pagar"
                  )
                }
              >
                💳 Por pagar ({cantidadPorPagar})
              </FiltroBtn>

            </div>

          </div>

        </div>

      </AdminCard>


      <div className="
        grid
        gap-5
      ">


        {pedidosFiltrados.length === 0 && (

          <AdminCard>

            <div className="
              py-12
              text-center
            ">

              <div className="
                text-5xl
                mb-4
              ">
                🔎
              </div>

              <div className="
                text-xl
                font-black
                text-slate-800
              ">
                No encontramos ventas
              </div>

              <div className="
                mt-2
                text-slate-500
              ">
                Prueba cambiando los filtros
                o la búsqueda.
              </div>

            </div>

          </AdminCard>

        )}


        {pedidosFiltrados.map(o => {

          const despacho =
            obtenerDespacho(o);

          const cambioPendiente =
            Number(
              o.adicional_cambio || 0
            ) > 0 &&
            String(
              o.estado_pago_cambio || ""
            ).toLowerCase() ===
            "pending";

          const cambioPagado =
            Number(
              o.adicional_cambio || 0
            ) > 0 &&
            String(
              o.estado_pago_cambio || ""
            ).toLowerCase() ===
            "paid";


          return (

            <AdminCard
              key={o.id}

              className="
                hover:-translate-y-1
                hover:shadow-[0_20px_60px_rgba(15,23,42,0.10)]
                transition-all
                duration-300
              "
            >


              <div className="
                flex
                flex-col
                xl:flex-row
                xl:items-start
                xl:justify-between
                gap-6
              ">


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
                      px-4
                      py-2
                      rounded-2xl
                      bg-slate-900
                      text-white
                      text-lg
                      font-black
                      shadow-sm
                    ">

                      VENTA #

                      {
                        o.numero_venta ||
                        o.id
                      }

                    </div>


                    <span className={`
                      px-3
                      py-1
                      rounded-full
                      shadow-sm
                      uppercase
                      tracking-wide
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


                    <span className={`
                      px-3
                      py-1
                      rounded-full
                      shadow-sm
                      text-sm
                      font-black
                      ${despacho.clase}
                    `}>

                      {despacho.icono}
                      {" "}
                      {despacho.nombre}

                    </span>

                  </div>


                  <div className="
                    mb-5
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-slate-500
                  ">

                    <span>
                      📅
                    </span>

                    <span>
                      {
                        formatearFechaHora(
                          o.created_at
                        )
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
                      value={
                        resaltar(
                          o.nombre
                        )
                      }
                    />


                    <Info
                      label="N.º de venta"
                      value={
                        o.numero_venta ||
                        o.id
                      }
                    />


                    <Info
                      label="RUT"
                      value={
                        resaltar(
                          o.rut
                        )
                      }
                    />


                    <Info
                      label="Correo"
                      value={
                        resaltar(
                          o.correo
                        )
                      }
                    />


                    <Info
                      label="Teléfono"
                      value={
                        resaltar(
                          o.telefono
                        )
                      }
                    />


                    <Info
                      label="Dirección"
                      value={
                        resaltar(
                          o.direccion
                        )
                      }
                    />


                    <Info
                      label="Comuna"
                      value={
                        resaltar(
                          o.comuna
                        )
                      }
                    />


                    <Info
                      label="Región"
                      value={
                        resaltar(
                          o.region
                        )
                      }
                    />

                  </div>


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
                        o.observacion ||
                        "Sin observaciones"
                      }

                    </div>

                  </div>


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
                      grid
                      gap-3
                    ">


                      {
                        Array.isArray(
                          o.items
                        )
                        &&
                        o.items.length

                          ? o.items.map(
                              (i, idx) => (

                              <div
                                key={idx}

                                className="
                                  flex
                                  flex-col
                                  sm:flex-row
                                  sm:items-center
                                  sm:justify-between
                                  gap-2
                                  bg-gradient-to-r
                                  from-pink-50
                                  to-purple-50
                                  border
                                  border-pink-100
                                  px-4
                                  py-3
                                  rounded-2xl
                                "
                              >


                                <div>

                                  <div className="
                                    font-black
                                    text-slate-900
                                  ">

                                    {
                                      i.name ||
                                      "Producto"
                                    }

                                  </div>


                                  <div className="
                                    mt-1
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                    text-sm
                                    text-slate-600
                                  ">

                                    <span className="
                                      rounded-full
                                      bg-white
                                      border
                                      border-pink-200
                                      px-3
                                      py-1
                                      font-bold
                                    ">

                                      📏
                                      {" "}

                                      {
                                        i.size ||
                                        "Sin talla"
                                      }

                                    </span>


                                    <span>

                                      ×

                                      {
                                        i.qty ||
                                        1
                                      }

                                    </span>


                                    {
                                      i.variant_id && (

                                        <span className="
                                          text-xs
                                          text-slate-400
                                        ">

                                          Variante #

                                          {
                                            i.variant_id
                                          }

                                        </span>

                                      )
                                    }

                                  </div>

                                </div>


                                <div className="
                                  text-sm
                                  font-black
                                  text-slate-700
                                ">

                                  $
                                  {
                                    Number(
                                      i.price || 0
                                    ).toLocaleString(
                                      "es-CL"
                                    )
                                  }

                                </div>

                              </div>

                            ))

                          : (

                            <div className="
                              rounded-2xl
                              bg-slate-50
                              border
                              border-slate-200
                              px-4
                              py-3
                              text-slate-500
                            ">
                              Sin productos
                            </div>

                          )
                      }

                    </div>

                  </div>

                </div>


                <div className="
                  xl:w-[240px]
                ">


                  <div className="
                    relative
                    overflow-hidden
                    rounded-[28px]
                    p-6
                    bg-gradient-to-br
                    from-slate-900
                    to-slate-800
                    text-white
                    shadow-[0_15px_50px_rgba(15,23,42,0.25)]
                  ">


                    <div className="
                      absolute
                      -top-16
                      -right-16
                      w-40
                      h-40
                      rounded-full
                      bg-pink-500/20
                    " />


                    <div className="
                      relative
                      z-10
                    ">


                      <div className="
                        text-sm
                        font-bold
                        text-slate-300
                      ">
                        Total cobrado
                      </div>


                      <div className="
                        mt-4
                        text-4xl
                        font-black
                      ">

                        $
                        {
                          Number(
                            o.total_cobrado ??
                            o.total ??
                            0
                          ).toLocaleString(
                            "es-CL"
                          )
                        }

                      </div>


                      {
                        Number(
                          o.adicional_cambio || 0
                        ) > 0 && (

                        <div className="
                          mt-4
                          rounded-2xl
                          bg-pink-500/10
                          border
                          border-pink-400/20
                          px-4
                          py-3
                        ">

                          <div className="
                            text-xs
                            uppercase
                            tracking-wide
                            text-slate-300
                          ">
                            Venta original
                          </div>

                          <div className="
                            mt-1
                            font-bold
                          ">
                            $
                            {
                              Number(
                                o.total || 0
                              ).toLocaleString(
                                "es-CL"
                              )
                            }
                          </div>


                          <div className="
                            mt-3
                            text-xs
                            uppercase
                            tracking-wide
                            text-pink-300
                          ">
                            🔄 Adicional cambio
                          </div>


                          <div className="
                            mt-1
                            text-lg
                            font-black
                            text-pink-300
                          ">
                            +$
                            {
                              Number(
                                o.adicional_cambio || 0
                              ).toLocaleString(
                                "es-CL"
                              )
                            }
                          </div>


                          <div className="
                            mt-3
                            text-xs
                            font-bold
                            text-slate-300
                          ">

                            {
                              cambioPagado
                                ? "💳 Pagado"
                                : "⏳ Pendiente de pago"
                            }

                            {
                              o.medio_pago_cambio
                                ? ` · ${o.medio_pago_cambio}`
                                : ""
                            }

                          </div>


                          {
                            cambioPendiente && (

                              <>

                                {
                                  pagoCambio?.id ===
                                  o.id ? (

                                    <div className="
                                      mt-4
                                      rounded-xl
                                      bg-white/10
                                      p-3
                                    ">

                                      <label className="
                                        block
                                        text-xs
                                        font-bold
                                        text-slate-300
                                        mb-2
                                      ">
                                        Medio de pago
                                      </label>


                                      <select
                                        value={
                                          medioPagoCambio
                                        }

                                        onChange={(e) =>
                                          setMedioPagoCambio(
                                            e.target.value
                                          )
                                        }

                                        disabled={
                                          procesandoPago
                                        }

                                        className="
                                          w-full
                                          rounded-xl
                                          border
                                          border-slate-600
                                          bg-slate-800
                                          px-3
                                          py-2
                                          text-sm
                                          text-white
                                          outline-none
                                          focus:ring-2
                                          focus:ring-pink-400
                                        "
                                      >

                                        <option value="">
                                          Seleccionar medio de pago
                                        </option>

                                        <option value="Transferencia">
                                          Transferencia
                                        </option>

                                        <option value="Efectivo">
                                          Efectivo
                                        </option>

                                        <option value="Débito">
                                          Débito
                                        </option>

                                        <option value="Crédito">
                                          Crédito
                                        </option>

                                      </select>


                                      <div className="
                                        grid
                                        grid-cols-2
                                        gap-2
                                        mt-3
                                      ">

                                        <button
                                          type="button"

                                          onClick={() => {
                                            setPagoCambio(null);
                                            setMedioPagoCambio("");
                                          }}

                                          disabled={
                                            procesandoPago
                                          }

                                          className="
                                            rounded-xl
                                            bg-white/10
                                            py-2
                                            text-sm
                                            font-bold
                                            text-slate-200
                                            hover:bg-white/20
                                          "
                                        >
                                          Cancelar
                                        </button>


                                        <button
                                          type="button"

                                          onClick={
                                            registrarPagoCambio
                                          }

                                          disabled={
                                            procesandoPago ||
                                            !medioPagoCambio
                                          }

                                          className="
                                            rounded-xl
                                            bg-emerald-500
                                            py-2
                                            text-sm
                                            font-bold
                                            text-white
                                            hover:bg-emerald-600
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                          "
                                        >
                                          {
                                            procesandoPago
                                              ? "Guardando..."
                                              : "Confirmar pago"
                                          }
                                        </button>

                                      </div>

                                    </div>

                                  ) : (

                                    <button
                                      type="button"

                                      onClick={() => {
                                        setPagoCambio(o);
                                        setMedioPagoCambio("");
                                      }}

                                      className="
                                        mt-4
                                        w-full
                                        rounded-xl
                                        bg-pink-500
                                        py-2.5
                                        text-sm
                                        font-black
                                        text-white
                                        hover:bg-pink-600
                                        transition-all
                                      "
                                    >
                                      💳 Registrar pago
                                    </button>

                                  )
                                }

                              </>

                            )
                          }

                        </div>

                      )
                    }


                    <div className="
                      mt-4
                      rounded-2xl
                      bg-white/10
                      px-4
                      py-3
                    ">

                      <div className="
                        text-xs
                        uppercase
                        tracking-wide
                        text-slate-300
                      ">
                        Despacho
                      </div>


                      <div className="
                        mt-1
                        font-black
                      ">

                        {despacho.icono}
                        {" "}
                        {despacho.nombre}

                      </div>

                    </div>


                    {
                      (
                        o.estado ||
                        "pendiente"
                      ) ===
                      "pendiente"
                      && (

                        <button
                          onClick={() =>
                            cambiarEstado(
                              o.id
                            )
                          }

                          className="
                            mt-6
                            w-full
                            rounded-2xl
                            bg-gradient-to-r
                            from-emerald-500
                            to-green-500
                            py-3
                            font-bold
                            text-white
                            hover:scale-[1.02]
                            hover:opacity-90
                            transition-all
                            duration-300
                          "
                        >
                          📦 Marcar enviado
                        </button>

                      )
                    }


                    <button
                      onClick={() =>
                        setVentaCambio(o)
                      }

                      className="
                        mt-3
                        w-full
                        rounded-2xl
                        bg-gradient-to-r
                        from-pink-500
                        to-purple-600
                        py-3
                        font-bold
                        text-white
                        hover:scale-[1.02]
                        hover:opacity-90
                        transition-all
                        duration-300
                      "
                    >
                      ↔️ Gestionar cambio
                    </button>


                  </div>

                </div>

              </div>

            </AdminCard>

          );

        })}

      </div>


      {
        ventaCambio && (

          <CambioVentaModal
            venta={ventaCambio}

            onClose={() =>
              setVentaCambio(null)
            }

            onSuccess={() => {

              setVentaCambio(null);

              cargarPedidos();

            }}
          />

        )
      }


    </div>

  );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value
}) {

  return (

    <div className="
      relative
      overflow-hidden
      rounded-[28px]
      p-6
      bg-white/80
      backdrop-blur-xl
      border
      border-white/60
      shadow-[0_10px_40px_rgba(15,23,42,0.08)]
      hover:-translate-y-1
      hover:shadow-[0_20px_60px_rgba(236,72,153,0.15)]
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
          md:text-4xl
          font-black
          text-slate-900
        ">
          {value}
        </div>

      </div>

    </div>

  );

}


// ============================================================
// INFO
// ============================================================

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


// ============================================================
// FILTRO
// ============================================================

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
        shadow-sm
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
              bg-gradient-to-r
              from-pink-50
              to-purple-50
              border
              border-pink-100
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

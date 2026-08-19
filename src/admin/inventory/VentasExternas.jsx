import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const MEDIOS_PAGO = [
  { value: "efectivo", label: "💵 Efectivo" },
  { value: "debito", label: "💳 Débito" },
  { value: "credito", label: "💳 Crédito" },
  { value: "transferencia", label: "🏦 Transferencia" },
];

const TIPOS_VENTA = [
  { value: "presencial", label: "🏪 Venta presencial" },
  { value: "whatsapp", label: "📱 Venta WhatsApp" },
];

export default function VentasExternas() {
  const [tipoVenta, setTipoVenta] = useState("presencial");
  const [medioPago, setMedioPago] = useState("transferencia");

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const [cliente, setCliente] = useState({
    nombre: "",
    rut: "",
    correo: "",
    telefono: "",
    observacion: "",
  });

  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // ------------------------------------------------------------
  // CARGAR PRODUCTOS Y VARIANTES
  // ------------------------------------------------------------
  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setCargandoProductos(true);

      const { data, error } = await supabase
        .from("product_variants")
        .select(`
          id,
          product_id,
          size,
          price,
          stock,
          products (
            id,
            name
          )
        `)
        .order("product_id", { ascending: true });

      if (error) throw error;

      setProductos(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);

      setMensaje({
        tipo: "error",
        texto: "No fue posible cargar los productos.",
      });
    } finally {
      setCargandoProductos(false);
    }
  }

  // ------------------------------------------------------------
  // PRODUCTOS FILTRADOS
  // ------------------------------------------------------------
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return [];

    return productos
      .filter((item) => {
        const nombre = item.products?.name?.toLowerCase() || "";
        const talla = item.size?.toLowerCase() || "";

        return (
          nombre.includes(texto) ||
          talla.includes(texto)
        );
      })
      .slice(0, 20);
  }, [productos, busqueda]);

  // ------------------------------------------------------------
  // AGREGAR AL CARRITO
  // ------------------------------------------------------------
  function agregarProducto(producto) {
    if (producto.stock <= 0) {
      setMensaje({
        tipo: "error",
        texto: `No hay stock disponible para ${producto.products?.name} - ${producto.size}.`,
      });
      return;
    }

    setCarrito((actual) => {
      const existente = actual.find(
        (item) => item.variant_id === producto.id
      );

      if (existente) {
        if (existente.cantidad >= producto.stock) {
          setMensaje({
            tipo: "error",
            texto: `Stock máximo disponible: ${producto.stock}.`,
          });

          return actual;
        }

        return actual.map((item) =>
          item.variant_id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      return [
        ...actual,
        {
          variant_id: producto.id,
          product_id: producto.product_id,
          producto: producto.products?.name || "Producto",
          talla: producto.size || "",
          precio: Number(producto.price || 0),
          cantidad: 1,
          stock: Number(producto.stock || 0),
        },
      ];
    });

    setBusqueda("");
    setMensaje(null);
  }

  // ------------------------------------------------------------
  // CAMBIAR CANTIDAD
  // ------------------------------------------------------------
  function cambiarCantidad(variantId, cantidad) {
    const nuevaCantidad = Number(cantidad);

    if (nuevaCantidad < 1) return;

    setCarrito((actual) =>
      actual.map((item) => {
        if (item.variant_id !== variantId) return item;

        if (nuevaCantidad > item.stock) {
          setMensaje({
            tipo: "error",
            texto: `Stock máximo disponible para ${item.producto} ${item.talla}: ${item.stock}.`,
          });

          return item;
        }

        return {
          ...item,
          cantidad: nuevaCantidad,
        };
      })
    );
  }

  // ------------------------------------------------------------
  // ELIMINAR PRODUCTO
  // ------------------------------------------------------------
  function eliminarProducto(variantId) {
    setCarrito((actual) =>
      actual.filter((item) => item.variant_id !== variantId)
    );
  }

  // ------------------------------------------------------------
  // TOTAL
  // ------------------------------------------------------------
  const total = useMemo(() => {
    return carrito.reduce(
      (suma, item) => suma + item.precio * item.cantidad,
      0
    );
  }, [carrito]);

  function formatoPrecio(valor) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(valor);
  }

  function actualizarCliente(campo, valor) {
    setCliente((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  // ------------------------------------------------------------
  // REGISTRAR VENTA
  // ------------------------------------------------------------
  async function registrarVenta() {
    if (carrito.length === 0) {
      setMensaje({
        tipo: "error",
        texto: "Debes agregar al menos un producto.",
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const items = carrito.map((item) => ({
        variant_id: item.variant_id,
        cantidad: item.cantidad,
        precio: item.precio,
      }));

      const { data, error } = await supabase.rpc(
        "registrar_venta_externa",
        {
          p_tipo_venta: tipoVenta,
          p_nombre: cliente.nombre,
          p_rut: cliente.rut,
          p_correo: cliente.correo,
          p_telefono: cliente.telefono,
          p_observacion: cliente.observacion,
          p_items: items,
          p_medio_pago: medioPago,
          p_vendedor: "Administrador",
        }
      );

      if (error) throw error;

      const resultado = data?.[0];

      setMensaje({
        tipo: "success",
        texto: `Venta Nº ${resultado?.numero_venta || ""} registrada correctamente.`,
      });

      setCarrito([]);

      setCliente({
        nombre: "",
        rut: "",
        correo: "",
        telefono: "",
        observacion: "",
      });

      await cargarProductos();
    } catch (error) {
      console.error("Error registrando venta:", error);

      setMensaje({
        tipo: "error",
        texto:
          error?.message ||
          "No fue posible registrar la venta.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8fc] p-6">

      {/* ENCABEZADO */}
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white shadow-lg">

        <div className="text-xs font-bold uppercase tracking-[0.35em] opacity-90">
          BOUTIQUE PET LOVE ERP
        </div>

        <h1 className="mt-2 text-4xl font-black">
          🛒 Ventas externas
        </h1>

        <p className="mt-2 text-white/90">
          Registra ventas presenciales y ventas realizadas por WhatsApp.
        </p>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div
          className={`mb-6 rounded-2xl border p-4 font-semibold ${
            mensaje.tipo === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {mensaje.tipo === "success" ? "✅ " : "⚠️ "}
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ======================================================
            COLUMNA PRINCIPAL
        ====================================================== */}
        <div className="space-y-6 xl:col-span-2">

          {/* TIPO DE VENTA */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-xl font-black text-slate-900">
              Tipo de venta
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {TIPOS_VENTA.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTipoVenta(tipo.value)}
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    tipoVenta === tipo.value
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 hover:border-pink-300"
                  }`}
                >
                  <div className="text-lg font-black">
                    {tipo.label}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {tipo.value === "presencial"
                      ? "Venta realizada directamente al cliente."
                      : "Venta coordinada por WhatsApp."}
                  </div>
                </button>
              ))}

            </div>
          </section>

          {/* BUSCAR PRODUCTO */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-xl font-black text-slate-900">
              Agregar productos
            </h2>

            <div className="relative">

              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔎 Buscar producto o talla..."
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />

              {busqueda && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">

                  {cargandoProductos ? (
                    <div className="p-5 text-center text-slate-500">
                      Cargando productos...
                    </div>
                  ) : productosFiltrados.length === 0 ? (
                    <div className="p-5 text-center text-slate-500">
                      No se encontraron productos.
                    </div>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <button
                        key={producto.id}
                        type="button"
                        onClick={() => agregarProducto(producto)}
                        disabled={producto.stock <= 0}
                        className={`flex w-full items-center justify-between border-b border-slate-100 p-4 text-left transition last:border-b-0 ${
                          producto.stock <= 0
                            ? "cursor-not-allowed bg-slate-50 opacity-50"
                            : "hover:bg-pink-50"
                        }`}
                      >

                        <div>
                          <div className="font-bold text-slate-900">
                            {producto.products?.name}
                          </div>

                          <div className="text-sm text-slate-500">
                            {producto.size}
                          </div>
                        </div>

                        <div className="text-right">

                          <div className="font-black text-pink-600">
                            {formatoPrecio(producto.price)}
                          </div>

                          <div
                            className={`text-xs font-bold ${
                              producto.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Stock: {producto.stock}
                          </div>

                        </div>

                      </button>
                    ))
                  )}

                </div>
              )}

            </div>
          </section>

          {/* CARRITO */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-black text-slate-900">
                Productos de la venta
              </h2>

              <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-600">
                {carrito.length} producto(s)
              </span>

            </div>

            {carrito.length === 0 ? (

              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">

                <div className="text-5xl">
                  🛒
                </div>

                <p className="mt-3 font-semibold text-slate-500">
                  Aún no has agregado productos.
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Busca un producto arriba para comenzar.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {carrito.map((item) => (

                  <div
                    key={item.variant_id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex-1">

                      <div className="font-black text-slate-900">
                        {item.producto}
                      </div>

                      <div className="text-sm text-slate-500">
                        {item.talla}
                      </div>

                      <div className="mt-1 text-sm font-semibold text-pink-600">
                        {formatoPrecio(item.precio)}
                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          cambiarCantidad(
                            item.variant_id,
                            item.cantidad - 1
                          )
                        }
                        disabled={item.cantidad <= 1}
                        className="h-9 w-9 rounded-xl bg-slate-100 font-black disabled:opacity-40"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.cantidad}
                        onChange={(e) =>
                          cambiarCantidad(
                            item.variant_id,
                            e.target.value
                          )
                        }
                        className="w-16 rounded-xl border border-slate-200 px-2 py-2 text-center font-bold"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          cambiarCantidad(
                            item.variant_id,
                            item.cantidad + 1
                          )
                        }
                        disabled={item.cantidad >= item.stock}
                        className="h-9 w-9 rounded-xl bg-slate-100 font-black disabled:opacity-40"
                      >
                        +
                      </button>

                    </div>

                    <div className="w-28 text-right">

                      <div className="font-black text-slate-900">
                        {formatoPrecio(
                          item.precio * item.cantidad
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarProducto(item.variant_id)
                        }
                        className="mt-1 text-xs font-bold text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

        {/* ======================================================
            COLUMNA DERECHA
        ====================================================== */}
        <div className="space-y-6">

          {/* CLIENTE */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-black text-slate-900">
              👤 Datos del cliente
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                value={cliente.nombre}
                onChange={(e) =>
                  actualizarCliente("nombre", e.target.value)
                }
                placeholder="Nombre del cliente"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-500"
              />

              <input
                type="text"
                value={cliente.rut}
                onChange={(e) =>
                  actualizarCliente("rut", e.target.value)
                }
                placeholder="RUT"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-500"
              />

              <input
                type="email"
                value={cliente.correo}
                onChange={(e) =>
                  actualizarCliente("correo", e.target.value)
                }
                placeholder="Correo electrónico"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-500"
              />

              <input
                type="text"
                value={cliente.telefono}
                onChange={(e) =>
                  actualizarCliente("telefono", e.target.value)
                }
                placeholder="Teléfono / WhatsApp"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-500"
              />

              <textarea
                value={cliente.observacion}
                onChange={(e) =>
                  actualizarCliente("observacion", e.target.value)
                }
                placeholder="Observación..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-500"
              />

            </div>

          </section>

          {/* MEDIO DE PAGO */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-xl font-black text-slate-900">
              💳 Medio de pago
            </h2>

            <div className="space-y-2">

              {MEDIOS_PAGO.map((medio) => (

                <button
                  key={medio.value}
                  type="button"
                  onClick={() => setMedioPago(medio.value)}
                  className={`w-full rounded-2xl border-2 p-4 text-left font-bold transition ${
                    medioPago === medio.value
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-slate-200 text-slate-700 hover:border-pink-300"
                  }`}
                >
                  {medio.label}
                </button>

              ))}

            </div>

          </section>

          {/* RESUMEN */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-black text-slate-900">
              🧾 Resumen
            </h2>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <span className="text-slate-500">
                Productos
              </span>

              <span className="font-bold">
                {carrito.reduce(
                  (suma, item) => suma + item.cantidad,
                  0
                )}
              </span>

            </div>

            <div className="mt-4 flex items-center justify-between">

              <span className="text-lg font-bold text-slate-700">
                TOTAL
              </span>

              <span className="text-3xl font-black text-pink-600">
                {formatoPrecio(total)}
              </span>

            </div>

            <button
              type="button"
              onClick={registrarVenta}
              disabled={
                guardando ||
                carrito.length === 0
              }
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 font-black text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Registrando venta..."
                : "✅ Registrar venta"}
            </button>

          </section>

        </div>

      </div>

    </div>
  );
}

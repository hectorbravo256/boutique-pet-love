import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminCard from "../components/AdminCard";

const MONEDA = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const REGIONES_PAKET = [
  "Región Metropolitana de Santiago",
  "Región de Valparaíso",
  "Región del Libertador General Bernardo O'Higgins",
];

const MEDIOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "debito", label: "Débito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercado_pago", label: "Mercado Pago" },
];

const emptyCliente = {
  nombre: "",
  rut: "",
  correo: "",
  telefono: "",
  direccion: "",
  comuna: "",
  region: "",
};

function formatMoney(value) {
  return MONEDA.format(Number(value || 0));
}

export default function Reservas() {
  const [cliente, setCliente] = useState(emptyCliente);

  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [varianteSeleccionada, setVarianteSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [items, setItems] = useState([]);

  const [empresaEnvio, setEmpresaEnvio] = useState("paket");
  const [envioPorPagar, setEnvioPorPagar] = useState(false);

  const [abono, setAbono] = useState("");
  const [medioPagoAbono, setMedioPagoAbono] = useState("");

  const [vendedor, setVendedor] = useState("");
  const [observacion, setObservacion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [busquedaReserva, setBusquedaReserva] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  
  const [montoNuevoAbono, setMontoNuevoAbono] = useState("");
  const [medioPagoNuevoAbono, setMedioPagoNuevoAbono] = useState("");
  const [observacionNuevoAbono, setObservacionNuevoAbono] = useState("");
  const [guardandoAbono, setGuardandoAbono] = useState(false);

  const [convirtiendoReserva, setConvirtiendoReserva] = useState(false);
  const [mensajeConversion, setMensajeConversion] = useState("");

  const productoActual = useMemo(
    () =>
      productos.find(
        (producto) => String(producto.id) === String(productoSeleccionado)
      ),
    [productos, productoSeleccionado]
  );

  const variantesDisponibles = useMemo(() => {
    if (!productoActual?.product_variants) return [];

    return [...productoActual.product_variants].sort((a, b) =>
      String(a.size).localeCompare(String(b.size), undefined, {
        numeric: true,
      })
    );
  }, [productoActual]);

  const varianteActual = useMemo(
    () =>
      variantesDisponibles.find(
        (variant) =>
          String(variant.id) === String(varianteSeleccionada)
      ),
    [variantesDisponibles, varianteSeleccionada]
  );

  const subtotalProductos = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.precio_unitario || 0) * Number(item.cantidad || 0),
        0
      ),
    [items]
  );

  const costoEnvio = useMemo(() => {
    if (envioPorPagar) return 0;
    return empresaEnvio === "paket" ? 3500 : 0;
  }, [empresaEnvio, envioPorPagar]);

  const total = subtotalProductos + costoEnvio;

  const totalAbonado = Number(abono || 0);
  const saldoPendiente = Math.max(total - totalAbonado, 0);

  useEffect(() => {
    cargarProductos();
    cargarReservas();
  }, []);

  useEffect(() => {
    const region = cliente.region.trim();

    if (!region) return;

    if (REGIONES_PAKET.includes(region)) {
      setEmpresaEnvio("paket");
      setEnvioPorPagar(false);
    } else if (empresaEnvio === "paket") {
      setEmpresaEnvio("starken");
      setEnvioPorPagar(true);
    }
  }, [cliente.region]);

  async function cargarReservas() {
  setLoadingReservas(true);

  const { data, error: reservasError } = await supabase
    .from("reservations")
    .select(`
      id,
      numero_reserva,
      created_at,
      updated_at,
      nombre,
      rut,
      correo,
      telefono,
      direccion,
      comuna,
      region,
      empresa_envio,
      envio_por_pagar,
      costo_envio,
      subtotal_productos,
      total,
      total_abonado,
      saldo_pendiente,
      medio_pago_abono,
      estado,
      vendedor,
      observacion,
      order_id
    `)
    .order("created_at", {
      ascending: false,
    });

  if (reservasError) {
    console.error("Error cargando reservas:", reservasError);

    setError(
      reservasError.message ||
        "No fue posible cargar las reservas."
    );

    setReservas([]);
  } else {
    setReservas(data || []);
  }

  setLoadingReservas(false);
}

  async function abrirDetalleReserva(reserva) {
  setLoadingDetalle(true);
  setError("");

  const { data, error: detalleError } = await supabase
    .from("reservations")
    .select(`
      *,
      reservation_items (
        id,
        product_id,
        variant_id,
        producto,
        talla,
        cantidad,
        precio_unitario,
        subtotal
      ),
      reservation_payments (
        id,
        created_at,
        monto,
        medio_pago,
        observacion,
        created_by
      )
    `)
    .eq("id", reserva.id)
    .single();

  if (detalleError) {
    console.error(
      "Error cargando detalle de reserva:",
      detalleError
    );

    setError(
      detalleError.message ||
        "No fue posible cargar el detalle de la reserva."
    );

    setLoadingDetalle(false);
    return;
  }

  setReservaSeleccionada(data);
  setLoadingDetalle(false);
}
  async function registrarAbono() {
  setError("");
  setMensaje("");

  if (!reservaSeleccionada) return;

  const monto = Number(montoNuevoAbono);
  const saldo = Number(
    reservaSeleccionada.saldo_pendiente || 0
  );

  if (!Number.isFinite(monto) || monto <= 0) {
    setError("Ingresa un monto de abono mayor que $0.");
    return;
  }

  if (monto > saldo) {
    setError(
      `El abono no puede superar el saldo pendiente de ${formatMoney(
        saldo
      )}.`
    );
    return;
  }

  if (!medioPagoNuevoAbono) {
    setError("Selecciona el medio de pago del abono.");
    return;
  }

  if (
    ["convertida", "cancelada"].includes(
      reservaSeleccionada.estado
    )
  ) {
    setError(
      "Esta reserva no permite registrar nuevos abonos."
    );
    return;
  }

  setGuardandoAbono(true);

  try {
    const { data, error: rpcError } =
      await supabase.rpc(
        "registrar_abono_reserva",
        {
          p_reservation_id: reservaSeleccionada.id,
          p_monto: monto,
          p_medio_pago: medioPagoNuevoAbono,
          p_observacion:
            observacionNuevoAbono.trim() || null,
          p_created_by:
            reservaSeleccionada.vendedor || null,
        }
      );

    if (rpcError) {
      console.error(
        "Error registrar_abono_reserva:",
        rpcError
      );

      throw new Error(
        rpcError.message ||
          "No fue posible registrar el abono."
      );
    }

    const resultado = Array.isArray(data)
      ? data[0]
      : data;

    setMontoNuevoAbono("");
    setMedioPagoNuevoAbono("");
    setObservacionNuevoAbono("");

    await cargarReservas();
    await abrirDetalleReserva(reservaSeleccionada);

    if (resultado?.estado === "pagada") {
      setMensaje(
        `Abono de ${formatMoney(
          monto
        )} registrado correctamente. La reserva #${
          reservaSeleccionada.numero_reserva
        } quedó completamente pagada.`
      );
    } else {
      setMensaje(
        `Abono de ${formatMoney(
          monto
        )} registrado correctamente en la reserva #${
          reservaSeleccionada.numero_reserva
        }.`
      );
    }
  } catch (err) {
    console.error(err);

    setError(
      err?.message ||
        "Ocurrió un error al registrar el abono."
    );
  } finally {
    setGuardandoAbono(false);
  }
}

async function convertirReserva() {
  setError("");
  setMensaje("");
  setMensajeConversion("");

  if (!reservaSeleccionada) return;

  const saldo = Number(
    reservaSeleccionada.saldo_pendiente || 0
  );

  if (saldo > 0.01) {
    setMensajeConversion(
      "La reserva debe estar completamente pagada antes de convertirse en venta."
    );
    return;
  }

  if (
    ["convertida", "cancelada"].includes(
      reservaSeleccionada.estado
    )
  ) {
    setMensajeConversion(
      "Esta reserva no puede convertirse."
    );
    return;
  }

  const confirmar = window.confirm(
    `¿Confirmar conversión de la reserva #${reservaSeleccionada.numero_reserva} a venta definitiva?\n\n` +
      "Se generará la venta y se descontará el stock."
  );

  if (!confirmar) return;

  setConvirtiendoReserva(true);

  try {
    const { data, error: rpcError } =
      await supabase.rpc(
        "convertir_reserva_a_venta",
        {
          p_reservation_id:
            reservaSeleccionada.id,
        }
      );

    if (rpcError) {
      console.error(
        "Error convertir_reserva_a_venta:",
        rpcError
      );

      throw new Error(
        rpcError.message ||
          "No fue posible convertir la reserva."
      );
    }

    const resultado = Array.isArray(data)
      ? data[0]
      : data;

    if (!resultado) {
      throw new Error(
        "Supabase no devolvió los datos de la venta."
      );
    }

    setMensajeConversion(
      `Reserva #${resultado.numero_reserva} convertida correctamente. Venta #${resultado.numero_venta} creada.`
    );

    await cargarReservas();
    await abrirDetalleReserva(reservaSeleccionada);
  } catch (err) {
    console.error(err);

    setMensajeConversion(
      err?.message ||
        "Ocurrió un error al convertir la reserva."
    );
  } finally {
    setConvirtiendoReserva(false);
  }
}
 
function limpiarFormularioAbono() {
  setMontoNuevoAbono("");
  setMedioPagoNuevoAbono("");
  setObservacionNuevoAbono("");
}
  
  async function cargarProductos() {
    setLoadingProductos(true);
    setError("");

    const { data, error: productosError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        active,
        product_variants (
          id,
          size,
          price,
          stock
        )
      `)
      .eq("active", true)
      .order("name");

    if (productosError) {
      console.error(productosError);
      setError("No fue posible cargar los productos.");
      setProductos([]);
    } else {
      setProductos(data || []);
    }

    setLoadingProductos(false);
  }

  function handleClienteChange(event) {
    const { name, value } = event.target;

    setCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function seleccionarProducto(value) {
    setProductoSeleccionado(value);
    setVarianteSeleccionada("");
    setCantidad(1);
  }

  function agregarProducto() {
    setError("");
    setMensaje("");

    if (!productoActual) {
      setError("Selecciona un producto.");
      return;
    }

    if (!varianteActual) {
      setError("Selecciona una talla.");
      return;
    }

    const cantidadAgregar = Number(cantidad);

    if (!Number.isInteger(cantidadAgregar) || cantidadAgregar <= 0) {
      setError("La cantidad debe ser un número entero mayor que 0.");
      return;
    }

    if (Number(varianteActual.stock || 0) <= 0) {
      setError("La talla seleccionada no tiene stock disponible.");
      return;
    }

    const itemExistente = items.find(
      (item) =>
        String(item.variant_id) === String(varianteActual.id)
    );

    const cantidadFinal =
      Number(itemExistente?.cantidad || 0) + cantidadAgregar;

    if (cantidadFinal > Number(varianteActual.stock || 0)) {
      setError(
        `No puedes reservar más de ${varianteActual.stock} unidad(es) de esta talla.`
      );
      return;
    }

    if (itemExistente) {
      setItems((prev) =>
        prev.map((item) =>
          String(item.variant_id) === String(varianteActual.id)
            ? {
                ...item,
                cantidad: cantidadFinal,
              }
            : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          variant_id: varianteActual.id,
          product_id: productoActual.id,
          producto: productoActual.name,
          talla: varianteActual.size,
          cantidad: cantidadAgregar,
          precio_unitario: Number(varianteActual.price || 0),
          stock: Number(varianteActual.stock || 0),
        },
      ]);
    }

    setProductoSeleccionado("");
    setVarianteSeleccionada("");
    setCantidad(1);
  }

  function cambiarCantidadItem(variantId, nuevaCantidad) {
    const cantidadNueva = Number(nuevaCantidad);

    if (!Number.isInteger(cantidadNueva)) return;

    setItems((prev) =>
      prev
        .map((item) => {
          if (String(item.variant_id) !== String(variantId)) {
            return item;
          }

          if (cantidadNueva <= 0) {
            return null;
          }

          if (cantidadNueva > Number(item.stock || 0)) {
            return {
              ...item,
              cantidad: Number(item.stock || 0),
            };
          }

          return {
            ...item,
            cantidad: cantidadNueva,
          };
        })
        .filter(Boolean)
    );
  }

  function eliminarItem(variantId) {
    setItems((prev) =>
      prev.filter(
        (item) => String(item.variant_id) !== String(variantId)
      )
    );
  }

  function seleccionarEnvio(empresa, porPagar) {
    setEmpresaEnvio(empresa);
    setEnvioPorPagar(porPagar);
  }

  function validarFormulario() {
    if (!cliente.nombre.trim()) {
      return "Ingresa el nombre del cliente.";
    }

    if (!cliente.telefono.trim()) {
      return "Ingresa el teléfono del cliente.";
    }

    if (!cliente.direccion.trim()) {
      return "Ingresa la dirección del cliente.";
    }

    if (!cliente.comuna.trim()) {
      return "Ingresa la comuna del cliente.";
    }

    if (!cliente.region.trim()) {
      return "Selecciona o ingresa la región del cliente.";
    }

    if (items.length === 0) {
      return "Debes agregar al menos un producto a la reserva.";
    }

    if (empresaEnvio === "paket" && envioPorPagar) {
      return "PAKET no puede quedar configurado como envío por pagar.";
    }

    if (
      envioPorPagar &&
      !["starken", "bluexpress"].includes(empresaEnvio)
    ) {
      return "Para envío por pagar debes seleccionar STARKEN o BLUEXPRESS.";
    }

    if (!envioPorPagar && empresaEnvio !== "paket") {
      return "El envío pagado debe utilizar PAKET.";
    }

    if (totalAbonado < 0) {
      return "El abono no puede ser negativo.";
    }

    if (totalAbonado > total) {
      return "El abono no puede superar el total de la reserva.";
    }

    if (totalAbonado > 0 && !medioPagoAbono) {
      return "Selecciona el medio de pago utilizado para el abono.";
    }

    return null;
  }

  async function crearReserva(event) {
    event.preventDefault();

    setError("");
    setMensaje("");

    const validacion = validarFormulario();

    if (validacion) {
      setError(validacion);
      return;
    }

    setGuardando(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "crear_reserva",
        {
          p_nombre: cliente.nombre.trim(),
          p_rut: cliente.rut.trim() || null,
          p_correo: cliente.correo.trim() || null,
          p_telefono: cliente.telefono.trim(),
          p_direccion: cliente.direccion.trim(),
          p_comuna: cliente.comuna.trim(),
          p_region: cliente.region.trim(),
          p_empresa_envio: empresaEnvio,
          p_envio_por_pagar: envioPorPagar,
          p_items: items.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.cantidad,
          })),
          p_abono: totalAbonado,
          p_medio_pago_abono:
            totalAbonado > 0 ? medioPagoAbono : null,
          p_vendedor: vendedor.trim() || null,
          p_observacion: observacion.trim() || null,
        }
      );

      if (rpcError) {
        console.error("Error crear_reserva:", rpcError);
        throw new Error(
          rpcError.message || "No fue posible crear la reserva."
        );
      }

      const reserva = Array.isArray(data) ? data[0] : data;

      setMensaje(
        `Reserva ${
          reserva?.numero_reserva || ""
        } creada correctamente. Total: ${formatMoney(
          reserva?.total ?? total
        )}. Saldo pendiente: ${formatMoney(
          reserva?.saldo_pendiente ?? saldoPendiente
        )}.`
      );

      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Ocurrió un error al crear la reserva."
      );
    } finally {
      setGuardando(false);
    }
  }

  function limpiarFormulario() {
    setCliente(emptyCliente);
    setProductoSeleccionado("");
    setVarianteSeleccionada("");
    setCantidad(1);
    setItems([]);
    setEmpresaEnvio("paket");
    setEnvioPorPagar(false);
    setAbono("");
    setMedioPagoAbono("");
    setVendedor("");
    setObservacion("");
  }

  const reservasFiltradas = reservas.filter((reserva) => {
  const texto = busquedaReserva.trim().toLowerCase();

  const coincideBusqueda =
    !texto ||
    String(reserva.numero_reserva || "")
      .toLowerCase()
      .includes(texto) ||
    String(reserva.nombre || "")
      .toLowerCase()
      .includes(texto) ||
    String(reserva.rut || "")
      .toLowerCase()
      .includes(texto) ||
    String(reserva.telefono || "")
      .toLowerCase()
      .includes(texto);

  const coincideEstado =
    filtroEstado === "todos" ||
    reserva.estado === filtroEstado;

  return coincideBusqueda && coincideEstado;
});

  function estadoLabel(estado) {
  const estados = {
    reservada: "Reservada",
    abono_parcial: "Abono parcial",
    pagada: "Pagada",
    lista_entrega: "Lista para entrega",
    convertida: "Convertida en venta",
    cancelada: "Cancelada",
  };

  return estados[estado] || estado || "Sin estado";
}

function estadoClasses(estado) {
  const clases = {
    reservada:
      "bg-blue-100 text-blue-700",
    abono_parcial:
      "bg-amber-100 text-amber-700",
    pagada:
      "bg-green-100 text-green-700",
    lista_entrega:
      "bg-purple-100 text-purple-700",
    convertida:
      "bg-emerald-100 text-emerald-700",
    cancelada:
      "bg-red-100 text-red-700",
  };

  return (
    clases[estado] ||
    "bg-gray-100 text-gray-700"
  );
}

  return (
    <div className="space-y-6 pb-10">
      <AdminCard>
  <div className="space-y-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Reservas registradas
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Consulta y revisa las reservas existentes.
        </p>
      </div>

      <div className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700">
        {reservasFiltradas.length} reserva
        {reservasFiltradas.length === 1 ? "" : "s"}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Buscar
        </label>

        <input
          type="text"
          value={busquedaReserva}
          onChange={(event) =>
            setBusquedaReserva(event.target.value)
          }
          placeholder="Nº reserva, nombre, RUT o teléfono..."
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Estado
        </label>

        <select
          value={filtroEstado}
          onChange={(event) =>
            setFiltroEstado(event.target.value)
          }
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        >
          <option value="todos">
            Todos los estados
          </option>

          <option value="reservada">
            Reservada
          </option>

          <option value="abono_parcial">
            Abono parcial
          </option>

          <option value="pagada">
            Pagada
          </option>

          <option value="lista_entrega">
            Lista para entrega
          </option>

          <option value="convertida">
            Convertida en venta
          </option>

          <option value="cancelada">
            Cancelada
          </option>
        </select>
      </div>
    </div>

    {loadingReservas ? (
      <div className="rounded-xl bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
        Cargando reservas...
      </div>
    ) : reservasFiltradas.length === 0 ? (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
        <div className="text-3xl">📋</div>

        <p className="mt-2 font-semibold text-gray-700">
          No hay reservas para mostrar
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Prueba modificando los filtros o crea una nueva reserva.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Reserva
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Cliente
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Fecha
              </th>

              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Total
              </th>

              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Saldo
              </th>

              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Estado
              </th>

              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Acción
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {reservasFiltradas.map((reserva) => (
              <tr
                key={reserva.id}
                className="hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-bold text-gray-800">
                    #{reserva.numero_reserva}
                  </div>

                  <div className="text-xs text-gray-400">
                    ID {reserva.id}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-800">
                    {reserva.nombre}
                  </div>

                  <div className="text-xs text-gray-500">
                    {reserva.telefono}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {new Date(
                    reserva.created_at
                  ).toLocaleDateString("es-CL")}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                  {formatMoney(reserva.total)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <span
                    className={
                      Number(reserva.saldo_pendiente) > 0
                        ? "font-semibold text-amber-600"
                        : "font-semibold text-green-600"
                    }
                  >
                    {formatMoney(
                      reserva.saldo_pendiente
                    )}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoClasses(
                      reserva.estado
                    )}`}
                  >
                    {estadoLabel(reserva.estado)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      abrirDetalleReserva(reserva)
                    }
                    className="rounded-lg bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-700 transition hover:bg-pink-100"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</AdminCard>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Reservas
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra reservas de clientes, abonos y saldos pendientes.
        </p>
      </div>

      {mensaje && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={crearReserva}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <AdminCard>
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    1. Datos del cliente
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Estos datos quedarán asociados a la futura venta.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nombre *
                    </label>

                    <input
                      type="text"
                      name="nombre"
                      value={cliente.nombre}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      RUT
                    </label>

                    <input
                      type="text"
                      name="rut"
                      value={cliente.rut}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="12.345.678-9"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Teléfono *
                    </label>

                    <input
                      type="tel"
                      name="telefono"
                      value={cliente.telefono}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="+56 9..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Correo
                    </label>

                    <input
                      type="email"
                      name="correo"
                      value={cliente.correo}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="cliente@correo.cl"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Comuna *
                    </label>

                    <input
                      type="text"
                      name="comuna"
                      value={cliente.comuna}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="Ej: Lampa"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Dirección *
                    </label>

                    <input
                      type="text"
                      name="direccion"
                      value={cliente.direccion}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="Calle, número, departamento, etc."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Región *
                    </label>

                    <select
                      name="region"
                      value={cliente.region}
                      onChange={handleClienteChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    >
                      <option value="">
                        Selecciona una región
                      </option>
                    
                      <option value="Región de Arica y Parinacota">
                        Región de Arica y Parinacota
                      </option>
                    
                      <option value="Región de Tarapacá">
                        Región de Tarapacá
                      </option>
                    
                      <option value="Región de Antofagasta">
                        Región de Antofagasta
                      </option>
                    
                      <option value="Región de Atacama">
                        Región de Atacama
                      </option>
                    
                      <option value="Región de Coquimbo">
                        Región de Coquimbo
                      </option>
                    
                      <option value="Región de Valparaíso">
                        Región de Valparaíso
                      </option>
                    
                      <option value="Región Metropolitana de Santiago">
                        Región Metropolitana de Santiago
                      </option>
                    
                      <option value="Región del Libertador General Bernardo O'Higgins">
                        Región del Libertador General Bernardo O'Higgins
                      </option>
                    
                      <option value="Región del Maule">
                        Región del Maule
                      </option>
                    
                      <option value="Región de Ñuble">
                        Región de Ñuble
                      </option>
                    
                      <option value="Región del Biobío">
                        Región del Biobío
                      </option>
                    
                      <option value="Región de La Araucanía">
                        Región de La Araucanía
                      </option>
                    
                      <option value="Región de Los Ríos">
                        Región de Los Ríos
                      </option>
                    
                      <option value="Región de Los Lagos">
                        Región de Los Lagos
                      </option>
                    
                      <option value="Región de Aysén del General Carlos Ibáñez del Campo">
                        Región de Aysén del General Carlos Ibáñez del Campo
                      </option>
                    
                      <option value="Región de Magallanes y de la Antártica Chilena">
                        Región de Magallanes y de la Antártica Chilena
                      </option>
                    </select>

                    <p className="mt-1 text-xs text-gray-500">
                      En RM, Valparaíso y O'Higgins se selecciona PAKET
                      automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    2. Despacho
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Selecciona la empresa y modalidad de envío.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() =>
                      seleccionarEnvio("paket", false)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      empresaEnvio === "paket" &&
                      !envioPorPagar
                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                        : "border-gray-200 bg-white hover:border-pink-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-800">
                      PAKET
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      Envío pagado
                    </div>

                    <div className="mt-2 font-bold text-pink-600">
                      $3.500
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      seleccionarEnvio("starken", true)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      empresaEnvio === "starken" &&
                      envioPorPagar
                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                        : "border-gray-200 bg-white hover:border-pink-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-800">
                      STARKEN
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      Por pagar
                    </div>

                    <div className="mt-2 font-bold text-gray-700">
                      $0
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      seleccionarEnvio("bluexpress", true)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      empresaEnvio === "bluexpress" &&
                      envioPorPagar
                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                        : "border-gray-200 bg-white hover:border-pink-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-800">
                      BLUEXPRESS
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      Por pagar
                    </div>

                    <div className="mt-2 font-bold text-gray-700">
                      $0
                    </div>
                  </button>
                </div>

                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {envioPorPagar
                    ? `El cliente pagará directamente el envío a ${empresaEnvio.toUpperCase()} al recibir el pedido.`
                    : "El costo de despacho PAKET de $3.500 se suma al total de la reserva."}
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    3. Productos de la reserva
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Selecciona producto, talla y cantidad.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Producto
                    </label>

                    <select
                      value={productoSeleccionado}
                      onChange={(event) =>
                        seleccionarProducto(event.target.value)
                      }
                      disabled={loadingProductos}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    >
                      <option value="">
                        {loadingProductos
                          ? "Cargando productos..."
                          : "Seleccionar producto"}
                      </option>

                      {productos.map((producto) => (
                        <option
                          key={producto.id}
                          value={producto.id}
                        >
                          {producto.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Talla
                    </label>

                    <select
                      value={varianteSeleccionada}
                      onChange={(event) =>
                        setVarianteSeleccionada(event.target.value)
                      }
                      disabled={!productoActual}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    >
                      <option value="">
                        Seleccionar talla
                      </option>

                      {variantesDisponibles.map((variant) => (
                        <option
                          key={variant.id}
                          value={variant.id}
                          disabled={Number(variant.stock || 0) <= 0}
                        >
                          Talla {variant.size} · Stock{" "}
                          {variant.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Cantidad
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={varianteActual?.stock || undefined}
                      value={cantidad}
                      onChange={(event) =>
                        setCantidad(event.target.value)
                      }
                      disabled={!varianteActual}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    />
                  </div>

                  <div className="flex items-end md:col-span-2">
                    <button
                      type="button"
                      onClick={agregarProducto}
                      className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                {varianteActual && (
                  <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Precio actual:{" "}
                    <strong>
                      {formatMoney(varianteActual.price)}
                    </strong>
                    {" · "}
                    Stock físico:{" "}
                    <strong>{varianteActual.stock}</strong>
                  </div>
                )}

                {items.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Producto
                          </th>

                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Talla
                          </th>

                          <th className="px-4 py-3 text-center font-semibold text-gray-600">
                            Cant.
                          </th>

                          <th className="px-4 py-3 text-right font-semibold text-gray-600">
                            Precio
                          </th>

                          <th className="px-4 py-3 text-right font-semibold text-gray-600">
                            Subtotal
                          </th>

                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 bg-white">
                        {items.map((item) => (
                          <tr key={item.variant_id}>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {item.producto}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {item.talla}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.cantidad}
                                onChange={(event) =>
                                  cambiarCantidadItem(
                                    item.variant_id,
                                    event.target.value
                                  )
                                }
                                className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-center"
                              />
                            </td>

                            <td className="px-4 py-3 text-right text-gray-600">
                              {formatMoney(item.precio_unitario)}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                              {formatMoney(
                                item.precio_unitario *
                                  item.cantidad
                              )}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  eliminarItem(item.variant_id)
                                }
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    Todavía no has agregado productos a la reserva.
                  </div>
                )}

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <strong>Importante:</strong> crear la reserva no
                  descuenta stock físico. El stock se descontará
                  solamente cuando la reserva sea convertida en una
                  venta definitiva.
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    4. Abono y observaciones
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    El abono es opcional.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Abono
                    </label>

                    <input
                      type="number"
                      min="0"
                      max={total}
                      value={abono}
                      onChange={(event) =>
                        setAbono(event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Medio de pago del abono
                    </label>

                    <select
                      value={medioPagoAbono}
                      onChange={(event) =>
                        setMedioPagoAbono(event.target.value)
                      }
                      disabled={totalAbonado <= 0}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    >
                      <option value="">
                        Seleccionar medio de pago
                      </option>

                      {MEDIOS_PAGO.map((medio) => (
                        <option
                          key={medio.value}
                          value={medio.value}
                        >
                          {medio.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Vendedor
                    </label>

                    <input
                      type="text"
                      value={vendedor}
                      onChange={(event) =>
                        setVendedor(event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="Nombre del vendedor"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Observación
                    </label>

                    <input
                      type="text"
                      value={observacion}
                      onChange={(event) =>
                        setObservacion(event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      placeholder="Notas de la reserva"
                    />
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <AdminCard>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Resumen de reserva
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Revisa los valores antes de crearla.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Productos
                      </span>

                      <span className="font-medium text-gray-800">
                        {formatMoney(subtotalProductos)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Envío
                      </span>

                      <span className="font-medium text-gray-800">
                        {envioPorPagar
                          ? "Por pagar"
                          : formatMoney(costoEnvio)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                          Total
                        </span>

                        <span className="text-xl font-bold text-pink-600">
                          {formatMoney(total)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Abonado
                      </span>

                      <span className="font-semibold text-green-600">
                        {formatMoney(totalAbonado)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3">
                      <span className="font-semibold text-gray-700">
                        Saldo pendiente
                      </span>

                      <span className="font-bold text-gray-900">
                        {formatMoney(saldoPendiente)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm text-purple-800">
                    <div className="font-semibold">
                      Estado inicial
                    </div>

                    <div className="mt-1">
                      {totalAbonado <= 0
                        ? "Reservada"
                        : totalAbonado >= total
                        ? "Pagada"
                        : "Abono parcial"}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {guardando
                      ? "Creando reserva..."
                      : "Crear reserva"}
                  </button>

                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    disabled={guardando}
                    className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    Limpiar formulario
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    La reserva no descuenta stock físico.
                  </p>
                </div>
              </AdminCard>
            </div>
          </div>
        </div>
      </form>
    {reservaSeleccionada && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 sm:p-6">
    <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
  <div>
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-bold text-gray-900">
        Reserva #{reservaSeleccionada.numero_reserva}
      </h2>

      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoClasses(
          reservaSeleccionada.estado
        )}`}
      >
        {estadoLabel(reservaSeleccionada.estado)}
      </span>
    </div>

    <p className="mt-1 text-sm text-gray-500">
      {new Date(
        reservaSeleccionada.created_at
      ).toLocaleString("es-CL")}
    </p>
  </div>
</div>

        </div>

        <button
          type="button"
          onClick={() =>
            setReservaSeleccionada(null)
          }
          className="rounded-full bg-gray-100 px-3 py-2 text-gray-600 hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      {loadingDetalle ? (
        <div className="px-6 py-12 text-center text-gray-500">
          Cargando detalle...
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
  <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminCard>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">
                  Datos del cliente
                </h3>

                <div>
                  <div className="text-xs text-gray-400">
                    Nombre
                  </div>

                  <div className="font-medium text-gray-800">
                    {reservaSeleccionada.nombre}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    RUT
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.rut || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    Teléfono
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.telefono}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    Correo
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.correo || "—"}
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">
                  Despacho
                </h3>

                <div>
                  <div className="text-xs text-gray-400">
                    Dirección
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.direccion}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    Comuna
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.comuna}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    Región
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.region}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Empresa
                  </span>

                  <span className="font-semibold uppercase text-gray-800">
                    {reservaSeleccionada.empresa_envio}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Modalidad
                  </span>

                  <span className="font-semibold text-gray-800">
                    {reservaSeleccionada.envio_por_pagar
                      ? "Por pagar"
                      : formatMoney(
                          reservaSeleccionada.costo_envio
                        )}
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminCard>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">
                Productos
              </h3>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Producto
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Talla
                      </th>

                      <th className="px-4 py-3 text-center font-semibold text-gray-600">
                        Cantidad
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-gray-600">
                        Precio
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-gray-600">
                        Subtotal
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {(reservaSeleccionada.reservation_items || []).map(
                      (item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.producto}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {item.talla}
                          </td>

                          <td className="px-4 py-3 text-center text-gray-700">
                            {item.cantidad}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatMoney(
                              item.precio_unitario
                            )}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            {formatMoney(item.subtotal)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AdminCard>
              <div>
                <div className="text-sm text-gray-500">
                  Total productos
                </div>

                <div className="mt-1 text-xl font-bold text-gray-800">
                  {formatMoney(
                    reservaSeleccionada.subtotal_productos
                  )}
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div>
                <div className="text-sm text-gray-500">
                  Total reserva
                </div>

                <div className="mt-1 text-xl font-bold text-pink-600">
                  {formatMoney(
                    reservaSeleccionada.total
                  )}
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div>
                <div className="text-sm text-gray-500">
                  Saldo pendiente
                </div>

                <div
                  className={`mt-1 text-xl font-bold ${
                    Number(
                      reservaSeleccionada.saldo_pendiente
                    ) > 0
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                >
                  {formatMoney(
                    reservaSeleccionada.saldo_pendiente
                  )}
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  Pagos / Abonos
                </h3>

                <span className="font-bold text-green-600">
                  {formatMoney(
                    reservaSeleccionada.total_abonado
                  )}
                </span>
              </div>

              {Number(reservaSeleccionada.saldo_pendiente || 0) > 0 &&
!["convertida", "cancelada"].includes(
  reservaSeleccionada.estado
) ? (
  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
    <div className="mb-3">
      <h4 className="font-semibold text-green-800">
        Agregar abono
      </h4>

      <p className="mt-1 text-xs text-green-700">
        Saldo pendiente:{" "}
        <strong>
          {formatMoney(
            reservaSeleccionada.saldo_pendiente
          )}
        </strong>
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Monto
        </label>

        <input
          type="number"
          min="1"
          step="1"
          max={Number(
            reservaSeleccionada.saldo_pendiente || 0
          )}
          value={montoNuevoAbono}
          onChange={(event) =>
            setMontoNuevoAbono(event.target.value)
          }
          placeholder="Ej. 10000"
          disabled={guardandoAbono}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Medio de pago
        </label>

        <select
          value={medioPagoNuevoAbono}
          onChange={(event) =>
            setMedioPagoNuevoAbono(event.target.value)
          }
          disabled={guardandoAbono}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
        >
          <option value="">
            Seleccionar...
          </option>

          {MEDIOS_PAGO.map((medio) => (
            <option
              key={medio.value}
              value={medio.value}
            >
              {medio.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Observación
        </label>

        <input
          type="text"
          value={observacionNuevoAbono}
          onChange={(event) =>
            setObservacionNuevoAbono(
              event.target.value
            )
          }
          placeholder="Ej. Abono cliente"
          disabled={guardandoAbono}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
        />
      </div>
    </div>

    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={limpiarFormularioAbono}
        disabled={guardandoAbono}
        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        Limpiar
      </button>

      <button
        type="button"
        onClick={registrarAbono}
        disabled={guardandoAbono}
        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {guardandoAbono
          ? "Registrando..."
          : "Registrar abono"}
      </button>
    </div>
  </div>
) : null}

              {(
                reservaSeleccionada.reservation_payments || []
              ).length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                  Esta reserva todavía no registra abonos.
                </div>
              ) : (
                <div className="space-y-2">
                  {reservaSeleccionada.reservation_payments.map(
                    (pago) => (
                      <div
                        key={pago.id}
                        className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {formatMoney(pago.monto)}
                          </div>

                          <div className="text-xs text-gray-500">
                            {pago.medio_pago}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          {new Date(
                            pago.created_at
                          ).toLocaleString("es-CL")}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">
                Información adicional
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <div className="text-xs text-gray-400">
                    Estado
                  </div>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoClasses(
                      reservaSeleccionada.estado
                    )}`}
                  >
                    {estadoLabel(
                      reservaSeleccionada.estado
                    )}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    Vendedor
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.vendedor || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">
                    Venta asociada
                  </div>

                  <div className="text-gray-700">
                    {reservaSeleccionada.order_id
                      ? `Orden #${reservaSeleccionada.order_id}`
                      : "Todavía no convertida"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">
                  Observación
                </div>

                <div className="mt-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {reservaSeleccionada.observacion ||
                    "Sin observaciones."}
                </div>  
              </div>

              {reservaSeleccionada &&
  reservaSeleccionada.estado !== "convertida" &&
  reservaSeleccionada.estado !== "cancelada" && (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-green-900">
          Convertir en venta definitiva
        </h3>

        <p className="mt-1 text-sm text-green-800">
          Esta operación genera la venta, descuenta el stock y registra
          automáticamente el movimiento de inventario.
        </p>
      </div>

      <div className="mb-4 rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Saldo pendiente
          </span>

          <span className="font-bold text-gray-900">
            ${Number(
              reservaSeleccionada.saldo_pendiente || 0
            ).toLocaleString("es-CL")}
          </span>
        </div>
      </div>

      {Number(reservaSeleccionada.saldo_pendiente || 0) > 0.01 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>No disponible:</strong> esta reserva debe estar
          completamente pagada antes de convertirse en venta.
        </div>
      ) : (
        <button
          type="button"
          onClick={convertirReserva}
          disabled={convirtiendoReserva}
          className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {convirtiendoReserva
            ? "Convirtiendo reserva..."
            : "Convertir en venta"}
        </button>
      )}

      {mensajeConversion && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          {mensajeConversion}
        </div>
      )}
    </div>
  )}
              
            </div>
          </AdminCard>
</div>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}

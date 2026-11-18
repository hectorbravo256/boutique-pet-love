
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

const DIAS = [
  ["Lunes", 1],
  ["Martes", 2],
  ["Miércoles", 3],
  ["Jueves", 4],
  ["Viernes", 5],
  ["Sábado", 6],
  ["Domingo", 7],
];

export default function PaketSettingsPage() {
  const [config, setConfig] = useState(null);
  const [excepciones, setExcepciones] = useState([]);
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function cargarDatos() {
    setCargando(true);

    const [configResult, excepcionesResult] = await Promise.all([
      supabase
        .from("paket_shipping_settings")
        .select("*")
        .eq("id", 1)
        .single(),
      supabase
        .from("paket_shipping_exceptions")
        .select("*")
        .order("date", { ascending: true }),
    ]);

    if (configResult.error || excepcionesResult.error) {
      setMensaje(
        configResult.error?.message ||
        excepcionesResult.error?.message
      );
    } else {
      setConfig(configResult.data);
      setExcepciones(excepcionesResult.data || []);
    }

    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function cambiarDia(dia) {
    setConfig((anterior) => ({
      ...anterior,
      pickup_weekdays: anterior.pickup_weekdays.includes(dia)
        ? anterior.pickup_weekdays.filter((d) => d !== dia)
        : [...anterior.pickup_weekdays, dia],
    }));
  }

  async function guardarConfiguracion(e) {
    e.preventDefault();

    if (!config.pickup_weekdays.length) {
      setMensaje("Debes seleccionar al menos un día de retiro.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    const { error } = await supabase
      .from("paket_shipping_settings")
      .update({
        enabled: config.enabled,
        cutoff: config.cutoff,
        pickup_weekdays: [...config.pickup_weekdays].sort(
          (a, b) => a - b
        ),
        preparation_days: Number(config.preparation_days),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setGuardando(false);

    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Configuración guardada correctamente.");
    }
  }

  async function agregarExcepcion(e) {
    e.preventDefault();

    if (!fecha || !motivo.trim()) return;

    setGuardando(true);

    const { error } = await supabase
      .from("paket_shipping_exceptions")
      .insert({
        date: fecha,
        reason: motivo.trim(),
      });

    setGuardando(false);

    if (error) {
      setMensaje("Error: " + error.message);
      return;
    }

    setFecha("");
    setMotivo("");
    await cargarDatos();
    setMensaje("Fecha bloqueada correctamente.");
  }

  async function eliminarExcepcion(fechaEliminar) {
    if (!window.confirm("¿Eliminar esta fecha bloqueada?")) {
      return;
    }

    const { error } = await supabase
      .from("paket_shipping_exceptions")
      .delete()
      .eq("date", fechaEliminar);

    if (error) {
      setMensaje("Error: " + error.message);
      return;
    }

    await cargarDatos();
    setMensaje("Fecha desbloqueada correctamente.");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link
            to="/admin/inventario/paket"
            className="text-pink-600 font-semibold text-sm"
          >
            ← Volver a PAKET
          </Link>

          <h1 className="text-3xl font-black text-slate-900 mt-4">
            Configuración de despachos PAKET
          </h1>

          <p className="text-slate-500 mt-2">
            Administra los horarios, días de retiro y fechas
            excepcionales de Boutique Pet Love.
          </p>
        </div>

        {mensaje && (
          <div
            role="alert"
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            {mensaje}
          </div>
        )}

        {cargando ? (
          <p>Cargando configuración...</p>
        ) : !config ? (
          <p>No fue posible cargar la configuración.</p>
        ) : (
          <>
            <form
              onSubmit={guardarConfiguracion}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6"
            >
              <h2 className="text-xl font-bold">
                Reglas de despacho
              </h2>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      enabled: e.target.checked,
                    })
                  }
                  className="accent-pink-600 w-5 h-5"
                />
                <span className="font-semibold">
                  Servicio PAKET habilitado
                </span>
              </label>

              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="block text-sm font-semibold mb-2">
                    Horario de corte
                  </span>

                  <input
                    type="time"
                    required
                    value={config.cutoff}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cutoff: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold mb-2">
                    Días hábiles adicionales de preparación
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={config.preparation_days}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        preparation_days: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </label>
              </div>

              <div>
                <h3 className="font-bold mb-3">
                  Días disponibles para retiro
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DIAS.map(([nombre, numero]) => (
                    <label
                      key={numero}
                      className="flex items-center gap-2 border rounded-xl p-3"
                    >
                      <input
                        type="checkbox"
                        checked={config.pickup_weekdays.includes(
                          numero
                        )}
                        onChange={() => cambiarDia(numero)}
                        className="accent-pink-600"
                      />
                      <span>{nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Zona horaria: America/Santiago
              </p>

              <button
                type="submit"
                disabled={guardando}
                className="bg-pink-600 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50"
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar configuración"}
              </button>
            </form>

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold">
                  Feriados y fechas sin retiro
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Registra las fechas en que PAKET no realizará
                  retiros. Los feriados aún no se cargan
                  automáticamente.
                </p>
              </div>

              <form
                onSubmit={agregarExcepcion}
                className="grid md:grid-cols-3 gap-3"
              >
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="border rounded-xl p-3"
                />

                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Motivo del bloqueo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="border rounded-xl p-3"
                />

                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-slate-900 text-white font-bold rounded-xl p-3 disabled:opacity-50"
                >
                  Agregar fecha
                </button>
              </form>

              <div className="divide-y divide-slate-100">
                {excepciones.length === 0 ? (
                  <p className="text-slate-500 text-sm py-3">
                    No hay fechas bloqueadas.
                  </p>
                ) : (
                  excepciones.map((item) => (
                    <div
                      key={item.date}
                      className="flex justify-between items-center gap-4 py-3"
                    >
                      <div>
                        <strong>{item.date}</strong>
                        <p className="text-sm text-slate-500">
                          {item.reason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarExcepcion(item.date)
                        }
                        className="text-red-600 font-semibold text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <p className="text-xs text-slate-500">
              Esta pantalla guarda las condiciones de despacho.
              Todavía no modifica las fechas del checkout.
            </p>
          </>
        )}
      </div>
    </main>
  );
}


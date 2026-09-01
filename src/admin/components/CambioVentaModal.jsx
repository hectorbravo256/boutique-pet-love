import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function CambioVentaModal({
  venta,
  onClose,
  onSuccess,
}) {
  const [variantes, setVariantes] = useState([]);
  const [devolver, setDevolver] = useState("");
  const [reemplazo, setReemplazo] = useState("");
  const [cantidadDevuelta, setCantidadDevuelta] = useState(1);
  const [cantidadReemplazo, setCantidadReemplazo] = useState(1);
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoVariantes, setCargandoVariantes] = useState(true);

  useEffect(() => {
    cargarVariantes();
  }, []);

  const cargarVariantes = async () => {
    setCargandoVariantes(true);

    const { data, error } = await supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        size,
        stock,
        price,
        products (
          name
        )
      `)
      .order("product_id")
      .order("size");

    if (error) {
      console.error("Error cargando variantes:", error);
      alert("No fue posible cargar los productos.");
    } else {
      setVariantes(data || []);
    }

    setCargandoVariantes(false);
  };

  const varianteDevuelta = variantes.find(
    (v) => String(v.id) === String(devolver)
  );

  const varianteReemplazo = variantes.find(
    (v) => String(v.id) === String(reemplazo)
  );

  const diferencia =
    varianteDevuelta && varianteReemplazo
      ? Number(varianteReemplazo.price || 0) *
          Number(cantidadReemplazo) -
        Number(varianteDevuelta.price || 0) *
          Number(cantidadDevuelta)
      : 0;

  const formatearPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CL");

  const confirmarCambio = async () => {
    if (!venta?.id) {
      alert("No se encontró la venta.");
      return;
    }

    if (!devolver || !reemplazo) {
      alert("Selecciona la prenda que devuelve y la que recibe.");
      return;
    }

    if (devolver === reemplazo) {
      alert(
        "La prenda devuelta y la prenda de reemplazo deben ser diferentes."
      );
      return;
    }

    if (cantidadDevuelta < 1 || cantidadReemplazo < 1) {
      alert("Las cantidades deben ser mayores que cero.");
      return;
    }

    if (
      varianteReemplazo &&
      Number(varianteReemplazo.stock || 0) <
        Number(cantidadReemplazo)
    ) {
      alert(
        `Stock insuficiente. Disponible: ${varianteReemplazo.stock}`
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar cambio?\n\n` +
        `Devuelve: ${
          varianteDevuelta?.products?.name || ""
        } ${varianteDevuelta?.size || ""} x${cantidadDevuelta}\n` +
        `Recibe: ${
          varianteReemplazo?.products?.name || ""
        } ${varianteReemplazo?.size || ""} x${cantidadReemplazo}\n\n` +
        `Diferencia: $${formatearPrecio(diferencia)}`
    );

    if (!confirmar) return;

    setCargando(true);

    const { data, error } = await supabase.rpc(
      "registrar_cambio_venta",
      {
        p_order_id: venta.id,
        p_return_variant_id: Number(devolver),
        p_return_qty: Number(cantidadDevuelta),
        p_replacement_variant_id: Number(reemplazo),
        p_replacement_qty: Number(cantidadReemplazo),
        p_observation: observacion || null,
        p_created_by: "Panel administrativo",
      }
    );

    setCargando(false);

    if (error) {
      console.error("Error registrando cambio:", error);
      alert(
        `No se pudo registrar el cambio:\n\n${error.message}`
      );
      return;
    }

    alert(
      "✅ Cambio registrado correctamente.\n\n" +
        "El inventario y la venta fueron actualizados."
    );

    if (onSuccess) {
      onSuccess(data);
    }

    onClose();
  };

  if (!venta) return null;

  return (
    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      p-4
      bg-black/50
      backdrop-blur-sm
    ">
      <div className="
        w-full
        max-w-2xl
        max-h-[90vh]
        overflow-y-auto
        rounded-[28px]
        bg-white
        shadow-2xl
      ">

        {/* HEADER */}
        <div className="
          p-6
          md:p-8
          bg-gradient-to-r
          from-pink-500
          via-fuchsia-500
          to-purple-600
          text-white
        ">
          <div className="
            flex
            items-start
            justify-between
            gap-4
          ">
            <div>
              <p className="
                text-xs
                uppercase
                tracking-[0.25em]
                font-bold
                text-pink-100
              >
                Gestión de cambio
              </p>

              <h2 className="
                mt-2
                text-2xl
                md:text-3xl
                font-black
              ">
                ↔️ Cambio de producto
              </h2>

              <p className="
                mt-2
                text-sm
                text-pink-100
              ">
                Venta #{venta.numero_venta || venta.id}
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                w-10
                h-10
                rounded-full
                bg-white/20
                hover:bg-white/30
                text-xl
                font-bold
              "
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">

          {/* VENTA */}
          <div className="
            mb-6
            rounded-2xl
            bg-slate-50
            border
            border-slate-200
            p-4
          ">
            <div className="
              text-xs
              uppercase
              tracking-wide
              font-bold
              text-slate-500
            ">
              Cliente
            </div>

            <div className="
              mt-1
              font-bold
              text-slate-900
            ">
              {venta.nombre || "Cliente"}
            </div>
          </div>

          {cargandoVariantes ? (
            <div className="
              py-10
              text-center
              text-slate-500
            ">
              Cargando productos...
            </div>
          ) : (
            <>
              {/* DEVUELVE */}
              <div className="
                rounded-2xl
                border
                border-rose-200
                bg-rose-50
                p-5
                mb-5
              ">
                <div className="
                  text-sm
                  font-black
                  text-rose-700
                  mb-3
                ">
                  ↩️ PRODUCTO QUE DEVUELVE
                </div>

                <select
                  value={devolver}
                  onChange={(e) =>
                    setDevolver(e.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                >
                  <option value="">
                    Seleccionar producto / talla
                  </option>

                  {variantes.map((v) => (
                    <option
                      key={v.id}
                      value={v.id}
                    >
                      {v.products?.name || "Producto"}
                      {" — "}
                      {v.size || "Sin talla"}
                      {" — $"}
                      {formatearPrecio(v.price)}
                    </option>
                  ))}
                </select>

                <div className="mt-4">
                  <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-600
                    mb-2
                  ">
                    Cantidad
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={cantidadDevuelta}
                    onChange={(e) =>
                      setCantidadDevuelta(
                        Number(e.target.value)
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                    "
                  />
                </div>
              </div>

              {/* FLECHA */}
              <div className="
                flex
                justify-center
                my-3
                text-3xl
              ">
                ↓
              </div>

              {/* REEMPLAZO */}
              <div className="
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                p-5
                mb-6
              ">
                <div className="
                  text-sm
                  font-black
                  text-emerald-700
                  mb-3
                ">
                  📦 PRODUCTO QUE RECIBE
                </div>

                <select
                  value={reemplazo}
                  onChange={(e) =>
                    setReemplazo(e.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                >
                  <option value="">
                    Seleccionar producto / talla
                  </option>

                  {variantes.map((v) => (
                    <option
                      key={v.id}
                      value={v.id}
                    >
                      {v.products?.name || "Producto"}
                      {" — "}
                      {v.size || "Sin talla"}
                      {" — Stock: "}
                      {v.stock}
                      {" — $"}
                      {formatearPrecio(v.price)}
                    </option>
                  ))}
                </select>

                <div className="mt-4">
                  <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-600
                    mb-2
                  ">
                    Cantidad
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={cantidadReemplazo}
                    onChange={(e) =>
                      setCantidadReemplazo(
                        Number(e.target.value)
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                    "
                  />
                </div>
              </div>

              {/* DIFERENCIA */}
              <div className="
                rounded-2xl
                bg-slate-900
                text-white
                p-5
                mb-6
              ">
                <div className="
                  text-sm
                  text-slate-300
                ">
                  Diferencia de precio
                </div>

                <div className="
                  mt-2
                  text-3xl
                  font-black
                ">
                  ${formatearPrecio(Math.abs(diferencia))}
                </div>

                <div className="
                  mt-2
                  text-sm
                  font-bold
                ">
                  {diferencia > 0
                    ? "Cliente debe pagar la diferencia"
                    : diferencia < 0
                    ? "Cliente queda con saldo a favor"
                    : "Sin diferencia de precio"}
                </div>
              </div>

              {/* OBSERVACIÓN */}
              <div className="mb-6">
                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-600
                  mb-2
                ">
                  Observación
                </label>

                <textarea
                  value={observacion}
                  onChange={(e) =>
                    setObservacion(e.target.value)
                  }
                  placeholder="Ej: Cambio solicitado por cliente"
                  rows={3}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    resize-none
                  "
                />
              </div>

              {/* BOTONES */}
              <div className="
                flex
                flex-col-reverse
                sm:flex-row
                gap-3
              ">
                <button
                  onClick={onClose}
                  disabled={cargando}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-300
                    py-3
                    font-bold
                    text-slate-700
                    hover:bg-slate-100
                  "
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmarCambio}
                  disabled={
                    cargando ||
                    cargandoVariantes
                  }
                  className="
                    flex-1
                    rounded-xl
                    bg-gradient-to-r
                    from-pink-500
                    to-purple-600
                    py-3
                    font-black
                    text-white
                    hover:opacity-90
                    disabled:opacity-50
                  "
                >
                  {cargando
                    ? "Procesando..."
                    : "↔️ Confirmar cambio"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

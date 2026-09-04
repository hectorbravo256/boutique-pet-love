import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { formatearFechaHoraChile } from "../../utils/fechaChile";

const ESTADOS = {
  EN_REPARACION: "EN_REPARACION",
  PARCIAL: "PARCIAL",
  REINGRESADO: "REINGRESADO",
};

const estadoLabel = {
  EN_REPARACION: "En reparación",
  PARCIAL: "Reingreso parcial",
  REINGRESADO: "Reingresado",
};

const estadoClass = {
  EN_REPARACION:
    "bg-amber-100 text-amber-800 border border-amber-200",
  PARCIAL:
    "bg-blue-100 text-blue-800 border border-blue-200",
  REINGRESADO:
    "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

const crearLineaVacia = () => ({
  variant_id: "",
  quantity: 1,
  observation: "",
});

export default function RepairsPage() {
  const [products, setProducts] = useState([]);
  const [repairs, setRepairs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingReturn, setSavingReturn] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [supplier, setSupplier] = useState("");
  const [reason, setReason] = useState("");
  const [observation, setObservation] = useState("");

  const [items, setItems] = useState([crearLineaVacia()]);

  const [selectedRepair, setSelectedRepair] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnObservation, setReturnObservation] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        cargarProductos(),
        cargarReparaciones(),
      ]);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "No fue posible cargar la información de reparaciones."
      );
    } finally {
      setLoading(false);
    }
  }

  async function cargarProductos() {
    const { data, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        active,
        product_variants (
          id,
          product_id,
          size,
          price,
          stock,
          min_stock
        )
      `)
      .eq("active", true)
      .order("name", { ascending: true });

    if (productsError) {
      throw productsError;
    }

    setProducts(data || []);
  }

  async function cargarReparaciones() {
    const { data, error: repairsError } = await supabase
      .from("inventory_repairs")
      .select(`
        id,
        repair_number,
        supplier,
        reason,
        observation,
        status,
        created_at,
        sent_at,
        completed_at,
        created_by,
        inventory_repair_items (
          id,
          product_id,
          variant_id,
          quantity_sent,
          quantity_returned,
          observation
        )
      `)
      .order("created_at", { ascending: false });

    if (repairsError) {
      throw repairsError;
    }

    const productMap = {};
    const variantMap = {};

    products.forEach((product) => {
      productMap[product.id] = product.name;

      (product.product_variants || []).forEach((variant) => {
        variantMap[variant.id] = {
          ...variant,
          product_name: product.name,
        };
      });
    });

    const enriched = (data || []).map((repair) => ({
      ...repair,
      inventory_repair_items: (repair.inventory_repair_items || []).map(
        (item) => ({
          ...item,
          product_name:
            productMap[item.product_id] || "Producto no disponible",
          variant: variantMap[item.variant_id] || null,
        })
      ),
    }));

    setRepairs(enriched);
  }

  /*
   * Debido a que cargarReparaciones puede ejecutarse antes de que
   * products se haya actualizado en el estado, esta segunda función
   * permite enriquecer posteriormente los datos sin depender del estado.
   */
  useEffect(() => {
    if (!products.length || !repairs.length) return;

    const productMap = {};
    const variantMap = {};

    products.forEach((product) => {
      productMap[product.id] = product.name;

      (product.product_variants || []).forEach((variant) => {
        variantMap[variant.id] = {
          ...variant,
          product_name: product.name,
        };
      });
    });

    setRepairs((current) =>
      current.map((repair) => ({
        ...repair,
        inventory_repair_items: (
          repair.inventory_repair_items || []
        ).map((item) => ({
          ...item,
          product_name:
            productMap[item.product_id] || "Producto no disponible",
          variant: variantMap[item.variant_id] || null,
        })),
      }))
    );
  }, [products]);

  const variants = useMemo(() => {
    const result = [];

    products.forEach((product) => {
      (product.product_variants || []).forEach((variant) => {
        result.push({
          ...variant,
          product_name: product.name,
        });
      });
    });

    return result;
  }, [products]);

  const variantMap = useMemo(() => {
    const map = {};

    variants.forEach((variant) => {
      map[variant.id] = variant;
    });

    return map;
  }, [variants]);

  const filteredRepairs = useMemo(() => {
    const text = search.trim().toLowerCase();

    return repairs.filter((repair) => {
      const matchesStatus =
        statusFilter === "TODOS" ||
        repair.status === statusFilter;

      if (!matchesStatus) return false;

      if (!text) return true;

      const productsText = (
        repair.inventory_repair_items || []
      )
        .map(
          (item) =>
            `${item.product_name || ""} ${
              item.variant?.size || ""
            }`
        )
        .join(" ")
        .toLowerCase();

      return (
        `${repair.repair_number || ""} ${
          repair.supplier || ""
        } ${repair.reason || ""} ${productsText}`
          .toLowerCase()
          .includes(text)
      );
    });
  }, [repairs, search, statusFilter]);

  function agregarLinea() {
    setItems((current) => [...current, crearLineaVacia()]);
  }

  function eliminarLinea(index) {
    setItems((current) => {
      if (current.length === 1) return current;

      return current.filter((_, i) => i !== index);
    });
  }

  function actualizarLinea(index, field, value) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function limpiarFormulario() {
    setSupplier("");
    setReason("");
    setObservation("");
    setItems([crearLineaVacia()]);
    setError("");
  }

  async function obtenerUsuarioActual() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    return user;
  }

  async function registrarReparacion(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!reason.trim()) {
      setError("Debes indicar el motivo de la reparación.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.variant_id &&
        Number(item.quantity) > 0
    );

    if (!validItems.length) {
      setError(
        "Debes agregar al menos un producto y una cantidad válida."
      );
      return;
    }

    const duplicateVariants = validItems.filter(
      (item, index, array) =>
        array.findIndex(
          (other) =>
            String(other.variant_id) ===
            String(item.variant_id)
        ) !== index
    );

    if (duplicateVariants.length) {
      setError(
        "No puedes agregar la misma variante/talla más de una vez."
      );
      return;
    }

    for (const item of validItems) {
      const variant = variantMap[item.variant_id];

      if (!variant) {
        setError(
          "Una de las variantes seleccionadas ya no está disponible."
        );
        return;
      }

      const quantity = Number(item.quantity);

      if (quantity > Number(variant.stock || 0)) {
        setError(
          `${variant.product_name} ${
            variant.size ? `— Talla ${variant.size}` : ""
          }: stock insuficiente. Disponible: ${
            variant.stock || 0
          }.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const user = await obtenerUsuarioActual();

      const payloadItems = validItems.map((item) => {
        const variant = variantMap[item.variant_id];

        return {
          product_id: Number(variant.product_id),
          variant_id: Number(item.variant_id),
          quantity: Number(item.quantity),
          observation: item.observation?.trim() || null,
        };
      });

      const { data, error: rpcError } = await supabase.rpc(
        "registrar_reparacion",
        {
          p_supplier: supplier.trim() || null,
          p_reason: reason.trim(),
          p_observation: observation.trim() || null,
          p_items: payloadItems,
          p_created_by:
            user?.email ||
            user?.id ||
            "usuario",
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      console.log("Reparación registrada:", data);

      setSuccess(
        "La reparación fue registrada correctamente. El stock fue descontado."
      );

      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "No fue posible registrar la reparación."
      );
    } finally {
      setSaving(false);
    }
  }

  function abrirReingreso(repair) {
    const pendingItems = (
      repair.inventory_repair_items || []
    )
      .map((item) => {
        const sent = Number(item.quantity_sent || 0);
        const returned = Number(item.quantity_returned || 0);
        const pending = Math.max(sent - returned, 0);

        return {
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          size: item.variant?.size || "",
          quantity_sent: sent,
          quantity_returned: returned,
          quantity_pending: pending,
          quantity_to_return: pending,
        };
      })
      .filter((item) => item.quantity_pending > 0);

    if (!pendingItems.length) {
      setError(
        "Esta reparación no tiene cantidades pendientes de reingreso."
      );
      return;
    }

    setError("");
    setSuccess("");
    setSelectedRepair(repair);
    setReturnItems(pendingItems);
    setReturnObservation("");
  }

  function cerrarReingreso() {
    if (savingReturn) return;

    setSelectedRepair(null);
    setReturnItems([]);
    setReturnObservation("");
  }

  function actualizarCantidadReingreso(id, value) {
    setReturnItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const numericValue = Math.max(
          0,
          Math.floor(Number(value) || 0)
        );

        return {
          ...item,
          quantity_to_return: Math.min(
            numericValue,
            item.quantity_pending
          ),
        };
      })
    );
  }

  async function registrarReingreso() {
    if (!selectedRepair) return;

    setError("");
    setSuccess("");

    const validItems = returnItems.filter(
      (item) => Number(item.quantity_to_return) > 0
    );

    if (!validItems.length) {
      setError(
        "Debes indicar al menos una cantidad para reingresar."
      );
      return;
    }

    for (const item of validItems) {
      if (
        Number(item.quantity_to_return) >
        Number(item.quantity_pending)
      ) {
        setError(
          `${item.product_name} ${
            item.size ? `— Talla ${item.size}` : ""
          }: la cantidad supera el saldo pendiente.`
        );
        return;
      }
    }

    setSavingReturn(true);

    try {
      const user = await obtenerUsuarioActual();

      const payloadItems = validItems.map((item) => ({
        repair_item_id: item.id,
        quantity: Number(item.quantity_to_return),
      }));

      const { data, error: rpcError } = await supabase.rpc(
        "registrar_reingreso_reparacion",
        {
          p_repair_id: selectedRepair.id,
          p_items: payloadItems,
          p_created_by:
            user?.email ||
            user?.id ||
            "usuario",
          p_observation:
            returnObservation.trim() || null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      console.log("Reingreso registrado:", data);

      cerrarReingreso();

      setSuccess(
        "El reingreso fue registrado correctamente. El stock fue actualizado."
      );

      await cargarDatos();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "No fue posible registrar el reingreso."
      );
    } finally {
      setSavingReturn(false);
    }
  }

  function obtenerResumenReparacion(repair) {
    let sent = 0;
    let returned = 0;

    (repair.inventory_repair_items || []).forEach(
      (item) => {
        sent += Number(item.quantity_sent || 0);
        returned += Number(item.quantity_returned || 0);
      }
    );

    return {
      sent,
      returned,
      pending: Math.max(sent - returned, 0),
    };
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Reparaciones
          </h1>

          <p className="text-slate-500 mt-1">
            Control de prendas enviadas a reparación y
            reingreso al inventario.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="text-xs font-medium text-amber-700">
            IMPORTANTE
          </div>

          <div className="text-sm text-amber-800 mt-1">
            Las reparaciones afectan únicamente el stock.
          </div>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* FORMULARIO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            Nueva reparación
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Registra las prendas que serán enviadas al
            proveedor para reparación.
          </p>
        </div>

        <form
          onSubmit={registrarReparacion}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Proveedor / taller
              </label>

              <input
                type="text"
                value={supplier}
                onChange={(e) =>
                  setSupplier(e.target.value)
                }
                placeholder="Ej: Taller Juan Pérez"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo de reparación *
              </label>

              <input
                type="text"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                placeholder="Ej: Costura defectuosa"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Observación general
              </label>

              <input
                type="text"
                value={observation}
                onChange={(e) =>
                  setObservation(e.target.value)
                }
                placeholder="Observaciones adicionales"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* PRODUCTOS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Prendas a reparar
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  El stock se descontará al confirmar.
                </p>
              </div>

              <button
                type="button"
                onClick={agregarLinea}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                + Agregar prenda
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const variant =
                  variantMap[item.variant_id];

                return (
                  <div
                    key={`${index}-${item.variant_id}`}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_120px_1fr_auto] gap-3 items-end rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Producto / talla
                      </label>

                      <select
                        value={item.variant_id}
                        onChange={(e) =>
                          actualizarLinea(
                            index,
                            "variant_id",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white"
                      >
                        <option value="">
                          Seleccionar producto y talla
                        </option>

                        {products.map((product) =>
                          (product.product_variants || []).map(
                            (productVariant) => (
                              <option
                                key={productVariant.id}
                                value={productVariant.id}
                              >
                                {product.name}
                                {productVariant.size
                                  ? ` — Talla ${productVariant.size}`
                                  : ""}
                                {` — Stock ${productVariant.stock || 0}`}
                              </option>
                            )
                          )
                        )}
                      </select>

                      {variant && (
                        <div className="text-xs text-slate-500 mt-1">
                          Stock disponible:{" "}
                          <strong>
                            {variant.stock || 0}
                          </strong>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Cantidad
                      </label>

                      <input
                        type="number"
                        min="1"
                        max={variant?.stock || undefined}
                        value={item.quantity}
                        onChange={(e) =>
                          actualizarLinea(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Observación
                      </label>

                      <input
                        type="text"
                        value={item.observation}
                        onChange={(e) =>
                          actualizarLinea(
                            index,
                            "observation",
                            e.target.value
                          )
                        }
                        placeholder="Ej: Reparar costura lateral"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        eliminarLinea(index)
                      }
                      disabled={items.length === 1}
                      className="rounded-xl border border-red-200 px-3 py-2.5 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Eliminar línea"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={limpiarFormulario}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Limpiar
            </button>

            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-5 py-2.5 font-semibold text-white"
            >
              {saving
                ? "Registrando..."
                : "Enviar a reparación"}
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Historial de reparaciones
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Control de prendas enviadas, pendientes y
                reingresadas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar..."
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
              >
                <option value="TODOS">
                  Todos los estados
                </option>

                <option value={ESTADOS.EN_REPARACION}>
                  En reparación
                </option>

                <option value={ESTADOS.PARCIAL}>
                  Reingreso parcial
                </option>

                <option value={ESTADOS.REINGRESADO}>
                  Reingresado
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando reparaciones...
          </div>
        ) : filteredRepairs.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No existen reparaciones para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                    Documento
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                    Fecha
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                    Productos
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                    Proveedor
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-600">
                    Enviado
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-600">
                    Reingresado
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-600">
                    Pendiente
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-600">
                    Estado
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-bold text-slate-600">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRepairs.map((repair) => {
                  const summary =
                    obtenerResumenReparacion(repair);

                  return (
                    <tr
                      key={repair.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">
                          {repair.repair_number}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          Reparación
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatearFechaHoraChile(
                          repair.created_at
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {(
                            repair.inventory_repair_items ||
                            []
                          ).map((item) => (
                            <div
                              key={item.id}
                              className="text-sm"
                            >
                              <span className="font-medium text-slate-800">
                                {item.product_name}
                              </span>

                              {item.variant?.size && (
                                <span className="text-slate-500">
                                  {" "}
                                  — Talla{" "}
                                  {item.variant.size}
                                </span>
                              )}

                              <span className="text-slate-500">
                                {" "}
                                ×{" "}
                                {item.quantity_sent}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {repair.supplier || "—"}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-slate-700">
                        {summary.sent}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-emerald-700">
                        {summary.returned}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-amber-700">
                        {summary.pending}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            estadoClass[
                              repair.status
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {estadoLabel[
                            repair.status
                          ] ||
                            repair.status ||
                            "Sin estado"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {summary.pending > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              abrirReingreso(repair)
                            }
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Registrar reingreso
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600">
                            ✓ Completo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL REINGRESO */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Registrar reingreso
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedRepair.repair_number}
                  {selectedRepair.supplier
                    ? ` · ${selectedRepair.supplier}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarReingreso}
                disabled={savingReturn}
                className="text-slate-500 hover:text-slate-800 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                Puedes registrar un reingreso parcial. Por
                ejemplo, si enviaste 5 prendas y regresan 3,
                registra 3 ahora y las 2 restantes después.
              </div>

              <div className="space-y-3">
                {returnItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_140px] gap-4 items-center rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {item.product_name}
                      </div>

                      {item.size && (
                        <div className="text-sm text-slate-500">
                          Talla {item.size}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Enviado
                      </div>

                      <div className="font-semibold">
                        {item.quantity_sent}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Pendiente
                      </div>

                      <div className="font-semibold text-amber-700">
                        {item.quantity_pending}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Reingresar
                      </label>

                      <input
                        type="number"
                        min="0"
                        max={item.quantity_pending}
                        value={item.quantity_to_return}
                        onChange={(e) =>
                          actualizarCantidadReingreso(
                            item.id,
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observación del reingreso
                </label>

                <textarea
                  value={returnObservation}
                  onChange={(e) =>
                    setReturnObservation(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Ej: Se repararon costuras y se revisó la prenda."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarReingreso}
                disabled={savingReturn}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={registrarReingreso}
                disabled={savingReturn}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 font-semibold text-white"
              >
                {savingReturn
                  ? "Registrando..."
                  : "Confirmar reingreso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

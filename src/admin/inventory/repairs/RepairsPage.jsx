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

  const [items, setItems] = useState([]);

  // Modal agregar prenda
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemObservation, setItemObservation] = useState("");

  // Modal reingreso
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
      const [productsResult, repairsResult] = await Promise.all([
        supabase
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
          .order("name", { ascending: true }),

        supabase
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
          .order("created_at", { ascending: false }),
      ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (repairsResult.error) {
        throw repairsResult.error;
      }

      const loadedProducts = productsResult.data || [];
      const loadedRepairs = repairsResult.data || [];

      setProducts(loadedProducts);

      const productMap = {};
      const variantMap = {};

      loadedProducts.forEach((product) => {
        productMap[product.id] = product.name;

        (product.product_variants || []).forEach((variant) => {
          variantMap[variant.id] = {
            ...variant,
            product_name: product.name,
          };
        });
      });

      const enriched = loadedRepairs.map((repair) => ({
        ...repair,
        inventory_repair_items: (
          repair.inventory_repair_items || []
        ).map((item) => ({
          ...item,
          product_name:
            productMap[item.product_id] ||
            "Producto no disponible",
          variant:
            variantMap[item.variant_id] || null,
        })),
      }));

      setRepairs(enriched);
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
      map[String(variant.id)] = variant;
    });

    return map;
  }, [variants]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;

    return (
      products.find(
        (product) =>
          String(product.id) === String(selectedProductId)
      ) || null
    );
  }, [products, selectedProductId]);

  const selectedProductVariants = useMemo(() => {
    if (!selectedProduct) return [];

    return (selectedProduct.product_variants || [])
      .slice()
      .sort((a, b) =>
        String(a.size || "").localeCompare(
          String(b.size || ""),
          "es",
          {
            numeric: true,
            sensitivity: "base",
          }
        )
      );
  }, [selectedProduct]);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;

    return (
      selectedProductVariants.find(
        (variant) =>
          String(variant.id) ===
          String(selectedVariantId)
      ) || null
    );
  }, [selectedVariantId, selectedProductVariants]);

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

      return `${repair.repair_number || ""} ${
        repair.supplier || ""
      } ${repair.reason || ""} ${productsText}`
        .toLowerCase()
        .includes(text);
    });
  }, [repairs, search, statusFilter]);

  function abrirModalAgregarPrenda() {
    setError("");
    setSuccess("");

    setSelectedProductId("");
    setSelectedVariantId("");
    setItemQuantity(1);
    setItemObservation("");

    setShowItemModal(true);
  }

  function cerrarModalAgregarPrenda() {
    setShowItemModal(false);
    setSelectedProductId("");
    setSelectedVariantId("");
    setItemQuantity(1);
    setItemObservation("");
  }

  function cambiarProducto(productId) {
    setSelectedProductId(productId);
    setSelectedVariantId("");
    setItemQuantity(1);
  }

  function agregarPrendaAlDetalle() {
    setError("");

    if (!selectedProduct) {
      setError("Debes seleccionar un producto.");
      return;
    }

    if (!selectedVariant) {
      setError("Debes seleccionar una talla.");
      return;
    }

    const quantity = Math.floor(
      Number(itemQuantity) || 0
    );

    if (quantity <= 0) {
      setError("La cantidad debe ser mayor que cero.");
      return;
    }

    const stockDisponible = Number(
      selectedVariant.stock || 0
    );

    if (quantity > stockDisponible) {
      setError(
        `${selectedProduct.name}${
          selectedVariant.size
            ? ` — Talla ${selectedVariant.size}`
            : ""
        }: stock insuficiente. Disponible: ${stockDisponible}.`
      );
      return;
    }

    const yaExiste = items.some(
      (item) =>
        String(item.variant_id) ===
        String(selectedVariant.id)
    );

    if (yaExiste) {
      setError(
        "Esta talla ya fue agregada al detalle de la reparación."
      );
      return;
    }

    const nuevaLinea = {
      variant_id: String(selectedVariant.id),
      product_id: Number(selectedVariant.product_id),
      quantity,
      observation:
        itemObservation.trim() || "",
      product_name: selectedProduct.name,
      size: selectedVariant.size || "",
      stock: stockDisponible,
    };

    setItems((current) => [
      ...current,
      nuevaLinea,
    ]);

    cerrarModalAgregarPrenda();
  }

  function eliminarPrendaDelDetalle(variantId) {
    setItems((current) =>
      current.filter(
        (item) =>
          String(item.variant_id) !==
          String(variantId)
      )
    );
  }

  function actualizarCantidadDetalle(
    variantId,
    value
  ) {
    const quantity = Math.max(
      0,
      Math.floor(Number(value) || 0)
    );

    const variant = variantMap[String(variantId)];

    if (!variant) return;

    const stockDisponible = Number(
      variant.stock || 0
    );

    setItems((current) =>
      current.map((item) => {
        if (
          String(item.variant_id) !==
          String(variantId)
        ) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(
            quantity,
            stockDisponible
          ),
        };
      })
    );
  }

  function actualizarObservacionDetalle(
    variantId,
    value
  ) {
    setItems((current) =>
      current.map((item) =>
        String(item.variant_id) ===
        String(variantId)
          ? {
              ...item,
              observation: value,
            }
          : item
      )
    );
  }

  function limpiarFormulario() {
    setSupplier("");
    setReason("");
    setObservation("");
    setItems([]);

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
      setError(
        "Debes indicar el motivo de la reparación."
      );
      return;
    }

    if (!items.length) {
      setError(
        "Debes agregar al menos una prenda al detalle."
      );
      return;
    }

    for (const item of items) {
      const variant = variantMap[
        String(item.variant_id)
      ];

      if (!variant) {
        setError(
          "Una de las variantes seleccionadas ya no está disponible."
        );
        return;
      }

      const quantity = Number(item.quantity);

      if (quantity <= 0) {
        setError(
          "Todas las cantidades deben ser mayores que cero."
        );
        return;
      }

      if (
        quantity >
        Number(variant.stock || 0)
      ) {
        setError(
          `${variant.product_name} ${
            variant.size
              ? `— Talla ${variant.size}`
              : ""
          }: stock insuficiente. Disponible: ${
            variant.stock || 0
          }.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const user =
        await obtenerUsuarioActual();

      const payloadItems = items.map((item) => {
        const variant =
          variantMap[
            String(item.variant_id)
          ];

        return {
          product_id: Number(
            variant.product_id
          ),
          variant_id: Number(
            item.variant_id
          ),
          quantity: Number(
            item.quantity
          ),
          observation:
            item.observation?.trim() ||
            null,
        };
      });

      const { data, error: rpcError } =
        await supabase.rpc(
          "registrar_reparacion",
          {
            p_supplier:
              supplier.trim() || null,
            p_reason: reason.trim(),
            p_observation:
              observation.trim() || null,
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

      console.log(
        "Reparación registrada:",
        data
      );

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
        const sent = Number(
          item.quantity_sent || 0
        );

        const returned = Number(
          item.quantity_returned || 0
        );

        const pending = Math.max(
          sent - returned,
          0
        );

        return {
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name:
            item.product_name,
          size:
            item.variant?.size || "",
          quantity_sent: sent,
          quantity_returned: returned,
          quantity_pending: pending,
          quantity_to_return: pending,
        };
      })
      .filter(
        (item) =>
          item.quantity_pending > 0
      );

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

  function actualizarCantidadReingreso(
    id,
    value
  ) {
    setReturnItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const numericValue = Math.max(
          0,
          Math.floor(Number(value) || 0)
        );

        return {
          ...item,
          quantity_to_return:
            Math.min(
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
      (item) =>
        Number(
          item.quantity_to_return
        ) > 0
    );

    if (!validItems.length) {
      setError(
        "Debes indicar al menos una cantidad para reingresar."
      );
      return;
    }

    for (const item of validItems) {
      if (
        Number(
          item.quantity_to_return
        ) >
        Number(
          item.quantity_pending
        )
      ) {
        setError(
          `${item.product_name} ${
            item.size
              ? `— Talla ${item.size}`
              : ""
          }: la cantidad supera el saldo pendiente.`
        );
        return;
      }
    }

    setSavingReturn(true);

    try {
      const user =
        await obtenerUsuarioActual();

      const payloadItems =
        validItems.map((item) => ({
          repair_item_id: item.id,
          quantity: Number(
            item.quantity_to_return
          ),
        }));

      const {
        data,
        error: rpcError,
      } =
        await supabase.rpc(
          "registrar_reingreso_reparacion",
          {
            p_repair_id:
              selectedRepair.id,
            p_items: payloadItems,
            p_created_by:
              user?.email ||
              user?.id ||
              "usuario",
            p_observation:
              returnObservation.trim() ||
              null,
          }
        );

      if (rpcError) {
        throw rpcError;
      }

      console.log(
        "Reingreso registrado:",
        data
      );

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

  function obtenerResumenReparacion(
    repair
  ) {
    let sent = 0;
    let returned = 0;

    (
      repair.inventory_repair_items ||
      []
    ).forEach((item) => {
      sent += Number(
        item.quantity_sent || 0
      );

      returned += Number(
        item.quantity_returned || 0
      );
    });

    return {
      sent,
      returned,
      pending: Math.max(
        sent - returned,
        0
      ),
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
            Control de prendas enviadas a
            reparación y reingreso al
            inventario.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="text-xs font-medium text-amber-700">
            IMPORTANTE
          </div>

          <div className="text-sm text-amber-800 mt-1">
            Las reparaciones afectan
            únicamente el stock.
          </div>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong>{" "}
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* NUEVA REPARACIÓN */}
      <form
        onSubmit={registrarReparacion}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            Nueva reparación
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Registra las prendas que serán
            enviadas al proveedor para
            reparación.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* DATOS GENERALES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proveedor / taller
              </label>

              <input
                type="text"
                value={supplier}
                onChange={(e) =>
                  setSupplier(
                    e.target.value
                  )
                }
                placeholder="Ej: Taller Juan Pérez"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motivo de reparación *
              </label>

              <input
                type="text"
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
                placeholder="Ej: Costura defectuosa"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observación general
              </label>

              <input
                type="text"
                value={observation}
                onChange={(e) =>
                  setObservation(
                    e.target.value
                  )
                }
                placeholder="Observaciones adicionales"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* DETALLE */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-slate-800">
                  Prendas a reparar
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Agrega cada producto y talla
                  desde el botón.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  abrirModalAgregarPrenda
                }
                className="inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition"
              >
                + Agregar prenda
              </button>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <div className="text-3xl mb-2">
                  🧵
                </div>

                <p className="text-sm font-medium text-slate-700">
                  No hay prendas agregadas
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Presiona “+ Agregar prenda”
                  para comenzar.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="hidden lg:grid grid-cols-[2fr_1fr_100px_2fr_48px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                  <div>Producto</div>
                  <div>Talla</div>
                  <div>Cantidad</div>
                  <div>Observación</div>
                  <div></div>
                </div>

                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <div
                      key={item.variant_id}
                      className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_100px_2fr_48px] gap-3 px-4 py-4 items-center"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {item.product_name}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          Stock disponible:{" "}
                          {item.stock}
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                          {item.size
                            ? `Talla ${item.size}`
                            : "Sin talla"}
                        </span>
                      </div>

                      <div>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            actualizarCantidadDetalle(
                              item.variant_id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-center outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={
                            item.observation ||
                            ""
                          }
                          onChange={(e) =>
                            actualizarObservacionDetalle(
                              item.variant_id,
                              e.target.value
                            )
                          }
                          placeholder="Observación de la prenda"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            eliminarPrendaDelDetalle(
                              item.variant_id
                            )
                          }
                          className="w-9 h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">
                    Total de unidades
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {items.reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.quantity || 0
                        ),
                      0
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={limpiarFormulario}
            disabled={saving}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Limpiar
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loading ||
              items.length === 0
            }
            className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Registrando..."
              : "Enviar a reparación"}
          </button>
        </div>
      </form>

      {/* HISTORIAL */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Historial de reparaciones
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Consulta las prendas enviadas y
                sus reingresos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Buscar reparación..."
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
              >
                <option value="TODOS">
                  Todos los estados
                </option>

                <option
                  value={
                    ESTADOS.EN_REPARACION
                  }
                >
                  En reparación
                </option>

                <option
                  value={ESTADOS.PARCIAL}
                >
                  Reingreso parcial
                </option>

                <option
                  value={
                    ESTADOS.REINGRESADO
                  }
                >
                  Reingresado
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Cargando reparaciones...
          </div>
        ) : filteredRepairs.length ===
          0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-3xl mb-2">
              🔧
            </div>

            <p className="font-medium text-slate-700">
              No hay reparaciones registradas
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Las reparaciones que registres
              aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredRepairs.map(
              (repair) => {
                const resumen =
                  obtenerResumenReparacion(
                    repair
                  );

                return (
                  <div
                    key={repair.id}
                    className="p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-slate-800">
                            {repair.repair_number}
                          </span>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              estadoClass[
                                repair.status
                              ] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {estadoLabel[
                              repair.status
                            ] ||
                              repair.status}
                          </span>
                        </div>

                        <div className="text-sm text-slate-500 mt-2">
                          {formatearFechaHoraChile(
                            repair.created_at
                          )}
                        </div>
                      </div>

                      {resumen.pending >
                        0 && (
                        <button
                          type="button"
                          onClick={() =>
                            abrirReingreso(
                              repair
                            )
                          }
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
                        >
                          Registrar reingreso
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <div className="text-xs text-slate-500">
                          Proveedor / taller
                        </div>

                        <div className="text-sm font-semibold text-slate-800 mt-1">
                          {repair.supplier ||
                            "No indicado"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <div className="text-xs text-slate-500">
                          Motivo
                        </div>

                        <div className="text-sm font-semibold text-slate-800 mt-1">
                          {repair.reason}
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <div className="text-xs text-slate-500">
                          Unidades
                        </div>

                        <div className="text-sm font-semibold text-slate-800 mt-1">
                          Enviadas:{" "}
                          {resumen.sent}{" "}
                          · Reingresadas:{" "}
                          {resumen.returned}{" "}
                          · Pendientes:{" "}
                          {resumen.pending}
                        </div>
                      </div>
                    </div>

                    {repair.observation && (
                      <div className="mt-4 rounded-xl border border-slate-200 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-500">
                          Observación
                        </div>

                        <div className="text-sm text-slate-700 mt-1">
                          {repair.observation}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                        Detalle de prendas
                      </div>

                      <div className="divide-y divide-slate-200">
                        {(
                          repair.inventory_repair_items ||
                          []
                        ).map(
                          (item) => {
                            const sent =
                              Number(
                                item.quantity_sent ||
                                  0
                              );

                            const returned =
                              Number(
                                item.quantity_returned ||
                                  0
                              );

                            const pending =
                              Math.max(
                                sent -
                                  returned,
                                0
                              );

                            return (
                              <div
                                key={
                                  item.id
                                }
                                className="px-4 py-4"
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-800">
                                      {
                                        item.product_name
                                      }
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1">
                                      {item.variant
                                        ?.size
                                        ? `Talla ${item.variant.size}`
                                        : "Sin talla"}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
                                      Enviadas:{" "}
                                      {
                                        sent
                                      }
                                    </span>

                                    <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">
                                      Reingresadas:{" "}
                                      {
                                        returned
                                      }
                                    </span>

                                    {pending >
                                      0 && (
                                      <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
                                        Pendientes:{" "}
                                        {
                                          pending
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {item.observation && (
                                  <div className="text-xs text-slate-500 mt-2">
                                    {item.observation}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* MODAL AGREGAR PRENDA */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={
              cerrarModalAgregarPrenda
            }
          />

          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Agregar prenda
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Selecciona primero el producto
                  y luego la talla.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarModalAgregarPrenda
                }
                className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* PRODUCTO */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Producto *
                </label>

                <select
                  value={
                    selectedProductId
                  }
                  onChange={(e) =>
                    cambiarProducto(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">
                    Seleccionar producto
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* TALLA */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Talla *
                </label>

                <select
                  value={
                    selectedVariantId
                  }
                  onChange={(e) => {
                    setSelectedVariantId(
                      e.target.value
                    );
                    setItemQuantity(1);
                  }}
                  disabled={
                    !selectedProduct
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {!selectedProduct
                      ? "Primero selecciona un producto"
                      : "Seleccionar talla"}
                  </option>

                  {selectedProductVariants.map(
                    (variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                      >
                        {variant.size
                          ? `Talla ${variant.size}`
                          : "Sin talla"}{" "}
                        — Stock:{" "}
                        {variant.stock ||
                          0}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* STOCK */}
              {selectedVariant && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">
                        Variante seleccionada
                      </div>

                      <div className="text-sm font-semibold text-slate-800 mt-1">
                        {selectedProduct.name}
                        {selectedVariant.size
                          ? ` — Talla ${selectedVariant.size}`
                          : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        Stock disponible
                      </div>

                      <div className="text-lg font-bold text-slate-800">
                        {selectedVariant.stock ||
                          0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CANTIDAD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cantidad *
                </label>

                <input
                  type="number"
                  min="1"
                  max={
                    selectedVariant
                      ? Number(
                          selectedVariant.stock ||
                            0
                        )
                      : undefined
                  }
                  value={itemQuantity}
                  onChange={(e) =>
                    setItemQuantity(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedVariant
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                />
              </div>

              {/* OBSERVACIÓN */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Observación de la prenda
                </label>

                <textarea
                  rows={3}
                  value={
                    itemObservation
                  }
                  onChange={(e) =>
                    setItemObservation(
                      e.target.value
                    )
                  }
                  placeholder="Ej: Reparar costura lateral"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  cerrarModalAgregarPrenda
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  agregarPrendaAlDetalle
                }
                disabled={
                  !selectedProduct ||
                  !selectedVariant
                }
                className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar al detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REINGRESO */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={cerrarReingreso}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Registrar reingreso
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedRepair.repair_number}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarReingreso
                }
                disabled={savingReturn}
                className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 text-xl disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                <div className="text-sm font-semibold text-blue-800">
                  Puedes realizar un reingreso
                  parcial.
                </div>

                <div className="text-xs text-blue-700 mt-1">
                  Si fueron enviadas 5 unidades
                  y regresan 3, registra 3 y las
                  otras 2 quedarán pendientes.
                </div>
              </div>

              <div className="space-y-3">
                {returnItems.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {
                              item.product_name
                            }
                          </div>

                          <div className="text-xs text-slate-500 mt-1">
                            {item.size
                              ? `Talla ${item.size}`
                              : "Sin talla"}
                          </div>
                        </div>

                        <div className="text-xs text-slate-500">
                          Enviadas:{" "}
                          <strong>
                            {
                              item.quantity_sent
                            }
                          </strong>{" "}
                          · Reingresadas:{" "}
                          <strong>
                            {
                              item.quantity_returned
                            }
                          </strong>{" "}
                          · Pendientes:{" "}
                          <strong>
                            {
                              item.quantity_pending
                            }
                          </strong>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-2">
                          Cantidad a reingresar
                        </label>

                        <input
                          type="number"
                          min="0"
                          max={
                            item.quantity_pending
                          }
                          value={
                            item.quantity_to_return
                          }
                          onChange={(e) =>
                            actualizarCantidadReingreso(
                              item.id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Observación del reingreso
                </label>

                <textarea
                  rows={3}
                  value={
                    returnObservation
                  }
                  onChange={(e) =>
                    setReturnObservation(
                      e.target.value
                    )
                  }
                  placeholder="Ej: Reingresaron 3 prendas reparadas correctamente"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none resize-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={
                  cerrarReingreso
                }
                disabled={savingReturn}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  registrarReingreso
                }
                disabled={
                  savingReturn
                }
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

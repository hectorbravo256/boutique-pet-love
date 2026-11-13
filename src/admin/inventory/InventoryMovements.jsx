import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useInventoryMovements from "../shared/hooks/useInventoryMovements";
import { formatearFechaHoraChile } from "../utils/fechaChile";

const signedQuantity = (movement) => {
  const qty = Number(movement.quantity ?? 0);
  return movement.movement_type === "SALE" ? -Math.abs(qty) : qty;
};

const movementLabel = (movement) => {
  if (movement.physical_count_session_id) return "Ajuste por conteo físico";
  if (movement.movement_type === "PURCHASE") return "Entrada";
  if (movement.movement_type === "SALE") return "Salida";
  return movement.movement_type || "No registrado";
};

function DetailField({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-900">{value ?? "No registrado"}</p>
    </div>
  );
}

function MovementDetailModal({ movement, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="movement-detail-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="movement-detail-title" className="text-xl font-bold text-slate-900">
              Detalle del movimiento
            </h2>
            <p className="text-sm text-slate-500">Consulta y trazabilidad del inventario</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-lg font-bold text-slate-900">
            {movement.products?.name || "Producto desconocido"}
          </p>
          <p className="text-sm text-slate-500">
            {movement.product_variants?.size || "Talla no registrada"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Movimiento #{movement.id} · {formatearFechaHoraChile(movement.created_at)}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <DetailField label="Tipo de movimiento" value={movementLabel(movement)} />
          <DetailField
            label="Cantidad"
            value={`${signedQuantity(movement) > 0 ? "+" : ""}${signedQuantity(movement)}`}
          />
          <DetailField label="Stock anterior" value={movement.stock_before} />
          <DetailField label="Stock posterior" value={movement.stock_after} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <DetailField label="Documento" value={movement.document_number || null} />
          <DetailField label="Orden asociada" value={movement.order_id ? `#${movement.order_id}` : null} />
          <DetailField label="Medio de pago" value={movement.payment_method || null} />
          <DetailField label="Sesión de conteo físico" value={movement.physical_count_session_id || "No corresponde"} />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Observaciones</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-900">
            {movement.notes || "Sin observaciones"}
          </p>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Registro de solo lectura. Los datos no registrados se muestran como tales.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </section>
    </div>
  );
}

export default function InventoryMovements() {
  const [selectedMovement, setSelectedMovement] = useState(null);
  const {
    movimientos, loading, error, reload,
    page, setPage, type, setType,
    from, setFrom, to, setTo,
    total, totalPages, pageSize
  } = useInventoryMovements();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/admin/inventario"
          className="inline-flex items-center text-sm font-semibold text-pink-600 transition hover:text-pink-700 hover:underline"
        >
          ← Volver a Inventario
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Movimientos de inventario</h1>
          <p className="mt-1 text-gray-500">Entradas, salidas y ajustes de inventario.</p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-40"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
        <div>
          <label htmlFor="movement-type" className="mb-1 block text-sm font-semibold">Tipo de movimiento</label>
          <select
            id="movement-type"
            value={type}
            onChange={(event) => { setType(event.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="purchase">Entradas</option>
            <option value="sale">Salidas</option>
            <option value="adjustment">Ajustes por conteo</option>
          </select>
        </div>
        <div>
          <label htmlFor="movement-from" className="mb-1 block text-sm font-semibold">Desde</label>
          <input
            id="movement-from"
            type="date"
            value={from}
            onChange={(event) => { setFrom(event.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="movement-to" className="mb-1 block text-sm font-semibold">Hasta</label>
          <input
            id="movement-to"
            type="date"
            value={to}
            onChange={(event) => { setTo(event.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={() => { setType("all"); setFrom(""); setTo(""); setPage(1); }}
          className="rounded-lg border px-4 py-2"
        >
          Limpiar filtros
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">No se pudieron cargar los movimientos.</p>
          <p className="mt-1 text-sm">{error}</p>
          <button type="button" onClick={reload} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-slate-500">
            {loading ? "Cargando movimientos..." : `${total} movimientos encontrados`}
          </div>

          {!loading && movimientos.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Cantidad</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Referencia</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movement) => {
                    const quantity = signedQuantity(movement);
                    return (
                      <tr key={movement.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3">{formatearFechaHoraChile(movement.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{movement.products?.name || "Producto desconocido"}</div>
                          {movement.product_variants?.size && (
                            <div className="text-sm text-gray-500">{movement.product_variants.size}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${movement.physical_count_session_id ? "text-amber-700" : movement.movement_type === "PURCHASE" ? "text-green-600" : movement.movement_type === "SALE" ? "text-red-600" : "text-slate-700"}`}>
                            {movementLabel(movement)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={quantity < 0 ? "text-red-600" : quantity > 0 ? "text-green-600" : "text-slate-500"}>
                            {quantity > 0 ? "+" : ""}{quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {movement.stock_before ?? "—"} → {movement.stock_after ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {movement.physical_count_session_id ? (
                              <span className="font-semibold text-amber-700">Conteo físico</span>
                            ) : movement.document_number ? `Doc. ${movement.document_number}` : "Sin documento"}
                          </div>
                          {movement.order_id && (
                            <div className="text-sm text-gray-500">Orden #{movement.order_id}</div>
                          )}
                          {movement.payment_method && (
                            <div className="text-xs text-gray-400">{movement.payment_method}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="max-w-xs truncate" title={movement.notes || ""}>
                            {movement.notes || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedMovement(movement)}
                            className="whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              {total === 0 ? "Sin resultados" : `Mostrando ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}`}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm font-semibold">Página {page} de {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {selectedMovement && (
        <MovementDetailModal
          movement={selectedMovement}
          onClose={() => setSelectedMovement(null)}
        />
      )}
    </div>
  );
}

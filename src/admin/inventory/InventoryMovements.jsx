import React from "react";
import { Link } from "react-router-dom";
import useInventoryMovements from "../shared/hooks/useInventoryMovements";
import { formatearFechaHoraChile } from "../utils/fechaChile";

export default function InventoryMovements() {
  
const {
  movimientos, loading, error, reload,
  page, setPage, type, setType,
  from, setFrom, to, setTo,
  total, totalPages, pageSize
} = useInventoryMovements();


  if (loading) {
    return (
      <div className="p-6">
         <div className="mb-6">
            <Link
                to="/admin/inventario"
                className="
                    inline-flex
                    items-center
                    text-sm
                    font-semibold
                    text-pink-600
                    transition
                    hover:text-pink-700
                    hover:underline
                "
            >
                ← Volver a Inventario
            </Link>
           </div>
        <h1 className="text-2xl font-bold mb-4">
          Movimientos de inventario
        </h1>

        <div className="text-gray-500">
          Cargando movimientos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
         <div className="mb-6">
            <Link
                to="/admin/inventario"
                className="
                    inline-flex
                    items-center
                    text-sm
                    font-semibold
                    text-pink-600
                    transition
                    hover:text-pink-700
                    hover:underline
                "
            >
                ← Volver a Inventario
            </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">
          Movimientos de inventario
        </h1>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">
            No se pudieron cargar los movimientos.
          </p>

          <p className="text-sm mt-1">
            {error}
          </p>

          <button
            onClick={reload}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
            <Link
                to="/admin/inventario"
                className="
                    inline-flex
                    items-center
                    text-sm
                    font-semibold
                    text-pink-600
                    transition
                    hover:text-pink-700
                    hover:underline
                "
            >
                ← Volver a Inventario
            </Link>
        </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Movimientos de inventario
          </h1>

          <p className="text-gray-500 mt-1">
            Entradas, salidas y ajustes de inventario.
          </p>
        </div>

        <button
          onClick={reload}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Actualizar
        </button>
      </div>

      
<div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
  <div>
    <label className="mb-1 block text-sm font-semibold">
      Tipo de movimiento
    </label>
    <select
      value={type}
      onChange={(e) => {
        setType(e.target.value);
        setPage(1);
      }}
      className="rounded-lg border px-3 py-2"
    >
      <option value="all">Todos</option>
      <option value="purchase">Entradas</option>
      <option value="sale">Salidas</option>
      <option value="adjustment">Ajustes por conteo</option>
    </select>
  </div>

  <div>
    <label className="mb-1 block text-sm font-semibold">
      Desde
    </label>
    <input
      type="date"
      value={from}
      onChange={(e) => {
        setFrom(e.target.value);
        setPage(1);
      }}
      className="rounded-lg border px-3 py-2"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-semibold">
      Hasta
    </label>
    <input
      type="date"
      value={to}
      onChange={(e) => {
        setTo(e.target.value);
        setPage(1);
      }}
      className="rounded-lg border px-3 py-2"
    />
  </div>

  <button
    type="button"
    onClick={() => {
      setType("all");
      setFrom("");
      setTo("");
      setPage(1);
    }}
    className="rounded-lg border px-4 py-2"
  >
    Limpiar filtros
  </button>
</div>

<div className="mb-3 text-sm text-slate-500">
  {total} movimientos encontrados
</div>

      {movimientos.length === 0 ? (
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
              </tr>
            </thead>

            <tbody>
              {movimientos.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {formatearFechaHoraChile(m.created_at)}
                  </td>
                  
                  <td className="px-4 py-3">
  <div className="font-semibold">
    {m.products?.name || "Producto desconocido"}
  </div>

  {m.product_variants?.size && (
    <div className="text-sm text-gray-500">
      {m.product_variants.size}
    </div>
  )}
</td>


<td className="px-4 py-3">
  {m.physical_count_session_id ? (
    <span className="font-semibold text-amber-700">
      Ajuste por conteo físico
    </span>
  ) : m.movement_type === "PURCHASE" ? (
    <span className="font-semibold text-green-600">
      Entrada
    </span>
  ) : m.movement_type === "SALE" ? (
    <span className="font-semibold text-red-600">
      Salida
    </span>
  ) : (
    <span>{m.movement_type || "—"}</span>
  )}
</td>

                  
<td className="px-4 py-3 font-semibold">
  {(() => {
    const quantity = Number(m.quantity ?? 0);
    const signedQuantity =
      m.movement_type === "SALE"
        ? -Math.abs(quantity)
        : quantity;

    return (
      <span
        className={
          signedQuantity < 0
            ? "text-red-600"
            : signedQuantity > 0
              ? "text-green-600"
              : "text-slate-500"
        }
      >
        {signedQuantity > 0 ? "+" : ""}
        {signedQuantity}
      </span>
    );
  })()}
</td>

<td className="px-4 py-3 font-semibold">
  {m.stock_before ?? "—"} → {m.stock_after ?? "—"}
</td>

<td className="px-4 py-3">
  <div className="font-medium">

{m.physical_count_session_id ? (
  <span className="font-semibold text-amber-700">
    Conteo físico
  </span>
) : m.document_number ? (
  `Doc. ${m.document_number}`
) : (
  "Sin documento"
)}

  </div>

  {m.order_id && (
    <div className="text-sm text-gray-500">
      Orden #{m.order_id}
    </div>
  )}

  {m.payment_method && (
    <div className="text-xs text-gray-400">
      {m.payment_method}
    </div>
  )}
</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
  {m.notes || "—"}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
  <span className="text-sm text-slate-500">
    {total === 0
      ? "Sin resultados"
      : `Mostrando ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}`}
  </span>

  <div className="flex items-center gap-3">
    <button
      type="button"
      disabled={page <= 1 || loading}
      onClick={() => setPage(p => Math.max(1, p - 1))}
      className="rounded-lg border px-4 py-2 disabled:opacity-40"
    >
      Anterior
    </button>

    <span className="text-sm font-semibold">
      Página {page} de {totalPages}
    </span>

    <button
      type="button"
      disabled={page >= totalPages || loading}
      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
      className="rounded-lg border px-4 py-2 disabled:opacity-40"
    >
      Siguiente
    </button>
  </div>
</div>

    </div>
  );
}

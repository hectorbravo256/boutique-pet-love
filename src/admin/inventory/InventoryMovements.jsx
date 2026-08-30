import React from "react";
import useInventoryMovements from "../shared/hooks/useInventoryMovements";

export default function InventoryMovements() {
  const { movimientos, loading, error, reload } = useInventoryMovements();

  if (loading) {
    return (
      <div className="p-6">
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
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Stock anterior</th>
                <th className="px-4 py-3">Stock posterior</th>
                <th className="px-4 py-3">Referencia</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {new Date(m.created_at).toLocaleString("es-CL")}
                  </td>

                  <td className="px-4 py-3">
                    {m.movement_type || "—"}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {m.quantity ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {m.stock_before ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {m.stock_after ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {m.document_number ||
                      m.order_id ||
                      m.purchase_id ||
                      m.sale_id ||
                      "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


import { useCallback, useEffect, useState } from "react";
import InventoryService from "@/admin/shared/services/InventoryService";

export default function useInventoryMovements() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [total, setTotal] = useState(0);

  const pageSize = 20;
  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await InventoryService.getMovements({
        page,
        pageSize,
        type,
        from,
        to
      });

      setMovimientos(result.movimientos);
      setTotal(result.total);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
      setError(err?.message || "Error al cargar movimientos.");
    } finally {
      setLoading(false);
    }
  }, [page, type, from, to]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    movimientos,
    loading,
    error,
    reload,
    page,
    setPage,
    type,
    setType,
    from,
    setFrom,
    to,
    setTo,
    total,
    totalPages,
    pageSize
  };
}

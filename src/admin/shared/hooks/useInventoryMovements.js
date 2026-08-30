import { useEffect, useState } from "react";
import InventoryService from "@/admin/shared/services/InventoryService";

export default function useInventoryMovements() {

    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function reload() {

try {
  setLoading(true);
  setError(null);

  const data = await InventoryService.getMovements();

  setMovimientos(data || []);
} catch (err) {
  console.error("Error cargando movimientos:", err);

  setMovimientos([]);
  setError(
    err?.message || "Error al cargar los movimientos."
  );
} finally {
  setLoading(false);
}

    }

    useEffect(() => {

        reload();

    }, []);

return {
  movimientos,
  loading,
  error,
  reload,
};

}

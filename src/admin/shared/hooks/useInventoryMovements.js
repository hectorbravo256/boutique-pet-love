import { useEffect, useState } from "react";
import InventoryService from "@/admin/shared/services/InventoryService";

export default function useInventoryMovements() {

    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    async function reload() {

        try {

            setLoading(true);

            const data =
                await InventoryService.getMovements();

            setMovimientos(data);

        } catch (error) {

            console.error(error);

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

        reload

    };

}

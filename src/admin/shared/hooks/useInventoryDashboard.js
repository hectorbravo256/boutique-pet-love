import { useEffect, useState } from "react";
import InventoryService from "@/admin/shared/services/InventoryService";

export default function useInventoryDashboard() {

    const [dashboard, setDashboard] = useState({
        stockTotal: 0,
        productos: 0,
        variantes: 0,
        stockCritico: 0,
    });

    const [loading, setLoading] = useState(true);

    async function reload() {

        try {

            setLoading(true);

            const data =
                await InventoryService.getDashboard();

            setDashboard(data);

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

        dashboard,

        loading,

        reload

    };

}

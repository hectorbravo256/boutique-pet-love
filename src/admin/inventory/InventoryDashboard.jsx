import { useEffect, useState } from "react";


import InventoryKPIs from "./dashboard/components/InventoryKPIs";
import InventoryRecentMovements from "./dashboard/components/InventoryRecentMovements";
import InventoryService from "../shared/services/InventoryService";

export default function InventoryDashboard() {

    const [dashboard, setDashboard] = useState({
        stockTotal: 0,
        productos: 0,
        variantes: 0,
        stockCritico: 0,
    });

    useEffect(() => {
        cargarDashboard();
    }, []);

async function cargarDashboard() {
    try {
        const data = await InventoryService.getDashboard();
        setDashboard(data);
    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}


return (

        <div className="space-y-8">

            <InventoryKPIs
                dashboard={dashboard}
            />

            <InventoryRecentMovements />

        </div>

    );

}

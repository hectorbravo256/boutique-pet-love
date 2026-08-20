import useInventoryDashboard from "../shared/hooks/useInventoryDashboard";

import InventoryKPIs from "./dashboard/components/InventoryKPIs";


export default function InventoryDashboard() {

    const {
        dashboard,
        loading
    } = useInventoryDashboard();

    if (loading) {
        return <p>Cargando dashboard...</p>;
    }

    return (

        <div className="space-y-8">

            <InventoryKPIs
                dashboard={dashboard}
            />

        </div>

    );

}

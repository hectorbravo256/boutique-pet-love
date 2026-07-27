import InventoryDashboard from "./inventory/InventoryDashboard";
import InventoryHome from "./inventory/InventoryHome";

import Button from "./shared/ui/Button";
import PageHeader from "./shared/ui/PageHeader";

export default function AdminInventario() {

  return (

    <div className="max-w-[1500px] mx-auto p-8">

<PageHeader
    icon="📦"
    title="Inventario"
    subtitle="Control de compras, stock y movimientos."
/>


<InventoryDashboard />

<div className="mt-8">
    <InventoryHome />
</div>


    </div>

  );

}

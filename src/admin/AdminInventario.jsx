import AdminCard from "./components/AdminCard";
import InventoryDashboard from "./inventory/InventoryDashboard";
import PurchaseForm from "./inventory/PurchaseForm";

import Button from "../shared/ui/Button";
import PageHeader from "../shared/ui/PageHeader";
import StatsCard from "../shared/ui/StatsCard";
import QuickActionCard from "../shared/ui/QuickActionCard";
import SectionTitle from "../shared/ui/SectionTitle";

export default function AdminInventario() {

  return (

    <div className="max-w-[1500px] mx-auto p-8">

<PageHeader
    icon="📦"
    title="Inventario"
    subtitle="Control de compras, stock y movimientos."

    actions={
        <Button>
            Nueva Compra
        </Button>
    }
/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

    <StatsCard
        title="Productos"
        value={totalProductos}
        icon="📦"
    />

    <StatsCard
        title="Stock Total"
        value={stockTotal}
        icon="📋"
        color="bg-blue-500"
    />

    <StatsCard
        title="Compras"
        value={comprasMes}
        icon="🛒"
        color="bg-emerald-500"
    />

    <StatsCard
        title="Movimientos"
        value={movimientosHoy}
        icon="📈"
        color="bg-orange-500"
    />

</div>

<InventoryDashboard />

      <div className="mt-8">

    <PurchaseForm />

</div>


    </div>

  );

}

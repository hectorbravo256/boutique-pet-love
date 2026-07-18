import AdminCard from "./components/AdminCard";
import InventoryDashboard from "./inventory/InventoryDashboard";
import PurchaseForm from "./inventory/PurchaseForm";

import Button from "../shared/ui/Button";
import PageHeader from "../shared/ui/PageHeader";


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
      

<InventoryDashboard />

      <div className="mt-8">

    <PurchaseForm />

</div>


    </div>

  );

}

import InventoryMasterTable from "../InventoryMasterTable";
import Button from "../../shared/ui/Button";
import PageHeader from "../../shared/ui/PageHeader";

export default function InventoryMasterPage() {
    return (
        <div className="max-w-[1500px] mx-auto p-8">

            <PageHeader
                icon="📦"
                title="Inventario Maestro"
                subtitle="Administración completa de productos, stock y variantes."
                actions={
                    <Button>
                        Nuevo Producto
                    </Button>
                }
            />

            <div className="mt-8">
                <InventoryMasterTable />
            </div>

        </div>
    );
}

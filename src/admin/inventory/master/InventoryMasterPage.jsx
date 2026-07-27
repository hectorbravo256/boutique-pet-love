import { Link } from "react-router-dom";
import InventoryMasterTable from "../InventoryMasterTable";
import Button from "../../shared/ui/Button";
import PageHeader from "../../shared/ui/PageHeader";


export default function InventoryMasterPage() {
    return (
        <div className="max-w-[1500px] mx-auto p-8">

            <div className="mb-5">

    <Link
        to="/admin/inventario"
        className="
            inline-flex
            items-center
            gap-2
            text-pink-600
            font-semibold
            hover:underline
        "
    >
        ← Volver a Inventario
    </Link>

</div>

            <PageHeader
                icon="📦"
                title="Inventario Maestro"
                subtitle="Administración completa de productos, stock y variantes."
            />

            <div className="mt-8">
                <InventoryMasterTable />
            </div>

        </div>
    );
}

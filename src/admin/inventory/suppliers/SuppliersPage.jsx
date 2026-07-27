import { Link } from "react-router-dom";

import PageHeader from "../../shared/ui/PageHeader";
import Button from "../../shared/ui/Button";

import SupplierTable from "./SupplierTable";

export default function SuppliersPage() {

    return (

        <div className="max-w-[1500px] mx-auto">

            <div className="mb-5">

                <Link
                    to="/admin/inventario"
                    className="text-pink-600 font-semibold hover:underline"
                >
                    ← Volver a Inventario
                </Link>

            </div>

            <PageHeader

                icon="🚚"

                title="Proveedores"

                subtitle="Administración de proveedores."

                actions={

                    <Button>

                        Nuevo proveedor

                    </Button>

                }

            />

            <SupplierTable />

        </div>

    );

}

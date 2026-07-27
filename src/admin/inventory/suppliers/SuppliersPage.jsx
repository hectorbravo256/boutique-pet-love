import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../shared/ui/PageHeader";
import Button from "../../shared/ui/Button";

import SupplierTable from "./SupplierTable";
import SupplierModal from "./SupplierModal";

import { createSupplier } from "./supplierService";

export default function SuppliersPage() {

    const [open, setOpen] = useState(false);

    async function handleSave(values) {

        try {

            await createSupplier(values);

            setOpen(false);

            // Más adelante recargaremos automáticamente la tabla

        } catch (error) {

            console.error(error);

            alert("Error al guardar el proveedor");

        }

    }

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
                    <Button onClick={() => setOpen(true)}>
                        Nuevo proveedor
                    </Button>
                }
            />

            <SupplierTable />

            <SupplierModal
                open={open}
                onClose={() => setOpen(false)}
                onSave={handleSave}
            />

        </div>

    );

}

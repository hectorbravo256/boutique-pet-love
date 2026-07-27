import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../shared/ui/PageHeader";
import Button from "../../shared/ui/Button";

import SupplierModal from "./SupplierModal";
import useSuppliers from "./useSuppliers";
import DataTable from "../../shared/ui/DataTable";

import { createSupplier } from "./supplierService";

export default function SuppliersPage() {

    const [open, setOpen] = useState(false);

const {

    suppliers,

    loading,

    reload

} = useSuppliers();

    const columns = [

    {
        key: "name",
        label: "Proveedor"
    },

    {
        key: "contact_name",
        label: "Contacto"
    },

    {
        key: "phone",
        label: "Teléfono"
    },

    {
        key: "email",
        label: "Correo"
    },

    {
        key: "active",
        label: "Estado",

        render: row => (

            row.active

                ? "🟢 Activo"

                : "🔴 Inactivo"

        )

    }

];

async function handleSave(values) {

    try {

        await createSupplier(values);

        await reload();

        setOpen(false);

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

            <DataTable

    columns={columns}

    data={suppliers}

    loading={loading}

    emptyMessage="No existen proveedores."

/>


            <SupplierModal
                open={open}
                onClose={() => setOpen(false)}
                onSave={handleSave}
            />

        </div>

    );

}

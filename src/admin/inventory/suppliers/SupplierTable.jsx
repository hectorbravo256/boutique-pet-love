import useSuppliers from "./useSuppliers";

export default function SupplierTable() {

    const {
        suppliers,
        loading
    } = useSuppliers();

    if (loading) {

        return <p>Cargando proveedores...</p>;

    }

    return (

        <div className="mt-8 rounded-3xl bg-white shadow overflow-hidden">

            <table className="w-full">

                <thead>

                    <tr>

                        <th className="p-4 text-left">Proveedor</th>

                        <th>Contacto</th>

                        <th>Teléfono</th>

                        <th>Email</th>

                        <th>Estado</th>

                    </tr>

                </thead>

                <tbody>

                    {suppliers.map(supplier => (

                        <tr key={supplier.id}>

                            <td className="p-4">

                                {supplier.name}

                            </td>

                            <td>{supplier.contact_name}</td>

                            <td>{supplier.phone}</td>

                            <td>{supplier.email}</td>

                            <td>

                                {

                                    supplier.active

                                        ? "🟢 Activo"

                                        : "🔴 Inactivo"

                                }

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

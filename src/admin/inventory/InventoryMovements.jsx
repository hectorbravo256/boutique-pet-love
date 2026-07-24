import AdminCard from "../components/AdminCard";
import useInventoryMovements from "@/admin/shared/hooks/useInventoryMovements";

export default function InventoryMovements() {

const {

    movimientos,

    loading

} = useInventoryMovements();

   if (loading) {

    return (

        <AdminCard>

            Cargando movimientos...

        </AdminCard>

    );

}

    return (

        <AdminCard>

            <h2 className="text-2xl font-black mb-6">

                Últimos movimientos

            </h2>

            <table className="w-full">

                <thead>

                    <tr className="text-left text-slate-500">

                        <th>Fecha</th>

                        <th>Tipo</th>

                        <th>Producto</th>

                        <th>Talla</th>

                        <th>Cantidad</th>

                    </tr>

                </thead>

                <tbody>

                    {movimientos.map(m => (

                        <tr
                            key={m.id}
                            className="border-t"
                        >

                            <td>

                                {new Date(
                                    m.created_at
                                ).toLocaleDateString("es-CL")}

                            </td>

                            <td>{m.type}</td>

                            <td>{m.products?.name}</td>

                            <td>{m.product_variants?.size}</td>

                            <td>

                                {m.quantity > 0
                                    ? `+${m.quantity}`
                                    : m.quantity}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </AdminCard>

    );

}

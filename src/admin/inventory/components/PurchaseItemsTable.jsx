import AdminCard from "../../components/AdminCard";

export default function PurchaseItemsTable({

    details

}) {

    return (

        <AdminCard>

            <h2 className="text-2xl font-black mb-6">

                Productos de la compra

            </h2>

            {
                details.length === 0 && (

                    <div className="
                        text-center
                        py-16
                        text-slate-400
                    ">

                        Aún no hay productos agregados.

                    </div>

                )
            }

            {
                details.length > 0 && (

                    <table className="w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="text-left py-3">
                                    Producto
                                </th>

                                <th className="text-center">
                                    Talla
                                </th>

                                <th className="text-center">
                                    Cantidad
                                </th>

                                <th className="text-right">
                                    Costo
                                </th>

                                <th className="text-right">
                                    Subtotal
                                </th>

                                <th></th>

                            </tr>

                        </thead>

                        <tbody>

                            {details.map((item) => (

                                <tr
                                    key={item.variant_id}
                                    className="border-b"
                                >

                                    <td className="py-4">

                                        {item.product_name}

                                    </td>

                                    <td className="text-center">

                                        {item.size}

                                    </td>

                                    <td className="text-center">

                                        {item.quantity}

                                    </td>

                                    <td className="text-right">

                                        $
                                        {Number(item.unit_cost)
                                            .toLocaleString("es-CL")}

                                    </td>

                                    <td className="text-right font-bold">

                                        $

                                        {(
                                            item.quantity *
                                            item.unit_cost
                                        ).toLocaleString("es-CL")}

                                    </td>

                                    <td className="text-center">

                                        🗑️

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )

            }

        </AdminCard>

    );

}

import AdminCard from "../../components/AdminCard";

export default function PurchaseSummary({ details }) {

    const totalProductos = details.length;

    const totalUnidades = details.reduce(
        (acc, item) => acc + Number(item.quantity),
        0
    );

    const totalCompra = details.reduce(
        (acc, item) =>
            acc + item.quantity * item.unit_cost,
        0
    );

    return (

        <AdminCard>

            <h2 className="text-2xl font-black mb-6">

                Resumen

            </h2>

            <div className="space-y-5">

                <div className="flex justify-between">

                    <span>Productos</span>

                    <strong>{totalProductos}</strong>

                </div>

                <div className="flex justify-between">

                    <span>Unidades</span>

                    <strong>{totalUnidades}</strong>

                </div>

                <div className="flex justify-between">

                    <span>Total compra</span>

                    <strong>

                        ${totalCompra.toLocaleString("es-CL")}

                    </strong>

                </div>

            </div>

        </AdminCard>

    );

}

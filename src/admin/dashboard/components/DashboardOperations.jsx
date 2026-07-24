import AdminCard from "../../components/AdminCard";

function DashboardOperations({
    summary,
    onInventory,
    onOrders,
    onPurchase
}) {

    return (

        <AdminCard title="🚀 Centro de Operaciones">

            <div className="space-y-3">

                <div className="flex justify-between">
                    <span>🔴 Variantes sin stock</span>
                    <strong>{summary?.inventory?.outOfStock ?? 0}</strong>
                </div>

                <div className="flex justify-between">
                    <span>🟠 Stock crítico</span>
                    <strong>{summary?.inventory?.lowStock ?? 0}</strong>
                </div>

                <div className="flex justify-between">
                    <span>📦 Compras este mes</span>
                    <strong>{summary?.purchases?.countMonth ?? 0}</strong>
                </div>

                <div className="flex justify-between">
                    <span>💰 Inventario valorizado</span>
                    <strong>
                        $
                        {(summary?.inventory?.inventoryValue ?? 0)
                            .toLocaleString("es-CL")}
                    </strong>
                </div>

                <hr />

                <div className="flex gap-2 flex-wrap">

                    <button
                        className="btn btn-primary"
                        onClick={onInventory}
                    >
                        Revisar Inventario
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={onOrders}
                    >
                        Ver Pedidos
                    </button>

                    <button
                        className="btn btn-success"
                        onClick={onPurchase}
                    >
                        Nueva Compra
                    </button>

                </div>

            </div>

        </AdminCard>

    );

}

export default DashboardOperations;

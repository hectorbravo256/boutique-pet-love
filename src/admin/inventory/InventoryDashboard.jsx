import AdminCard from "../components/AdminCard";

export default function InventoryDashboard() {

    return (

        <div className="grid gap-6">

            <div className="grid md:grid-cols-4 gap-6">

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Stock total
                    </div>

                    <div className="text-4xl font-black mt-3">
                        --
                    </div>

                </AdminCard>

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Compras del mes
                    </div>

                    <div className="text-4xl font-black mt-3">
                        --
                    </div>

                </AdminCard>

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Ventas locales
                    </div>

                    <div className="text-4xl font-black mt-3">
                        --
                    </div>

                </AdminCard>

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Valor inventario
                    </div>

                    <div className="text-4xl font-black mt-3">
                        --
                    </div>

                </AdminCard>

            </div>

            <AdminCard>

                <h2 className="text-2xl font-black">

                    Últimos movimientos

                </h2>

            </AdminCard>

        </div>

    );

}

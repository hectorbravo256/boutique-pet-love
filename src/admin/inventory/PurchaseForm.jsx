import AdminCard from "../components/AdminCard";

export default function PurchaseForm() {

    return (

        <AdminCard>

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h2 className="text-3xl font-black">

                        Registrar compra

                    </h2>

                    <p className="text-slate-500 mt-2">

                        Ingresa nueva mercadería al inventario.

                    </p>

                </div>

            </div>

            <div className="grid gap-5">

                <input
                    placeholder="Proveedor"
                    className="border rounded-xl p-3"
                />

                <input
                    placeholder="Número factura"
                    className="border rounded-xl p-3"
                />

                <textarea
                    placeholder="Observaciones"
                    rows={3}
                    className="border rounded-xl p-3"
                />

            </div>

        </AdminCard>

    );

}

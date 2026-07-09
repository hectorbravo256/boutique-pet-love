import AdminCard from "../../components/AdminCard";

export default function PurchaseHeader({

    supplier,
    setSupplier,

    invoiceNumber,
    setInvoiceNumber,

    observations,
    setObservations

}) {

    return (

        <AdminCard>

            <h2 className="text-3xl font-black mb-8">

                Registrar compra

            </h2>

            <div className="grid md:grid-cols-2 gap-5">

                <div>

                    <label className="text-sm font-semibold text-slate-500">

                        Proveedor

                    </label>

                    <input

                        value={supplier}

                        onChange={(e)=>
                            setSupplier(e.target.value)
                        }

                        placeholder="Ej: Mascotas SPA"

                        className="w-full mt-2 border rounded-2xl p-3"

                    />

                </div>

                <div>

                    <label className="text-sm font-semibold text-slate-500">

                        Nº Factura

                    </label>

                    <input

                        value={invoiceNumber}

                        onChange={(e)=>
                            setInvoiceNumber(e.target.value)
                        }

                        placeholder="Ej: 12345"

                        className="w-full mt-2 border rounded-2xl p-3"

                    />

                </div>

            </div>

            <div className="mt-5">

                <label className="text-sm font-semibold text-slate-500">

                    Observaciones

                </label>

                <textarea

                    value={observations}

                    onChange={(e)=>
                        setObservations(e.target.value)
                    }

                    rows={4}

                    className="w-full mt-2 border rounded-2xl p-3"

                />

            </div>

        </AdminCard>

    );

}

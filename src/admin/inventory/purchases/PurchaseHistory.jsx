import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function PurchaseHistory() {

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadPurchases() {

        try {

            setLoading(true);
            setError("");

            const { data, error } = await supabase
                .from("purchases")
                .select(`
                    id,
                    created_at,
                    purchase_date,
                    supplier,
                    document_type,
                    invoice_number,
                    total,
                    subtotal,
                    iva
                `)
                .order("purchase_date", {
                    ascending: false
                })
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            setPurchases(data || []);

        } catch (err) {

            console.error(
                "Error cargando historial de compras:",
                err
            );

            setError(
                "No fue posible cargar el historial de compras."
            );

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadPurchases();

    }, []);

    function formatDate(date) {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "es-CL"
        );

    }

    function formatMoney(value) {

        return new Intl.NumberFormat(
            "es-CL",
            {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0
            }
        ).format(Number(value) || 0);

    }

    function formatDocumentType(type) {

        const types = {

            factura_afecta: "Factura afecta",

            factura_exenta: "Factura exenta",

            boleta: "Boleta",

            otro: "Otro comprobante"

        };

        return types[type] || type || "-";

    }

    if (loading) {

        return (

            <section className="bg-white rounded-3xl p-8 shadow-sm">

                <h2 className="text-2xl font-black">
                    Historial de Compras
                </h2>

                <p className="mt-2 text-slate-500">
                    Cargando compras...
                </p>

            </section>

        );

    }

    return (

        <section className="bg-white rounded-3xl p-8 shadow-sm">

            <div className="flex items-center justify-between mb-6">

                <div>

                    <h2 className="text-2xl font-black">
                        Historial de Compras
                    </h2>

                    <p className="text-slate-500 mt-1">
                        Registro de compras realizadas.
                    </p>

                </div>

                <div className="
                    rounded-2xl
                    bg-pink-50
                    px-5
                    py-3
                    text-center
                ">

                    <div className="text-sm text-slate-500">
                        Compras
                    </div>

                    <div className="
                        text-2xl
                        font-black
                        text-pink-600
                    ">
                        {purchases.length}
                    </div>

                </div>

            </div>

            {error && (

                <div className="
                    mb-5
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-red-700
                ">

                    {error}

                </div>

            )}

            {purchases.length === 0 ? (

                <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-8
                    text-center
                    text-slate-500
                ">

                    No hay compras registradas.

                </div>

            ) : (

                <div className="
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-slate-200
                ">

                    <table className="w-full text-sm">

                        <thead>

                            <tr className="
                                bg-slate-50
                                border-b
                                border-slate-200
                            ">

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    font-bold
                                ">
                                    Fecha
                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    font-bold
                                ">
                                    Proveedor
                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    font-bold
                                ">
                                    Documento
                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    font-bold
                                ">
                                    Nº Documento
                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-right
                                    font-bold
                                ">
                                    Subtotal
                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-right
                                    font-bold
                                ">
                                    IVA
                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-right
                                    font-bold
                                ">
                                    Total
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {purchases.map((purchase) => (

                                <tr
                                    key={purchase.id}
                                    className="
                                        border-b
                                        border-slate-100
                                        last:border-b-0
                                        hover:bg-slate-50
                                    "
                                >

                                    <td className="px-4 py-4">
                                        {formatDate(
                                            purchase.purchase_date
                                        )}
                                    </td>

                                    <td className="
                                        px-4
                                        py-4
                                        font-semibold
                                    ">
                                        {purchase.supplier || "-"}
                                    </td>

                                    <td className="px-4 py-4">

                                        <span className="
                                            inline-flex
                                            rounded-full
                                            bg-pink-50
                                            px-3
                                            py-1
                                            text-xs
                                            font-bold
                                            text-pink-600
                                        ">

                                            {formatDocumentType(
                                                purchase.document_type
                                            )}

                                        </span>

                                    </td>

                                    <td className="px-4 py-4">
                                        {purchase.invoice_number || "-"}
                                    </td>

                                    <td className="
                                        px-4
                                        py-4
                                        text-right
                                    ">
                                        {formatMoney(
                                            purchase.subtotal
                                        )}
                                    </td>

                                    <td className="
                                        px-4
                                        py-4
                                        text-right
                                    ">
                                        {formatMoney(
                                            purchase.iva
                                        )}
                                    </td>

                                    <td className="
                                        px-4
                                        py-4
                                        text-right
                                        font-black
                                    ">
                                        {formatMoney(
                                            purchase.total
                                        )}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </section>

    );

}

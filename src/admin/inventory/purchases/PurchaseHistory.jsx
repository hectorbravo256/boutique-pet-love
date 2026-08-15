import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function PurchaseHistory() {

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

useEffect(() => {

    loadPurchases();

    function handlePurchaseCreated() {

        loadPurchases();

    }

    window.addEventListener(
        "purchase:created",
        handlePurchaseCreated
    );

    return () => {

        window.removeEventListener(
            "purchase:created",
            handlePurchaseCreated
        );

    };

}, []);

    async function loadPurchases() {

        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("purchases")
            .select(`
                id,
                supplier,
                document_type,
                invoice_number,
                subtotal,
                iva,
                total,
                purchase_date,
                notes
            `)
            .order("purchase_date", { ascending: false });

        if (error) {
            console.error("Error cargando historial de compras:", error);
            setError(error.message);
            setLoading(false);
            return;
        }

        setPurchases(data || []);
        setLoading(false);
    }

    function formatMoney(value) {

        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }).format(Number(value) || 0);

    }

    function formatDate(value) {

        if (!value) return "-";

        return new Date(value).toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

    }

    function documentLabel(type) {

        const labels = {
            factura_afecta: "Factura afecta",
            factura_exenta: "Factura exenta",
            boleta: "Boleta",
            otro: "Otro comprobante"
        };

        return labels[type] || type || "-";
    }

    if (loading) {

        return (
            <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-2xl font-black">
                    Historial de Compras
                </h2>

                <p className="mt-2 text-slate-500">
                    Cargando compras...
                </p>

            </div>
        );

    }

    if (error) {

        return (
            <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-2xl font-black">
                    Historial de Compras
                </h2>

                <p className="mt-3 text-red-600">
                    No fue posible cargar el historial.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    {error}
                </p>

            </div>
        );

    }

    return (

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6">

                <h2 className="text-2xl font-black">
                    Historial de Compras
                </h2>

                <p className="text-slate-500">
                    Registro de las compras realizadas y su información tributaria.
                </p>

            </div>

            {purchases.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">

                    <p className="font-semibold text-slate-600">
                        No existen compras registradas.
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Las compras guardadas aparecerán aquí.
                    </p>

                </div>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full border-collapse">

                        <thead>

                            <tr className="border-b border-slate-200 text-left">

                                <th className="px-4 py-3 text-sm font-bold text-slate-600">
                                    Fecha
                                </th>

                                <th className="px-4 py-3 text-sm font-bold text-slate-600">
                                    Proveedor
                                </th>

                                <th className="px-4 py-3 text-sm font-bold text-slate-600">
                                    Documento
                                </th>

                                <th className="px-4 py-3 text-sm font-bold text-slate-600">
                                    N° Documento
                                </th>

                                <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">
                                    Subtotal
                                </th>

                                <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">
                                    IVA
                                </th>

                                <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">
                                    Total
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {purchases.map((purchase) => (

                                <tr
                                    key={purchase.id}
                                    className="border-b border-slate-100 hover:bg-slate-50"
                                >

                                    <td className="px-4 py-4 text-sm">
                                        {formatDate(purchase.purchase_date)}
                                    </td>

                                    <td className="px-4 py-4 font-semibold">
                                        {purchase.supplier || "-"}
                                    </td>

                                    <td className="px-4 py-4 text-sm">
                                        {documentLabel(purchase.document_type)}
                                    </td>

                                    <td className="px-4 py-4 text-sm">
                                        {purchase.invoice_number || "-"}
                                    </td>

                                    <td className="px-4 py-4 text-right text-sm">
                                        {formatMoney(purchase.subtotal)}
                                    </td>

                                    <td className="px-4 py-4 text-right text-sm">
                                        {formatMoney(purchase.iva)}
                                    </td>

                                    <td className="px-4 py-4 text-right font-black">
                                        {formatMoney(purchase.total)}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );
}

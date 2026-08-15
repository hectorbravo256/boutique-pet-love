import AdminCard from "../../components/AdminCard";

export default function PurchaseSummary({
    details,
    documentType
}) {

    //---------------------------------------
    // RESUMEN DE PRODUCTOS
    //---------------------------------------

    const totalProducts = details.length;

    const totalUnits = details.reduce(
        (acc, item) => acc + Number(item.quantity),
        0
    );

    const subtotal = details.reduce(
        (acc, item) =>
            acc +
            Number(item.quantity) *
            Number(item.unit_cost),
        0
    );

    //---------------------------------------
    // DETERMINAR SI CORRESPONDE IVA
    //---------------------------------------

    const normalizedDocumentType = String(documentType || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[_-]+/g, " ");

    const isTaxableInvoice =
        normalizedDocumentType === "factura afecta";

    //---------------------------------------
    // CALCULO IVA
    //---------------------------------------

    const iva = isTaxableInvoice
        ? Math.round(subtotal * 0.19)
        : 0;

    const total = subtotal + iva;

    //---------------------------------------
    // FORMATO MONEDA
    //---------------------------------------

    function money(value) {
        return "$" + Number(value).toLocaleString("es-CL");
    }

    //---------------------------------------
    // RENDER
    //---------------------------------------

    return (
        <AdminCard>

            <h2 className="text-2xl font-black mb-8">
                Resumen de la compra
            </h2>

            <div className="space-y-5">

                <Row
                    label="Productos"
                    value={totalProducts}
                />

                <Row
                    label="Unidades"
                    value={totalUnits}
                />

                <Row
                    label="Subtotal"
                    value={money(subtotal)}
                />

                <Row
                    label={
                        isTaxableInvoice
                            ? "IVA (19%)"
                            : "IVA (0%)"
                    }
                    value={money(iva)}
                />

                <hr />

                <div className="flex justify-between items-center">

                    <span className="text-xl font-black">
                        TOTAL
                    </span>

                    <span className="text-3xl font-black text-pink-600">
                        {money(total)}
                    </span>

                </div>

            </div>

        </AdminCard>
    );
}

function Row({
    label,
    value
}) {

    return (
        <div className="flex justify-between">

            <span className="text-slate-500">
                {label}
            </span>

            <span className="font-bold">
                {value}
            </span>

        </div>
    );
}

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
        <div>

            {/* ENCABEZADO */}

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900">
                    Resumen de la compra
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Revisa los valores antes de registrar la compra.
                </p>
            </div>

            {/* RESUMEN */}

            <div className="space-y-4">

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

                <div className="my-5 border-t border-slate-200" />

                {/* TOTAL */}

                <div
                    className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        rounded-2xl
                        bg-pink-50
                        border
                        border-pink-100
                        px-5
                        py-4
                    "
                >

                    <span className="text-lg font-black text-slate-900">
                        TOTAL
                    </span>

                    <span className="text-3xl font-black text-pink-600">
                        {money(total)}
                    </span>

                </div>

            </div>

        </div>
    );
}

function Row({
    label,
    value
}) {

    return (
        <div className="flex items-center justify-between gap-4">

            <span className="text-sm font-medium text-slate-500">
                {label}
            </span>

            <span className="font-bold text-slate-900">
                {value}
            </span>

        </div>
    );
}

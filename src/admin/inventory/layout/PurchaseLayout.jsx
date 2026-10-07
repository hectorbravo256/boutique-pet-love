export default function PurchaseLayout({
    header,
    summary,
    selector,
    table,
    footer
}) {
    const hasSummary = !!summary;

    if (!hasSummary) {
        return (
            <div className="space-y-8">
                {header}
                {selector}
                {table}
                {footer}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* CONTENIDO PRINCIPAL */}
            <div className="space-y-6 xl:col-span-2">
                {header}
                {selector}
                {table}
                {footer}
            </div>

            {/* RESUMEN */}
            <div className="xl:col-span-1">
                <div className="sticky top-6">
                    {summary}
                </div>
            </div>

        </div>
    );
}

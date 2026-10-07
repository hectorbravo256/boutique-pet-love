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
        <div className="grid gap-8 xl:grid-cols-3">

            {/* CONTENIDO PRINCIPAL */}
            <div className="min-w-0 space-y-8 xl:col-span-2">
                {header}
                {selector}
                {table}
                {footer}
            </div>

            {/* RESUMEN LATERAL */}
            <aside className="min-w-0 self-start xl:sticky xl:top-6">
                {summary}
            </aside>

        </div>
    );
}

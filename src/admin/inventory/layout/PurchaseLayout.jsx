export default function PurchaseLayout({

    header,

    summary,

    selector,

    table,

    footer

}) {

    const hasSummary = !!summary;

    return (

        <div className="space-y-8">

            <div
                className={
                    hasSummary
                        ? "grid xl:grid-cols-3 gap-8"
                        : "w-full"
                }
            >

                <div
                    className={
                        hasSummary
                            ? "xl:col-span-2"
                            : "w-full"
                    }
                >

                    {header}

                </div>

                {hasSummary && (

                    <div>

                        {summary}

                    </div>

                )}

            </div>

            {selector}

            {table}

            {footer}

        </div>

    );

}

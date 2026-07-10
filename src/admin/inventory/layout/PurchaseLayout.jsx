export default function PurchaseLayout({

    header,

    summary,

    selector,

    table,

    footer

}) {

    return (

        <div className="space-y-8">

            <div className="grid xl:grid-cols-3 gap-8">

                <div className="xl:col-span-2">

                    {header}

                </div>

                <div>

                    {summary}

                </div>

            </div>

            {selector}

            {table}

            {footer}

        </div>

    );

}

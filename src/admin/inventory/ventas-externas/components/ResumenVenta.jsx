export default function ResumenVenta({
    subtotalProductos,
    costoEnvio,
    total,
    esVentaRRSS,
    envioPorPagar,
    moneda
}) {

    return (
        <div className="
            border
            border-slate-200
            rounded-2xl
            p-5
            bg-slate-50
            space-y-3
            mb-6
        ">

            <div className="
                flex
                justify-between
                items-center
            ">

                <span className="
                    text-sm
                    text-slate-500
                ">
                    Subtotal productos
                </span>

                <span className="
                    font-bold
                    text-slate-700
                ">
                    {moneda(subtotalProductos)}
                </span>

            </div>

            {esVentaRRSS && (

                <div className="
                    flex
                    justify-between
                    items-center
                ">

                    <span className="
                        text-sm
                        text-slate-500
                    ">
                        Envío
                    </span>

                    <span className="
                        font-bold
                        text-slate-700
                    ">
                        {envioPorPagar
                            ? "Por pagar"
                            : moneda(costoEnvio)
                        }
                    </span>

                </div>

            )}

            <div className="
                border-t
                border-slate-200
                pt-3
                flex
                justify-between
                items-center
            ">

                <span className="
                    text-lg
                    font-bold
                    text-slate-800
                ">
                    Total
                </span>

                <span className="
                    text-xl
                    font-black
                    text-pink-600
                ">
                    {moneda(total)}
                </span>

            </div>

        </div>
    );
}

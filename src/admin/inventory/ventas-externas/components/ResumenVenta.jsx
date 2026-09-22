export default function ResumenVenta({
    subtotalProductos,
    costoEnvio,
    total,
    esVentaRRSS,
    envioPorPagar,
    moneda
}) {
    return (
        <section className="
            mt-6
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
        ">

            {/* =================================================
                ENCABEZADO
            ================================================= */}

            <div className="
                border-b
                border-slate-200
                bg-slate-50
                px-5
                py-4
                md:px-6
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                ">

                    <div>

                        <p className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-pink-500
                        ">
                            Resumen
                        </p>

                        <h3 className="
                            mt-1
                            text-lg
                            md:text-xl
                            font-black
                            text-slate-900
                        ">
                            Total de la venta
                        </h3>

                    </div>

                    <span className={`
                        inline-flex
                        items-center
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-black
                        ${
                            esVentaRRSS
                                ? `
                                    border-emerald-200
                                    bg-emerald-50
                                    text-emerald-600
                                `
                                : `
                                    border-pink-200
                                    bg-pink-50
                                    text-pink-600
                                `
                        }
                    `}>
                        {esVentaRRSS
                            ? "📱 RRSS"
                            : "🏪 Presencial"
                        }
                    </span>

                </div>

            </div>


            {/* =================================================
                DETALLE
            ================================================= */}

            <div className="
                space-y-3
                px-5
                py-5
                md:px-6
            ">

                {/* PRODUCTOS */}

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    text-sm
                ">

                    <span className="
                        text-slate-500
                    ">
                        Productos
                    </span>

                    <span className="
                        font-bold
                        text-slate-800
                    ">
                        {moneda(subtotalProductos)}
                    </span>

                </div>


                {/* DESPACHO */}

                {esVentaRRSS && !envioPorPagar && (
                    <div className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        text-sm
                    ">

                        <span className="
                            flex
                            items-center
                            gap-2
                            text-slate-500
                        ">
                            <span>🚚</span>
                            Despacho
                        </span>

                        <span className="
                            font-bold
                            text-slate-800
                        ">
                            {moneda(costoEnvio)}
                        </span>

                    </div>
                )}


                {/* ENVÍO POR PAGAR */}

                {esVentaRRSS && envioPorPagar && (
                    <div className="
                        rounded-2xl
                        border
                        border-amber-200
                        bg-amber-50
                        px-4
                        py-3
                    ">

                        <div className="
                            flex
                            items-start
                            gap-3
                        ">

                            <span className="
                                mt-0.5
                                text-lg
                            ">
                                📦
                            </span>

                            <div>

                                <p className="
                                    text-sm
                                    font-black
                                    text-amber-800
                                ">
                                    Envío por pagar
                                </p>

                                <p className="
                                    mt-0.5
                                    text-xs
                                    leading-relaxed
                                    text-amber-700
                                ">
                                    El cliente pagará el despacho
                                    directamente al transportista.
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {/* SEPARADOR */}

                <div className="
                    border-t
                    border-dashed
                    border-slate-200
                    pt-4
                ">


                    {/* TOTAL */}

                    <div className="
                        rounded-2xl
                        bg-gradient-to-r
                        from-pink-500
                        to-purple-600
                        px-5
                        py-4
                        text-white
                        shadow-md
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-4
                        ">

                            <div>

                                <p className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white/75
                                ">
                                    Total a registrar
                                </p>

                                <p className="
                                    mt-1
                                    text-2xl
                                    md:text-3xl
                                    font-black
                                ">
                                    {moneda(total)}
                                </p>

                            </div>

                            <div className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-white/15
                                text-xl
                            ">
                                💰
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

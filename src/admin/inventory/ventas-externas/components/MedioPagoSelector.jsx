export default function MedioPagoSelector({
    medioPago,
    setMedioPago
}) {

    return (
        <div className="mb-6">

            <label className="
                block
                text-sm
                font-bold
                text-slate-600
                mb-2
            ">
                Medio de pago
            </label>

            <div className="
                grid
                grid-cols-2
                gap-3
            ">

                <button
                    type="button"
                    onClick={() =>
                        setMedioPago("efectivo")
                    }
                    className={`
                        p-4
                        rounded-2xl
                        border
                        font-bold
                        transition

                        ${
                            medioPago === "efectivo"
                                ? `
                                    bg-emerald-500
                                    text-white
                                    border-emerald-500
                                `
                                : `
                                    bg-white
                                    text-slate-600
                                    border-slate-200
                                `
                        }
                    `}
                >
                    💵 Efectivo
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setMedioPago("transferencia")
                    }
                    className={`
                        p-4
                        rounded-2xl
                        border
                        font-bold
                        transition

                        ${
                            medioPago === "transferencia"
                                ? `
                                    bg-blue-500
                                    text-white
                                    border-blue-500
                                `
                                : `
                                    bg-white
                                    text-slate-600
                                    border-slate-200
                                `
                        }
                    `}
                >
                    🏦 Transferencia
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setMedioPago("pos_tuu")
                    }
                    className={`
                        p-4
                        rounded-2xl
                        border
                        font-bold
                        transition

                        ${
                            medioPago === "pos_tuu"
                                ? `
                                    bg-purple-500
                                    text-white
                                    border-purple-500
                                `
                                : `
                                    bg-white
                                    text-slate-600
                                    border-slate-200
                                `
                        }
                    `}
                >
                    💳 POS TUU
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setMedioPago("mercado_pago")
                    }
                    className={`
                        p-4
                        rounded-2xl
                        border
                        font-bold
                        transition

                        ${
                            medioPago === "mercado_pago"
                                ? `
                                    bg-sky-500
                                    text-white
                                    border-sky-500
                                `
                                : `
                                    bg-white
                                    text-slate-600
                                    border-slate-200
                                `
                        }
                    `}
                >
                    🛒 Mercado Pago
                </button>

            </div>

        </div>
    );
}

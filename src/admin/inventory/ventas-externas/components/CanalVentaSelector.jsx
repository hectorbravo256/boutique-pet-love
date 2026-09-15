export default function CanalVentaSelector({
    tipoVenta,
    setTipoVenta
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
                Canal de venta
            </label>

            <div className="
                grid
                grid-cols-2
                gap-3
            ">

                <button
                    type="button"
                    onClick={() =>
                        setTipoVenta("presencial")
                    }
                    className={`
                        p-4
                        rounded-2xl
                        border
                        font-bold
                        transition

                        ${
                            tipoVenta === "presencial"
                                ? `
                                    bg-pink-500
                                    text-white
                                    border-pink-500
                                `
                                : `
                                    bg-white
                                    text-slate-600
                                    border-slate-200
                                `
                        }
                    `}
                >
                    🏪 Presencial
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setTipoVenta("rrss")
                    }
                    className={`
                        p-4
                        rounded-2xl
                        border
                        font-bold
                        transition

                        ${
                            tipoVenta === "rrss"
                                ? `
                                    bg-green-500
                                    text-white
                                    border-green-500
                                `
                                : `
                                    bg-white
                                    text-slate-600
                                    border-slate-200
                                `
                        }
                    `}
                >
                    📱 RRSS
                </button>

            </div>

        </div>
    );
}

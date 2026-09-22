import SectionStep from "./SectionStep";

const opcionesPago = [
    {
        value: "efectivo",
        icono: "💵",
        titulo: "Efectivo",
        descripcion: "Pago recibido en tienda",
        activo:
            "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100",
        iconoActivo: "bg-emerald-100",
        textoActivo: "text-emerald-700"
    },
    {
        value: "transferencia",
        icono: "🏦",
        titulo: "Transferencia",
        descripcion: "Pago mediante transferencia bancaria",
        activo:
            "border-blue-300 bg-blue-50 ring-2 ring-blue-100",
        iconoActivo: "bg-blue-100",
        textoActivo: "text-blue-700"
    },
    {
        value: "pos_tuu",
        icono: "💳",
        titulo: "POS TUU",
        descripcion: "Pago mediante terminal POS",
        activo:
            "border-purple-300 bg-purple-50 ring-2 ring-purple-100",
        iconoActivo: "bg-purple-100",
        textoActivo: "text-purple-700"
    },
    {
        value: "mercado_pago",
        icono: "🟢",
        titulo: "Mercado Pago",
        descripcion: "Pago realizado mediante Mercado Pago",
        activo:
            "border-cyan-300 bg-cyan-50 ring-2 ring-cyan-100",
        iconoActivo: "bg-cyan-100",
        textoActivo: "text-cyan-700"
    }
];

export default function MedioPagoSelector({
    medioPago,
    setMedioPago
}) {
    return (
        <section className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            md:p-6
            shadow-sm
        ">

            <SectionStep
                numero="7"
                titulo="Medio de pago"
                descripcion="Selecciona cómo fue recibido el pago."
            />

            <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-3
            ">

                {opcionesPago.map((opcion) => {
                    const seleccionado =
                        medioPago === opcion.value;

                    return (
                        <button
                            key={opcion.value}
                            type="button"
                            onClick={() =>
                                setMedioPago(opcion.value)
                            }
                            className={`
                                relative
                                w-full
                                rounded-2xl
                                border
                                p-4
                                text-left
                                transition-all
                                duration-200
                                focus:outline-none
                                focus:ring-4
                                focus:ring-pink-100

                                ${
                                    seleccionado
                                        ? opcion.activo
                                        : `
                                            border-slate-200
                                            bg-white
                                            hover:border-pink-200
                                            hover:bg-slate-50
                                            hover:shadow-sm
                                        `
                                }
                            `}
                        >

                            <div className="
                                flex
                                items-start
                                gap-3
                            ">

                                <div
                                    className={`
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        text-xl
                                        transition
                                        ${
                                            seleccionado
                                                ? opcion.iconoActivo
                                                : "bg-slate-100"
                                        }
                                    `}
                                >
                                    {opcion.icono}
                                </div>

                                <div className="
                                    min-w-0
                                    flex-1
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-2
                                    ">

                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    seleccionado
                                                        ? opcion.textoActivo
                                                        : "text-slate-800"
                                                }
                                            `}
                                        >
                                            {opcion.titulo}
                                        </p>

                                        {seleccionado && (
                                            <span className="
                                                flex
                                                h-5
                                                w-5
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-white
                                                text-xs
                                                font-black
                                                text-emerald-600
                                                shadow-sm
                                            ">
                                                ✓
                                            </span>
                                        )}

                                    </div>

                                    <p className="
                                        mt-1
                                        text-xs
                                        leading-relaxed
                                        text-slate-500
                                    ">
                                        {opcion.descripcion}
                                    </p>

                                </div>

                            </div>

                        </button>
                    );
                })}

            </div>

        </section>
    );
}

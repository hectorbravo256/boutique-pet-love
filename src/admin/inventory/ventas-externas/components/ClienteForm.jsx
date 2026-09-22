import SectionStep from "./SectionStep";


export default function ClienteForm({
    cliente,
    setCliente,
    esVentaRRSS
}) {

    const actualizarCampo = (campo, valor) => {

        setCliente({
            ...cliente,
            [campo]: valor
        });

    };


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
                numero="2"
                titulo="Cliente"
                descripcion={
                    esVentaRRSS
                        ? "Completa los datos del cliente."
                        : "Solo se requiere el nombre del cliente."
                }
            />


            <div className="
                grid
                grid-cols-1
                gap-5
            ">

                {/* =====================================================
                    NOMBRE
                ===================================================== */}

                <div>

                    <label className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-700
                    ">
                        Nombre del cliente
                        <span className="text-pink-500">
                            {" "}*
                        </span>
                    </label>


                    <input
                        type="text"
                        value={cliente.nombre}
                        onChange={(e) =>
                            actualizarCampo(
                                "nombre",
                                e.target.value
                            )
                        }
                        placeholder="Ej: María Soledad Contreras"
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-4
                            py-3.5
                            text-sm
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-pink-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-pink-100
                        "
                    />

                </div>


                {/* =====================================================
                    DATOS ADICIONALES RRSS
                ===================================================== */}

                {esVentaRRSS && (

                    <div className="
                        grid
                        grid-cols-1
                        gap-5
                        md:grid-cols-2
                    ">

                        {/* RUT */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                RUT
                            </label>


                            <input
                                type="text"
                                value={cliente.rut}
                                onChange={(e) =>
                                    actualizarCampo(
                                        "rut",
                                        e.target.value
                                    )
                                }
                                placeholder="Ej: 12.345.678-9"
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3.5
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-emerald-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-emerald-100
                                "
                            />

                        </div>


                        {/* CORREO */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                Correo electrónico
                            </label>


                            <input
                                type="email"
                                value={cliente.correo}
                                onChange={(e) =>
                                    actualizarCampo(
                                        "correo",
                                        e.target.value
                                    )
                                }
                                placeholder="cliente@correo.cl"
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3.5
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-emerald-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-emerald-100
                                "
                            />

                        </div>


                        {/* TELÉFONO */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                Teléfono
                            </label>


                            <input
                                type="tel"
                                value={cliente.telefono}
                                onChange={(e) =>
                                    actualizarCampo(
                                        "telefono",
                                        e.target.value
                                    )
                                }
                                placeholder="+56 9 1234 5678"
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3.5
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-emerald-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-emerald-100
                                "
                            />

                        </div>

                    </div>

                )}

            </div>

        </section>

    );

}

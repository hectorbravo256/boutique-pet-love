import SectionStep from "./SectionStep";


export default function DespachoRRSS({
    despacho,
    setDespacho,
    esRegionPaket
}) {

    const actualizarCampo = (campo, valor) => {

        setDespacho({
            ...despacho,
            [campo]: valor
        });

    };


    return (

        <section className="
            rounded-3xl
            border
            border-emerald-100
            bg-white
            p-5
            md:p-6
            shadow-sm
        ">

            <SectionStep
                numero="3"
                titulo="Despacho"
                descripcion="Completa la dirección de envío."
            />


            <div className="
                space-y-5
            ">

                {/* =====================================================
                    DIRECCIÓN
                ===================================================== */}

                <div>

                    <label className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-700
                    ">
                        Dirección
                        <span className="text-pink-500">
                            {" "}*
                        </span>
                    </label>


                    <input
                        type="text"
                        value={despacho.direccion}
                        onChange={(e) =>
                            actualizarCampo(
                                "direccion",
                                e.target.value
                            )
                        }
                        placeholder="Ej: Av. Los Libertadores 1234"
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


                {/* =====================================================
                    COMUNA + REGIÓN
                ===================================================== */}

                <div className="
                    grid
                    grid-cols-1
                    gap-5
                    md:grid-cols-2
                ">

                    {/* COMUNA */}

                    <div>

                        <label className="
                            mb-2
                            block
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            Comuna
                            <span className="text-pink-500">
                                {" "}*
                            </span>
                        </label>


                        <input
                            type="text"
                            value={despacho.comuna}
                            onChange={(e) =>
                                actualizarCampo(
                                    "comuna",
                                    e.target.value
                                )
                            }
                            placeholder="Ej: Lampa"
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


                    {/* REGIÓN */}

                    <div>

                        <label className="
                            mb-2
                            block
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            Región
                            <span className="text-pink-500">
                                {" "}*
                            </span>
                        </label>


                        <select
                            value={despacho.region}
                            onChange={(e) =>
                                actualizarCampo(
                                    "region",
                                    e.target.value
                                )
                            }
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
                                focus:border-emerald-400
                                focus:bg-white
                                focus:ring-4
                                focus:ring-emerald-100
                            "
                        >

                            <option value="">
                                Selecciona una región
                            </option>

                            <option value="Región de Arica y Parinacota">
                                Región de Arica y Parinacota
                            </option>

                            <option value="Región de Tarapacá">
                                Región de Tarapacá
                            </option>

                            <option value="Región de Antofagasta">
                                Región de Antofagasta
                            </option>

                            <option value="Región de Atacama">
                                Región de Atacama
                            </option>

                            <option value="Región de Coquimbo">
                                Región de Coquimbo
                            </option>

                            <option value="Región de Valparaíso">
                                Región de Valparaíso
                            </option>

                            <option value="Región Metropolitana de Santiago">
                                Región Metropolitana de Santiago
                            </option>

                            <option value="Región del Libertador General Bernardo O'Higgins">
                                Región del Libertador General Bernardo O'Higgins
                            </option>

                            <option value="Región del Maule">
                                Región del Maule
                            </option>

                            <option value="Región de Ñuble">
                                Región de Ñuble
                            </option>

                            <option value="Región del Biobío">
                                Región del Biobío
                            </option>

                            <option value="Región de La Araucanía">
                                Región de La Araucanía
                            </option>

                            <option value="Región de Los Ríos">
                                Región de Los Ríos
                            </option>

                            <option value="Región de Los Lagos">
                                Región de Los Lagos
                            </option>

                            <option value="Región de Aysén del General Carlos Ibáñez del Campo">
                                Región de Aysén
                            </option>

                            <option value="Región de Magallanes y de la Antártica Chilena">
                                Región de Magallanes
                            </option>

                        </select>

                    </div>

                </div>


                {/* =====================================================
                    EMPRESA DE ENVÍO
                ===================================================== */}

                {despacho.region && (

                    <div className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-4
                    ">

                        <div className="
                            mb-3
                        ">

                            <p className="
                                text-sm
                                font-black
                                text-slate-800
                            ">
                                Empresa de envío
                            </p>

                            <p className="
                                mt-1
                                text-xs
                                text-slate-500
                            ">
                                {esRegionPaket
                                    ? "Esta región está dentro de la cobertura de PAKET."
                                    : "Selecciona la empresa de envío que utilizarás."
                                }
                            </p>

                        </div>


                        {esRegionPaket ? (

                            <div className="
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-emerald-200
                                bg-emerald-50
                                px-4
                                py-4
                            ">

                                <div className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-emerald-100
                                    text-xl
                                ">
                                    🚚
                                </div>


                                <div>

                                    <p className="
                                        text-sm
                                        font-black
                                        text-emerald-700
                                    ">
                                        PAKET
                                    </p>

                                    <p className="
                                        mt-0.5
                                        text-xs
                                        font-medium
                                        text-emerald-600
                                    ">
                                        Despacho $3.500
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <select
                                value={despacho.empresa_envio}
                                onChange={(e) =>
                                    actualizarCampo(
                                        "empresa_envio",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-3.5
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:border-emerald-400
                                    focus:ring-4
                                    focus:ring-emerald-100
                                "
                            >

                                <option value="">
                                    Selecciona una empresa
                                </option>

                                <option value="starken">
                                    STARKEN
                                </option>

                                <option value="bluexpress">
                                    BLUEXPRESS
                                </option>

                            </select>

                        )}

                    </div>

                )}


                {/* =====================================================
                    INFORMACIÓN DE ENVÍO
                ===================================================== */}

                {despacho.region && !esRegionPaket && (

                    <div className="
                        rounded-2xl
                        border
                        border-amber-200
                        bg-amber-50
                        px-4
                        py-4
                    ">

                        <div className="
                            flex
                            items-start
                            gap-3
                        ">

                            <div className="
                                text-xl
                            ">
                                📦
                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    font-black
                                    text-amber-800
                                ">
                                    Envío por pagar
                                </p>

                                <p className="
                                    mt-1
                                    text-xs
                                    leading-relaxed
                                    text-amber-700
                                ">
                                    El cliente pagará el costo del despacho
                                    directamente al recibir su pedido.
                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </section>

    );

}

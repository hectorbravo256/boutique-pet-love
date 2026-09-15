export default function DespachoRRSS({
    despacho,
    setDespacho,
    esRegionPaket
}) {

    return (
        <div className="space-y-4">

            <div>
                <label>Dirección de envío</label>

                <input
                    type="text"
                    value={despacho.direccion}
                    onChange={(e) =>
                        setDespacho({
                            ...despacho,
                            direccion: e.target.value
                        })
                    }
                    placeholder="Ej: Av. Providencia 1234"
                />
            </div>


            <div>
                <label>Comuna</label>

                <input
                    type="text"
                    value={despacho.comuna}
                    onChange={(e) =>
                        setDespacho({
                            ...despacho,
                            comuna: e.target.value
                        })
                    }
                    placeholder="Ej: Providencia"
                />
            </div>


            <div>
                <label>Región</label>

                <select
                    value={despacho.region}
                    onChange={(e) =>
                        setDespacho({
                            ...despacho,
                            region: e.target.value,
                            empresa_envio: ""
                        })
                    }
                >

                    <option value="">
                        Seleccionar región
                    </option>

                    <option value="Región de Arica y Parinacota">
                        Arica y Parinacota
                    </option>

                    <option value="Región de Tarapacá">
                        Tarapacá
                    </option>

                    <option value="Región de Antofagasta">
                        Antofagasta
                    </option>

                    <option value="Región de Atacama">
                        Atacama
                    </option>

                    <option value="Región de Coquimbo">
                        Coquimbo
                    </option>

                    <option value="Valparaíso">
                        Valparaíso
                    </option>

                    <option value="Región Metropolitana de Santiago">
                        Metropolitana de Santiago
                    </option>

                    <option value="Libertador General Bernardo O'Higgins">
                        Libertador General Bernardo O'Higgins
                    </option>

                    <option value="Región del Maule">
                        Maule
                    </option>

                    <option value="Región de Ñuble">
                        Ñuble
                    </option>

                    <option value="Región del Biobío">
                        Biobío
                    </option>

                    <option value="Región de La Araucanía">
                        La Araucanía
                    </option>

                    <option value="Región de Los Ríos">
                        Los Ríos
                    </option>

                    <option value="Región de Los Lagos">
                        Los Lagos
                    </option>

                    <option value="Región de Aysén del General Carlos Ibáñez del Campo">
                        Aysén
                    </option>

                    <option value="Región de Magallanes y de la Antártica Chilena">
                        Magallanes
                    </option>

                </select>

            </div>


            {despacho.region &&
                !esRegionPaket && (

                    <div>

                        <label>
                            Empresa de envío
                        </label>

                        <select
                            value={
                                despacho.empresa_envio
                            }
                            onChange={(e) =>
                                setDespacho({
                                    ...despacho,
                                    empresa_envio:
                                        e.target.value
                                })
                            }
                        >

                            <option value="">
                                Seleccionar empresa
                            </option>

                            <option value="starken">
                                STARKEN
                            </option>

                            <option value="bluexpress">
                                BLUEXPRESS
                            </option>

                        </select>

                    </div>

                )}


            {despacho.region && (

                <div>

                    {esRegionPaket ? (

                        <>

                            <p>
                                Empresa de envío:{" "}
                                <strong>
                                    PAKET
                                </strong>
                            </p>

                            <p>
                                Costo de envío:{" "}
                                <strong>
                                    $3.500
                                </strong>
                            </p>

                        </>

                    ) : (

                        <>

                            <p>
                                Empresa de envío:{" "}
                                <strong>
                                    {despacho.empresa_envio
                                        ? despacho.empresa_envio.toUpperCase()
                                        : "Pendiente de selección"}
                                </strong>
                            </p>

                            <p>
                                <strong>
                                    Envío por pagar
                                </strong>
                            </p>

                        </>

                    )}

                </div>

            )}

        </div>
    );
}

export default function ClienteForm({
    cliente,
    setCliente,
    esVentaRRSS
}) {

    return (
        <div className="
            grid
            md:grid-cols-2
            gap-4
            mb-6
        ">

            <input
                value={
                    cliente.nombre
                }
                onChange={e =>
                    setCliente({
                        ...cliente,
                        nombre:
                            e.target.value
                    })
                }
                placeholder="Nombre del cliente"
                className="
                    border
                    border-slate-200
                    rounded-xl
                    p-3
                    outline-none
                    focus:ring-2
                    focus:ring-pink-300
                "
            />

            {esVentaRRSS && (
                <>
                    <input
                        value={
                            cliente.rut
                        }
                        onChange={e =>
                            setCliente({
                                ...cliente,
                                rut:
                                    e.target.value
                            })
                        }
                        placeholder="RUT"
                        className="
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            outline-none
                            focus:ring-2
                            focus:ring-pink-300
                        "
                    />

                    <input
                        value={
                            cliente.correo
                        }
                        onChange={e =>
                            setCliente({
                                ...cliente,
                                correo:
                                    e.target.value
                            })
                        }
                        placeholder="Correo"
                        type="email"
                        className="
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            outline-none
                            focus:ring-2
                            focus:ring-pink-300
                        "
                    />

                    <input
                        value={
                            cliente.telefono
                        }
                        onChange={e =>
                            setCliente({
                                ...cliente,
                                telefono:
                                    e.target.value
                            })
                        }
                        placeholder="Teléfono"
                        className="
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            outline-none
                            focus:ring-2
                            focus:ring-pink-300
                        "
                    />
                </>
            )}

        </div>
    );
}

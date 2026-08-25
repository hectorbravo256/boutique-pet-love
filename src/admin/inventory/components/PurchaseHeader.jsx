export default function PurchaseHeader({
    supplier,
    setSupplier,
    suppliers,

    documentType,
    setDocumentType,

    invoiceNumber,
    setInvoiceNumber,

    observations,
    setObservations
}) {

    return (
        <div>

            {/* TÍTULO DE LA SECCIÓN */}
            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900">
                    Registrar compra
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Ingresa los datos de la compra y agrega los productos recibidos.
                </p>
            </div>

            {/* DATOS PRINCIPALES */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* PROVEEDOR */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">
                        Proveedor
                    </label>

                    <select
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-slate-800
                            outline-none
                            transition
                            focus:border-pink-500
                            focus:ring-2
                            focus:ring-pink-100
                        "
                    >
                        <option value="">
                            Seleccione un proveedor
                        </option>

                        {suppliers.map((item) => (
                            <option
                                key={item.id}
                                value={item.name}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* TIPO DE DOCUMENTO */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">
                        Tipo de documento
                    </label>

                    <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-slate-800
                            outline-none
                            transition
                            focus:border-pink-500
                            focus:ring-2
                            focus:ring-pink-100
                        "
                    >
                        <option value="factura_afecta">
                            Factura afecta
                        </option>

                        <option value="factura_exenta">
                            Factura exenta
                        </option>

                        <option value="boleta">
                            Boleta
                        </option>

                        <option value="otro">
                            Otro Tipo Comprobante
                        </option>
                    </select>
                </div>

                {/* Nº DOCUMENTO */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">
                        Nº Documento
                    </label>

                    <input
                        value={invoiceNumber}
                        onChange={(e) =>
                            setInvoiceNumber(e.target.value)
                        }
                        placeholder="Ej: 12345"
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-pink-500
                            focus:ring-2
                            focus:ring-pink-100
                        "
                    />
                </div>

            </div>

            {/* OBSERVACIONES */}
            <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-600">
                    Observaciones
                </label>

                <textarea
                    value={observations}
                    onChange={(e) =>
                        setObservations(e.target.value)
                    }
                    rows={4}
                    placeholder="Agrega observaciones relacionadas con esta compra..."
                    className="
                        w-full
                        resize-y
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-3
                        text-slate-800
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-pink-500
                        focus:ring-2
                        focus:ring-pink-100
                    "
                />
            </div>

        </div>
    );
}

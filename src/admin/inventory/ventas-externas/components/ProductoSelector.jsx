
import { useRef } from "react";
import ItemsVenta from "./ItemsVenta";

export default function ProductoSelector({
    numero,
    productos,
    moneda,
    items,
    eliminarItem,
    abrirModal,
    codigoEscaneado,
    setCodigoEscaneado,
    mensajeEscaner,
    procesarCodigoBarras,
    errorProducto
}) {
    const inputEscanerRef = useRef(null);
    
    return (
        <section className="
            rounded-3xl border border-slate-200
            bg-white p-5 md:p-6 shadow-sm
        ">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="
                        flex h-10 w-10 shrink-0
                        items-center justify-center rounded-full
                        bg-gradient-to-br from-pink-500 to-purple-600
                        text-white font-black shadow-md
                    ">
                        {numero}
                    </div>

                    <div>
                        <h3 className="text-base md:text-lg font-black text-slate-800">
                            Productos
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Escanea o busca productos para agregarlos a la venta.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={abrirModal}
                    className="
                        inline-flex items-center justify-center gap-2
                        rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                        px-5 py-3 font-bold text-white shadow-md
                        transition hover:-translate-y-0.5 hover:shadow-lg
                    "
                >
                    <span className="text-xl leading-none">+</span>
                    Agregar producto
                </button>
            </div>

            {/* LECTOR DE CÓDIGOS DE BARRAS */}
            <div className="mt-5 border-t border-slate-200 pt-5">
                <h4 className="mb-1 text-sm font-bold text-slate-800">
                    Escanear código de barras
                </h4>
                <p className="mb-3 text-xs text-slate-500">
                    Escanea la etiqueta para agregar el producto automáticamente.
                </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                    
                            if (!codigoEscaneado.trim()) {
                                inputEscanerRef.current?.focus();
                                return;
                            }
                    
                            procesarCodigoBarras(codigoEscaneado);
                    
                            // Mantener el cursor listo para el siguiente escaneo.
                            inputEscanerRef.current?.focus();
                        }}
                        className="flex flex-wrap gap-3"
                    >

                    <input
                        ref={inputEscanerRef}
                        type="text"
                        value={codigoEscaneado}
                        onChange={(e) => setCodigoEscaneado(e.target.value)}
                        placeholder="Escanea o escribe BPL-00000001"
                        autoComplete="off"
                        className="
                            min-w-0 flex-1 rounded-xl
                            border border-slate-300 px-4 py-3
                            focus:border-pink-500 focus:outline-none
                        "
                    />

                    <button
                        type="submit"
                        className="
                            rounded-xl bg-pink-600 px-5 py-3
                            font-semibold text-white hover:bg-pink-700
                        "
                    >
                        Agregar
                    </button>
                </form>
                
                {errorProducto && (
                    <div
                        role="alert"
                        className="
                            mt-3 flex items-start gap-2
                            rounded-xl border border-red-200
                            bg-red-50 px-4 py-3
                            text-sm font-semibold text-red-700
                        "
                    >
                        <span>⚠️</span>
                        <span>{errorProducto}</span>
                    </div>
                )}

                {mensajeEscaner && (
                    <p className="mt-3 text-sm font-semibold text-green-700">
                        ✓ {mensajeEscaner}
                    </p>
                )}
            </div>

            <ItemsVenta
                numero={numero + 1}
                items={items}
                eliminarItem={eliminarItem}
                moneda={moneda}
                integrado={true}
            />
        </section>
    );
}

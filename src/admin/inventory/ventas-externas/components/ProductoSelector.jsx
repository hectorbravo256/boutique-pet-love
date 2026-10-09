import ItemsVenta from "./ItemsVenta";

export default function ProductoSelector({
    numero,
    productos,
    moneda,
    items,
    eliminarItem,
    abrirModal
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-full bg-gradient-to-br from-pink-500 to-purple-600
                        text-white font-black shadow-md
                    ">
                        {numero}
                    </div>

                    <div>
                        <h3 className="text-base md:text-lg font-black text-slate-800">
                            Productos
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Busca y agrega productos a la venta.
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

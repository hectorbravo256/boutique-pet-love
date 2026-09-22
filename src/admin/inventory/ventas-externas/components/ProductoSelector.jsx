import SectionStep from "./SectionStep";


export default function ProductoSelector({
    numero,
    productos,
    productoSeleccionado,
    setProductoSeleccionado,
    varianteSeleccionada,
    setVarianteSeleccionada,
    variantesDisponibles,
    varianteActual,
    cantidad,
    setCantidad,
    agregarProducto,
    moneda
}) {

    /*
    =====================================================
    ORDENAR TALLAS
    =====================================================
    Las tallas siempre se muestran de menor a mayor,
    independientemente del orden recibido desde Supabase.
    */

    const variantesOrdenadas =
        [...variantesDisponibles].sort(
            (a, b) => {

                const tallaA =
                    Number(
                        String(a.size)
                            .replace(/\D/g, "")
                    );
                
                const tallaB =
                    Number(
                        String(b.size)
                            .replace(/\D/g, "")
                    );

                return tallaA - tallaB;

            }
        );


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
                numero={numero}
                titulo="Productos"
                descripcion="Selecciona el producto, talla y cantidad."
            />


            <div className="
                space-y-5
            ">

                {/* =====================================================
                    PRODUCTO
                ===================================================== */}

                <div>

                    <label className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-700
                    ">
                        Producto
                        <span className="text-pink-500">
                            {" "}*
                        </span>
                    </label>


                    <select
                        value={productoSeleccionado}
                        onChange={(e) => {

                            setProductoSeleccionado(
                                e.target.value
                            );

                            setVarianteSeleccionada("");

                        }}
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-4
                            py-3.5
                            text-sm
                            font-medium
                            text-slate-800
                            outline-none
                            transition
                            focus:border-pink-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-pink-100
                        "
                    >

                        <option value="">
                            Selecciona un producto
                        </option>


                        {productos.map((producto) => (

                            <option
                                key={producto.id}
                                value={producto.id}
                            >
                                {producto.name}
                            </option>

                        ))}

                    </select>

                </div>


                {/* =====================================================
                    TALLA + CANTIDAD
                ===================================================== */}

                <div className="
                    grid
                    grid-cols-1
                    gap-5
                    md:grid-cols-[1fr_180px]
                ">

                    {/* TALLA */}

                    <div>

                        <label className="
                            mb-2
                            block
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            Talla
                            <span className="text-pink-500">
                                {" "}*
                            </span>
                        </label>


                        <select
                            value={varianteSeleccionada}
                            onChange={(e) =>
                                setVarianteSeleccionada(
                                    e.target.value
                                )
                            }
                            disabled={
                                !productoSeleccionado ||
                                variantesOrdenadas.length === 0
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
                                font-medium
                                text-slate-800
                                outline-none
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                focus:border-pink-400
                                focus:bg-white
                                focus:ring-4
                                focus:ring-pink-100
                            "
                        >

                            <option value="">
                                {!productoSeleccionado
                                    ? "Primero selecciona un producto"
                                    : "Selecciona una talla"
                                }
                            </option>


                            {variantesOrdenadas.map(
                                (variante) => {

                                    const stock =
                                        Number(
                                            variante.stock || 0
                                        );

                                    const sinStock =
                                        stock <= 0;

                                    return (

                                        <option
                                            key={variante.id}
                                            value={variante.id}
                                            disabled={sinStock}
                                        >

                                            {variante.size}
                                            {" · "}
                                            {moneda(
                                                variante.price
                                            )}
                                            {" · "}
                                            {sinStock
                                                ? "Sin stock"
                                                : `Stock ${stock}`
                                            }

                                        </option>

                                    );

                                }
                            )}

                        </select>

                    </div>


                    {/* CANTIDAD */}

                    <div>

                        <label className="
                            mb-2
                            block
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            Cantidad
                        </label>


                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <input
                                type="number"
                                min="1"
                                max={
                                    varianteActual
                                        ? varianteActual.stock
                                        : undefined
                                }
                                value={cantidad}
                                onChange={(e) =>
                                    setCantidad(
                                        Number(
                                            e.target.value
                                        )
                                    )
                                }
                                disabled={
                                    !varianteSeleccionada
                                }
                                className="
                                    min-w-0
                                    flex-1
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3.5
                                    text-center
                                    text-sm
                                    font-bold
                                    text-slate-800
                                    outline-none
                                    transition
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    focus:border-pink-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-pink-100
                                "
                            />


                            <button
                                type="button"
                                onClick={agregarProducto}
                                disabled={
                                    !productoSeleccionado ||
                                    !varianteSeleccionada ||
                                    !varianteActual ||
                                    Number(cantidad) <= 0 ||
                                    Number(cantidad) >
                                        Number(
                                            varianteActual.stock
                                        )
                                }
                                className="
                                    flex
                                    h-[50px]
                                    w-[50px]
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-pink-500
                                    to-purple-600
                                    text-2xl
                                    font-black
                                    text-white
                                    shadow-md
                                    transition
                                    hover:scale-[1.02]
                                    hover:shadow-lg
                                    active:scale-95
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                    disabled:hover:scale-100
                                "
                                title="Agregar producto"
                            >
                                +
                            </button>

                        </div>


                        {varianteActual && (

                            <p className="
                                mt-2
                                text-xs
                                font-medium
                                text-slate-500
                            ">
                                Stock disponible:{" "}
                                <span className="
                                    font-black
                                    text-slate-700
                                ">
                                    {varianteActual.stock}
                                </span>
                            </p>

                        )}

                    </div>

                </div>


                {/* =====================================================
                    INFORMACIÓN DE PRODUCTO
                ===================================================== */}

                {varianteActual && (

                    <div className="
                        rounded-2xl
                        border
                        border-pink-100
                        bg-gradient-to-r
                        from-pink-50
                        to-purple-50
                        px-4
                        py-4
                    ">

                        <div className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        ">

                            <div>

                                <p className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                ">
                                    Precio unitario
                                </p>

                                <p className="
                                    mt-1
                                    text-lg
                                    font-black
                                    text-slate-800
                                ">
                                    {moneda(
                                        varianteActual.price
                                    )}
                                </p>

                            </div>


                            <div className="
                                rounded-full
                                bg-white
                                px-4
                                py-2
                                text-xs
                                font-black
                                text-pink-600
                                shadow-sm
                            ">
                                Talla {varianteActual.size}
                            </div>

                        </div>

                    </div>

                )}

            </div>

        </section>

    );

}

export default function ProductoSelector({
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

    return (
        <div className="
            grid
            md:grid-cols-3
            gap-4
            items-end
            mb-6
        ">

            <div>

                <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-600
                    mb-2
                ">

                    Producto

                </label>

                <select
                    value={
                        productoSeleccionado
                    }
                    onChange={e => {

                        setProductoSeleccionado(
                            e.target.value
                        );

                        setVarianteSeleccionada(
                            ""
                        );

                    }}
                    className="
                        w-full
                        border
                        border-slate-200
                        rounded-xl
                        p-3
                        bg-white
                    "
                >

                    <option value="">

                        Seleccionar producto

                    </option>

                    {productos.map(
                        producto => (

                            <option
                                key={
                                    producto.id
                                }
                                value={
                                    producto.id
                                }
                            >

                                {
                                    producto.name
                                }

                            </option>

                        )
                    )}

                </select>

            </div>


            <div>

                <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-600
                    mb-2
                ">

                    Talla

                </label>

                <select
                    value={
                        varianteSeleccionada
                    }
                    onChange={e =>
                        setVarianteSeleccionada(
                            e.target.value
                        )
                    }
                    disabled={
                        !productoSeleccionado
                    }
                    className="
                        w-full
                        border
                        border-slate-200
                        rounded-xl
                        p-3
                        bg-white
                        disabled:bg-slate-100
                    "
                >

                    <option value="">

                        Seleccionar talla

                    </option>

                    {variantesDisponibles.map(
                        variante => (

                            <option
                                key={
                                    variante.id
                                }
                                value={
                                    variante.id
                                }
                                disabled={
                                    Number(
                                        variante.stock
                                    ) <= 0
                                }
                            >

                                {variante.size}

                                {" — "}

                                {
                                    moneda(
                                        variante.price
                                    )
                                }

                                {" — Stock: "}

                                {
                                    variante.stock
                                }

                            </option>

                        )
                    )}

                </select>

            </div>


            <div>

                <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-600
                    mb-2
                ">

                    Cantidad

                </label>

                <div className="
                    flex
                    gap-2
                ">

                    <input
                        type="number"
                        min="1"
                        max={
                            varianteActual?.stock ||
                            1
                        }
                        value={
                            cantidad
                        }
                        onChange={e =>
                            setCantidad(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                        "
                    />

                    <button
                        type="button"
                        onClick={
                            agregarProducto
                        }
                        className="
                            px-5
                            rounded-xl
                            bg-slate-900
                            text-white
                            font-bold
                            hover:bg-slate-700
                        "
                    >

                        +

                    </button>

                </div>

            </div>

        </div>
    );
}

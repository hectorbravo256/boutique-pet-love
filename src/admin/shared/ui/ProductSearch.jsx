import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export default function ProductSearch({

    products = [],

    value,

    onSelect

}) {

    const [query, setQuery] = useState("");

    const [open, setOpen] = useState(false);

    const wrapperRef = useRef(null);

    //----------------------------------------
    // Producto seleccionado
    //----------------------------------------

    const selected = products.find(

        p => p.id == value

    );

    //----------------------------------------
    // Mostrar nombre seleccionado
    //----------------------------------------

    useEffect(() => {

        if (selected) {

            setQuery(selected.name);

        }

    }, [selected]);

    //----------------------------------------
    // Cerrar al hacer click afuera
    //----------------------------------------

    useEffect(() => {

        function handleClick(e) {

            if (

                wrapperRef.current &&

                !wrapperRef.current.contains(e.target)

            ) {

                setOpen(false);

            }

        }

        document.addEventListener("mousedown", handleClick);

        return () =>

            document.removeEventListener(

                "mousedown",

                handleClick

            );

    }, []);

    //----------------------------------------
    // Filtrar productos
    //----------------------------------------

    const filtered = useMemo(() => {

        if (!query)

            return products.slice(0, 20);

        return products.filter(product =>

            product.name

                .toLowerCase()

                .includes(

                    query.toLowerCase()

                )

        );

    }, [query, products]);

    //----------------------------------------

    return (

        <div

            ref={wrapperRef}

            className="relative"

        >

            <div

                className="
                    flex
                    items-center
                    rounded-xl
                    border
                    bg-white
                    px-4
                    h-12
                    shadow-sm
                "

            >

                <Search

                    size={18}

                    className="text-slate-400"

                />

                <input

                    type="text"

                    value={query}

                    onFocus={() =>

                        setOpen(true)

                    }

                    onChange={(e) => {

                        setQuery(

                            e.target.value

                        );

                        setOpen(true);

                    }}

                    placeholder="Buscar producto..."

                    className="
                        flex-1
                        ml-3
                        outline-none
                    "

                />

            </div>

            {

                open && (

                    <div

                        className="
                            absolute
                            z-50
                            mt-2
                            w-full
                            rounded-2xl
                            border
                            bg-white
                            shadow-xl
                            max-h-80
                            overflow-y-auto
                        "

                    >

                        {

                            filtered.length === 0 && (

                                <div

                                    className="
                                        p-6
                                        text-center
                                        text-slate-400
                                    "

                                >

                                    No se encontraron productos

                                </div>

                            )

                        }

                        {

                            filtered.map(product => {

                                const image =

                                    product.product_images?.[0]?.url;

                                return (

                                    <button

                                        key={product.id}

                                        type="button"

                                        onClick={() => {

                                            onSelect(product);

                                            setQuery(

                                                product.name

                                            );

                                            setOpen(false);

                                        }}

                                        className="
                                            w-full
                                            flex
                                            items-center
                                            gap-4
                                            p-4
                                            hover:bg-slate-50
                                            transition
                                            text-left
                                        "

                                    >

                                        <img

                                            src={

                                                image ||

                                                "/placeholder-product.png"

                                            }

                                            alt={product.name}

                                            className="
                                                w-14
                                                h-14
                                                rounded-xl
                                                object-cover
                                                border
                                            "

                                        />

                                        <div>

                                            <div

                                                className="font-bold"

                                            >

                                                {product.name}

                                            </div>

                                            <div

                                                className="
                                                    text-sm
                                                    text-slate-500
                                                "

                                            >

                                                SKU PET-

                                                {String(product.id)

                                                    .padStart(4, "0")}

                                            </div>

                                        </div>

                                    </button>

                                );

                            })

                        }

                    </div>

                )

            }

        </div>

    );

}

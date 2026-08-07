export default function ProductVariantSelector({

    variants,

    selected,

    onSelect

}) {

    if (!variants.length) {

        return (

            <p className="text-slate-400 text-sm">

                Selecciona primero un producto.

            </p>

        );

    }

    return (

        <div className="flex flex-wrap gap-3">

            {variants.map(variant => (

                <button

                    key={variant.id}

                    type="button"

                    onClick={() => onSelect(variant)}

                    className={`
                        px-5
                        py-3
                        rounded-xl
                        border
                        font-semibold
                        transition-all

                        ${
                            selected == variant.id

                                ? "bg-pink-500 text-white border-pink-500 shadow-lg"

                                : "bg-white hover:bg-pink-50"
                        }
                    `}
                >

                    {variant.size}

                </button>

            ))}

        </div>

    );

}

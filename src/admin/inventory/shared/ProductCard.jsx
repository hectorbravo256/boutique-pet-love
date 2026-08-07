export default function ProductCard({ product }) {

    if (!product) return null;

    const image =
        product.product_images?.[0]?.url ||
        "/placeholder-product.png";

    return (

        <div
            className="
                w-56
                rounded-3xl
                border
                bg-white
                shadow-sm
                overflow-hidden
                flex
                flex-col
            "
        >

            {/* Imagen */}

            <div className="p-4">

                <img

                    src={image}

                    alt={product.name}

                    className="
                        w-full
                        aspect-square
                        object-cover
                        rounded-2xl
                        bg-slate-100
                    "

                />

            </div>

            {/* Información */}

            <div className="px-6 pb-6">

                <h2
                    className="
                        text-3xl
                        font-black
                        leading-tight
                        mb-5
                    "
                >
                    {product.name}
                </h2>

                <div className="space-y-3">

                    <div
                        className="
                            inline-flex
                            items-center
                            rounded-full
                            bg-pink-100
                            text-pink-700
                            px-3
                            py-1
                            text-sm
                            font-semibold
                        "
                    >
                        🏷 {product.category || "Sin categoría"}
                    </div>

                    <div className="text-sm text-slate-500">

                        SKU

                    </div>

                    <div className="font-semibold">

                        PET-{String(product.id).padStart(4,"0")}

                    </div>

                </div>

            </div>

        </div>

    );

}

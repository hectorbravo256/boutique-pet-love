export default function ProductCard({ product }) {

    if (!product) return null;

    const image =

        product.product_images?.[0]?.url ||

        "/placeholder-product.png";

    return (

        <div className="flex flex-col items-center text-center">

            <img

                src={image}

                alt={product.name}

                className="
                    w-40
                    h-40
                    rounded-3xl
                    object-cover
                    border
                    shadow-md
                "

            />

            <h2 className="

                mt-5
                text-2xl
                font-black

            ">

                {product.name}

            </h2>

            {

                product.category && (

                    <p className="

                        mt-2
                        text-slate-500

                    ">

                        {product.category}

                    </p>

                )

            }

        </div>

    );

}

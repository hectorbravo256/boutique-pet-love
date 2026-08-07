export default function ProductCard({

    product

}) {

    if (!product) return null;

    return (

        <div className="flex gap-6 items-center">

            <img

                src={product.image}

                alt={product.name}

                className="
                    w-28
                    h-28
                    rounded-2xl
                    object-cover
                    shadow
                    border
                "

            />

            <div>

                <h2 className="text-2xl font-black">

                    {product.name}

                </h2>

                <p className="text-slate-500 mt-2">

                    {product.category}

                </p>

            </div>

        </div>

    );

}

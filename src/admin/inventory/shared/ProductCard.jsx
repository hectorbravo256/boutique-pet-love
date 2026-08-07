export default function ProductCard({ product }) {

    if (!product) return null;

    const image =

        product.product_images?.[0]?.url ||

        "/placeholder-product.png";

return (

<div
    className="
        w-56
        flex
        flex-col
        items-center
        text-center
        rounded-2xl
        border
        bg-white
        p-5
        shadow-sm
    "
>

    <img

        src={image}

        alt={product.name}

        className="
            w-40
            h-40
            object-cover
            rounded-3xl
        "

    />

    <h2 className="

        mt-5

        text-xl

        font-black

    ">

        {product.name}

    </h2>

</div>

);

}

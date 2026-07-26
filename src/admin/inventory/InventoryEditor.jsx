import AdminCard from "../components/AdminCard";

export default function InventoryEditor({

    item,

    onClose

}) {

    if (!item) return null;

    return (

        <AdminCard>

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-black">

                    Editar Inventario

                </h2>

                <button

                    onClick={onClose}

                    className="
                        px-4
                        py-2
                        rounded-xl
                        bg-slate-100
                    "

                >

                    ✕

                </button>

            </div>

            <div className="flex gap-6">

                <img

                    src={item.image}

                    alt={item.product_name}

                    className="
                        w-28
                        h-28
                        rounded-2xl
                        object-cover
                    "

                />

                <div className="space-y-2">

                    <h3 className="text-xl font-bold">

                        {item.product_name}

                    </h3>

                    <p>

                        <strong>Talla:</strong> {item.size}

                    </p>

                    <p>

                        <strong>Stock:</strong> {item.stock}

                    </p>

                    <p>

                        <strong>Precio:</strong>

                        {" "}
                        ${Number(item.sale_price).toLocaleString("es-CL")}

                    </p>

                    <p>

                        <strong>Estado:</strong>

                        {" "}
                        {item.status}

                    </p>

                </div>

            </div>

        </AdminCard>

    );

}

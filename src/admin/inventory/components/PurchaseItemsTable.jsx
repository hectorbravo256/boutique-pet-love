import PurchaseItemCard from "./PurchaseItemCard";

export default function PurchaseItemsTable({
    details,
    setDetails
}) {

    //---------------------------------------
    // Actualizar cantidad
    //---------------------------------------

    function updateQuantity(index, quantity) {

        const newDetails = [...details];

        newDetails[index].quantity = quantity;

        newDetails[index].subtotal =
            quantity *
            newDetails[index].unit_cost;

        setDetails(newDetails);

    }

    //---------------------------------------
    // Actualizar costo
    //---------------------------------------

    function updateCost(index, cost) {

        const newDetails = [...details];

        newDetails[index].unit_cost = cost;

        newDetails[index].subtotal =
            cost *
            newDetails[index].quantity;

        setDetails(newDetails);

    }

    //---------------------------------------
    // Eliminar producto
    //---------------------------------------

    function removeItem(index) {

        const newDetails = [...details];

        newDetails.splice(index, 1);

        setDetails(newDetails);

    }

    //---------------------------------------
    // RENDER
    //---------------------------------------

    return (
        <div>

            {/* ENCABEZADO DE PRODUCTOS */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="text-2xl font-black text-slate-900">
                        Productos de la compra
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Revisa los productos antes de guardar la compra.
                    </p>
                </div>

                {/* CONTADOR */}

                <div
                    className="
                        flex
                        min-w-[100px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-pink-50
                        px-4
                        py-3
                        text-center
                    "
                >

                    <span className="text-lg">
                        📦
                    </span>

                    <div>
                        <div className="text-xs font-medium text-slate-500">
                            Productos
                        </div>

                        <div className="text-xl font-black text-pink-600">
                            {details.length}
                        </div>
                    </div>

                </div>

            </div>


            {/* SIN PRODUCTOS */}

            {details.length === 0 && (

                <div
                    className="
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-300
                        bg-slate-50
                        px-6
                        py-16
                        text-center
                    "
                >

                    <div className="mb-4 text-5xl">
                        📦
                    </div>

                    <h3 className="text-xl font-bold text-slate-700">
                        No hay productos agregados
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Presiona "Agregar producto" para comenzar la compra.
                    </p>

                </div>

            )}


            {/* LISTADO DE PRODUCTOS */}

            {details.length > 0 && (

                <div className="space-y-4">

                    {details.map((item, index) => (

                        <PurchaseItemCard
                            key={`${item.variant_id}-${index}`}
                            item={item}
                            index={index}
                            updateQuantity={updateQuantity}
                            updateCost={updateCost}
                            removeItem={removeItem}
                        />

                    ))}

                </div>

            )}

        </div>
    );
}

import AdminCard from "../../components/AdminCard";
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

    return (

        <AdminCard>

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h2 className="text-3xl font-black">

                        Productos de la compra

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Revisa los productos antes de guardar la compra.

                    </p>

                </div>

                <div
                    className="
                        rounded-2xl
                        bg-pink-50
                        px-5
                        py-3
                        text-center
                    "
                >

                    <div className="text-sm text-slate-500">

                        Productos

                    </div>

                    <div className="text-2xl font-black text-pink-600">

                        {details.length}

                    </div>

                </div>

            </div>

            {

                details.length === 0 && (

                    <div
                        className="
                            py-20
                            text-center
                            text-slate-400
                        "
                    >

                        <div className="text-6xl mb-5">

                            📦

                        </div>

                        <h3 className="text-2xl font-bold">

                            No hay productos agregados

                        </h3>

                        <p className="mt-2">

                            Presiona "Agregar producto"
                            para comenzar la compra.

                        </p>

                    </div>

                )

            }

            <div className="space-y-5">

                {

                    details.map((item, index)=>(

                        <PurchaseItemCard

                            key={`${item.variant_id}-${index}`}

                            item={item}

                            index={index}

                            updateQuantity={updateQuantity}

                            updateCost={updateCost}

                            removeItem={removeItem}

                        />

                    ))

                }

            </div>

        </AdminCard>

    );

}

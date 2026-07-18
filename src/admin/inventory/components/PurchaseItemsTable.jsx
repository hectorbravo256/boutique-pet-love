import AdminCard from "../../components/AdminCard";

export default function PurchaseItemsTable({

    details,

    setDetails

}) {

    function updateQuantity(index, value) {

    const newDetails = [...details];

    newDetails[index].quantity = Number(value);

    newDetails[index].subtotal =
        newDetails[index].quantity *
        newDetails[index].unit_cost;

    setDetails(newDetails);

}

function updateCost(index, value) {

    const newDetails = [...details];

    newDetails[index].unit_cost = Number(value);

    newDetails[index].subtotal =
        newDetails[index].quantity *
        newDetails[index].unit_cost;

    setDetails(newDetails);

}

function removeItem(index) {

    const newDetails = [...details];

    newDetails.splice(index, 1);

    setDetails(newDetails);

}
    
    return (

        <AdminCard>

            <h2 className="text-2xl font-black mb-6">

                Productos de la compra

            </h2>

            {
                details.length === 0 && (

                    <div className="
                        text-center
                        py-16
                        text-slate-400
                    ">

                        Aún no hay productos agregados.

                    </div>

                )
            }

            {
                details.length > 0 && (

                    <table className="w-full">

<thead>

<tr className="border-b">

    <th className="text-left py-3">

        Producto

    </th>

    <th className="text-center">

        Talla

    </th>

    <th className="text-center">

        Cantidad

    </th>

    <th className="text-right">

        Costo

    </th>

    <th className="text-right">

        Subtotal

    </th>

    <th>

        Acción

    </th>

</tr>

</thead>
                        <tbody>

                            {details.map((item, index) => (

                                <tr
                                    key={item.variant_id}
                                    className="border-b"
                                >

                                    <td className="py-4">

                                        {item.product_name}

                                    </td>

                                    <td className="text-center">

                                        {item.size}

                                    </td>

<td className="text-center">

<input

type="number"

min="1"

value={item.quantity}

onChange={(e)=>

updateQuantity(

index,

e.target.value

)

}

className="
w-20
text-center
border
rounded-xl
p-2
"

/>

</td>

<td className="text-right">

    <input

        type="number"

        value={item.unit_cost}

        onChange={(e)=>

            updateCost(

                index,

                e.target.value

            )

        }

        className="
            w-28
            text-right
            border
            rounded-xl
            p-2
        "

    />

</td>

                                    <td className="text-right font-bold">

                                        $
{item.subtotal.toLocaleString("es-CL")}

                                    </td>

                                    <td className="text-center">

    <button

        onClick={()=>

            removeItem(index)

        }

        className="
            text-red-500
            hover:text-red-700
            text-xl
        "

    >

        🗑️

    </button>

</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )

            }

        </AdminCard>

    );

}

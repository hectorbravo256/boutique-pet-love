import AdminCard from "../../components/AdminCard";
import DataTable from "../../shared/ui/DataTable";

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

const columns = [

    {
        key: "image",
        label: "",

        render: row => (

            <img
                src={row.image}
                alt={row.product_name}
                className="w-14 h-14 rounded-xl object-cover border"
            />

        )

    },

    {
        key: "product_name",
        label: "Producto"
    },

    {
        key: "size",
        label: "Talla"
    },

    {
        key: "quantity",
        label: "Cantidad",

        render: (row) => {

            const index = details.findIndex(
                d => d.variant_id === row.variant_id
            );

            return (

                <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) =>
                        updateQuantity(index, e.target.value)
                    }
                    className="w-20 rounded-xl border p-2 text-center"
                />

            );

        }

    },

    {
        key: "unit_cost",
        label: "Costo",

        render: (row) => {

            const index = details.findIndex(
                d => d.variant_id === row.variant_id
            );

            return (

                <input
                    type="number"
                    value={row.unit_cost}
                    onChange={(e) =>
                        updateCost(index, e.target.value)
                    }
                    className="w-28 rounded-xl border p-2 text-right"
                />

            );

        }

    },

    {
        key: "subtotal",
        label: "Subtotal",

        render: row => (

            <strong>

                {new Intl.NumberFormat(
                    "es-CL",
                    {
                        style: "currency",
                        currency: "CLP"
                    }
                ).format(row.subtotal)}

            </strong>

        )

    }

];
    
return (

    <AdminCard>

        <h2 className="text-2xl font-black mb-6">

            Productos de la compra

        </h2>

        <DataTable

            columns={columns}

            data={details}

            emptyMessage="Aún no hay productos agregados."

            actions={(row) => {

                const index = details.findIndex(
                    d => d.variant_id === row.variant_id
                );

                return (

                    <button

                        onClick={() => removeItem(index)}

                        className="text-red-500 hover:text-red-700"

                    >

                        🗑️

                    </button>

                );

            }}

        />

    </AdminCard>

);

}

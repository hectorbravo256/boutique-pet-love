import useInventoryMaster from "../shared/hooks/useInventoryMaster";
import AdminCard from "../components/AdminCard";
import { useState } from "react";
import InventoryEditor from "./InventoryEditor";

export default function InventoryMasterTable() {

    const {

    inventory,

    loading,

    search,

    setSearch,

    statusFilter,

    setStatusFilter

} = useInventoryMaster();

    const [selectedItem, setSelectedItem] = useState(null);

    if (loading) {
        return <p>Cargando inventario...</p>;
    }

    return (

        <AdminCard>

            <h2 className="text-3xl font-black mb-6">

                Inventario Maestro

            </h2>

            <div className="flex flex-wrap gap-4 mb-6">

    <input

        value={search}

        onChange={(e)=>
            setSearch(e.target.value)
        }

        placeholder="Buscar producto..."

        className="
            border
            rounded-xl
            p-3
            w-80
        "

    />

    <select

        value={statusFilter}

        onChange={(e)=>
            setStatusFilter(e.target.value)
        }

        className="
            border
            rounded-xl
            p-3
        "

    >

        <option value="TODOS">Todos</option>

        <option value="OK">OK</option>

        <option value="CRITICO">Crítico</option>

        <option value="SIN STOCK">Sin stock</option>

    </select>

</div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b text-slate-500">

                            <th className="text-left py-3">Imagen</th>

                            <th className="text-left">Producto</th>

                            <th>Talla</th>

                            <th>Stock</th>

                            <th>Precio</th>

                            <th>Estado</th>

                            <th className="text-center">
                                Acciones
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {inventory.map(item => (

                            <tr
                                key={item.variant_id}
                                className="
                                        border-b
                                        transition-all
                                        hover:bg-pink-50
                                        hover:shadow-sm
                                        "
                            >

                                <td className="py-3">

                                    <img

                                        src={item.image}

                                        alt={item.product_name}

                                        className="
                                                    w-16
                                                    h-16
                                                    rounded-2xl
                                                    object-cover
                                                    shadow-sm
                                                    border
                                                    "

                                    />

                                </td>

                                <td>

                                    <div className="font-bold">

                                        {item.product_name}

                                    </div>

                                    <div className="text-sm text-slate-500">

                                        {item.category}

                                    </div>

                                </td>

                                <td className="text-center">

                                    {item.size}

                                </td>

<td className="text-center">

    <span
        className={`
            font-black

            ${
                item.stock === 0

                    ? "text-red-600"

                : item.stock <= 3

                    ? "text-orange-500"

                : "text-green-600"
            }
        `}
    >

        {item.stock}

    </span>

</td>

                                <td className="text-right">

                                    $

                                    {Number(
                                        item.sale_price
                                    ).toLocaleString("es-CL")}

                                </td>

<td className="text-center">

    <span
        className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-bold

            ${
                item.status === "OK"
                    ? "bg-green-100 text-green-700"

                : item.status === "CRITICO"
                    ? "bg-orange-100 text-orange-700"

                : "bg-red-100 text-red-700"
            }
        `}
    >

        {item.status}

    </span>

</td>

        <td className="text-center">

    <button

onClick={() => setSelectedItem(item)}

    className="
        px-3
        py-2
        rounded-xl
        bg-slate-100
        hover:bg-pink-500
        hover:text-white
        transition-all
    "

>

    ✏️ Editar

</button>

</td>
                                

                            </tr>

                        ))}

                    </tbody>

                </table>
                
            </div>

            {selectedItem && (

    <div className="mt-8">

        <InventoryEditor

            item={selectedItem}

            onClose={() => setSelectedItem(null)}

        />

    </div>

)}

        </AdminCard>

    );

}

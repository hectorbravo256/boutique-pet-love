import useInventoryMaster from "../shared/hooks/useInventoryMaster";
import AdminCard from "../components/AdminCard";

export default function InventoryMasterTable() {

    const {

    inventory,

    loading,

    search,

    setSearch,

    statusFilter,

    setStatusFilter

} = useInventoryMaster();

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

                        </tr>

                    </thead>

                    <tbody>

                        {inventory.map(item => (

                            <tr
                                key={item.variant_id}
                                className="border-b hover:bg-slate-50"
                            >

                                <td className="py-3">

                                    <img

                                        src={item.image}

                                        alt={item.product_name}

                                        className="
                                            w-14
                                            h-14
                                            rounded-xl
                                            object-cover
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

                                <td className="text-center font-bold">

                                    {item.stock}

                                </td>

                                <td className="text-right">

                                    $

                                    {Number(
                                        item.sale_price
                                    ).toLocaleString("es-CL")}

                                </td>

                                <td className="text-center">

                                    {item.status}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </AdminCard>

    );

}

import useInventoryMaster from "../shared/hooks/useInventoryMaster";

export default function InventoryMasterTable() {

    const {

        inventory,

        loading

    } = useInventoryMaster();

    if (loading) {

        return <p>Cargando inventario...</p>;

    }

    return (

        <div>

            Total registros: {inventory.length}

        </div>

    );

}

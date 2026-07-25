import { useEffect, useState } from "react";
import InventoryService from "@/admin/shared/services/InventoryService";

export default function useInventoryMaster() {

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("TODOS");

    async function reload() {

        try {

            setLoading(true);

            const data =
                await InventoryService.getInventoryMaster();

            setInventory(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        reload();

    }, []);

    const filteredInventory = inventory.filter(item => {

    const matchesSearch =
        item.product_name
            .toLowerCase()
            .includes(search.toLowerCase());

    const matchesStatus =
        statusFilter === "TODOS"
            ? true
            : item.status === statusFilter;

    return matchesSearch && matchesStatus;

});

return {

    inventory: filteredInventory,

    loading,

    reload,

    search,

    setSearch,

    statusFilter,

    setStatusFilter

};

}

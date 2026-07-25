import { useEffect, useState } from "react";
import InventoryService from "@/admin/shared/services/InventoryService";

export default function useInventoryMaster() {

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

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

    return {

        inventory,

        loading,

        reload

    };

}

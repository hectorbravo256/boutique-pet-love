import { useEffect, useState } from "react";

import {
    getSuppliers
} from "./supplierService";

export default function useSuppliers() {

    const [suppliers, setSuppliers] = useState([]);

    const [loading, setLoading] = useState(true);

    async function loadSuppliers() {

        setLoading(true);

        const data = await getSuppliers();

        setSuppliers(data);

        setLoading(false);

    }

    useEffect(() => {

        loadSuppliers();

    }, []);

    return {

        suppliers,

        loading,

        reload: loadSuppliers

    };

}

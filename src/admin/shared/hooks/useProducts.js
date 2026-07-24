import { useEffect, useState } from "react";
import ProductService from "@/admin/shared/services/ProductService";

export default function useProducts() {

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    async function reload() {

        try {

            setLoading(true);

            const data = await ProductService.getProducts();

            setProductos(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        reload();

    }, []);

    return {

        productos,

        loading,

        reload

    };

}

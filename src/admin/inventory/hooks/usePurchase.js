import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function usePurchase() {

    //----------------------------------------
    // Datos generales
    //----------------------------------------

    const [supplier, setSupplier] = useState("");

    const [invoiceNumber, setInvoiceNumber] = useState("");

    const [observations, setObservations] = useState("");

    //----------------------------------------
    // Productos
    //----------------------------------------

    const [products, setProducts] = useState([]);

    const [variants, setVariants] = useState([]);

    //----------------------------------------
    // Producto seleccionado
    //----------------------------------------

    const [detail, setDetail] = useState({

        product_id: "",

        variant_id: "",

        quantity: 1,

        unit_cost: 0

    });

    //----------------------------------------
    // Detalle compra
    //----------------------------------------

    const [details, setDetails] = useState([]);

    //----------------------------------------

    useEffect(() => {

        loadProducts();

    }, []);

    //----------------------------------------
    // Cargar productos
    //----------------------------------------

    async function loadProducts() {

        const { data } =
            await supabase
                .from("products")
                .select("id,name")
                .eq("active", true)
                .order("name");

        setProducts(data || []);

    }

    //----------------------------------------
    // Cargar tallas
    //----------------------------------------

    async function loadVariants(productId) {

        const { data } =
            await supabase
                .from("product_variants")
                .select("*")
                .eq("product_id", productId)
                .order("size");

        setVariants(data || []);

    }

    //----------------------------------------

    return {

        supplier,
        setSupplier,

        invoiceNumber,
        setInvoiceNumber,

        observations,
        setObservations,

        products,

        variants,

        detail,
        setDetail,

        details,
        setDetails,

        loadVariants

    };

}

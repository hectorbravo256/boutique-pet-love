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
// Agregar producto
//----------------------------------------

function addProduct() {

    if (
        !detail.product_id ||
        !detail.variant_id ||
        detail.quantity <= 0
    ) {
        alert("Completa todos los campos.");
        return;
    }

    const product =
        products.find(
            p => p.id == detail.product_id
        );

    const variant =
        variants.find(
            v => v.id == detail.variant_id
        );

    const newItem = {

        product_id: detail.product_id,

        variant_id: detail.variant_id,

        product_name: product?.name || "",

        size: variant?.size || "",

        quantity: detail.quantity,

        unit_cost: detail.unit_cost

    };

    setDetails(prev => [

        ...prev,

        newItem

    ]);

    //------------------------------------
    // Limpiar selector
    //------------------------------------

    setDetail({

        product_id: "",

        variant_id: "",

        quantity: 1,

        unit_cost: 0

    });

    setVariants([]);

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

        loadVariants,

        addProduct

    };

}

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import PurchaseService from "../services/purchaseService";

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
                .select(` id, name, product_images(url) `)
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

    //----------------------------------------
    // Validaciones
    //----------------------------------------

    if (!detail.product_id) {

        alert("Selecciona un producto.");

        return;

    }

    if (!detail.variant_id) {

        alert("Selecciona una talla.");

        return;

    }

    if (detail.quantity <= 0) {

        alert("Cantidad inválida.");

        return;

    }

    //----------------------------------------

    const product =
        products.find(
            p => p.id == detail.product_id
        );

    const variant =
        variants.find(
            v => v.id == detail.variant_id
        );

    //----------------------------------------

    const subtotal =
        Number(detail.quantity) *
        Number(detail.unit_cost);

    //----------------------------------------

    const newItem = {

        product_id: product.id,

        product_name: product.name,

        variant_id: variant.id,

        size: variant.size,

        quantity: Number(detail.quantity),

        unit_cost: Number(detail.unit_cost),

        subtotal,

        image:
    product.product_images?.[0]?.url ||
    "/placeholder.png"

    };

    //----------------------------------------
    // Evitar duplicados
    //----------------------------------------

    const existe = details.find(

        item =>
            item.variant_id ===
            newItem.variant_id

    );

    if (existe) {

        alert(
            "Esta talla ya fue agregada."
        );

        return;

    }

    //----------------------------------------

    setDetails(prev => [

        ...prev,

        newItem

    ]);

    //----------------------------------------

    setDetail({

        product_id: "",

        variant_id: "",

        quantity: 1,

        unit_cost: 0

    });

    setVariants([]);

}

    async function savePurchase() {

    try {

        const purchaseId =
            await PurchaseService.createPurchase({

                supplier,

                invoiceNumber,

                observations

            });

        console.log("Compra creada:", purchaseId);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

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

        addProduct,

        savePurchase

    };

}

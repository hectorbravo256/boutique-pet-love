import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import PurchaseService from "../services/purchaseService";
import InventoryService from "@/admin/shared/services/InventoryService";
import { getActiveSuppliers } from "../suppliers/supplierService";

export default function usePurchase() {

    //----------------------------------------
    // Datos generales
    //----------------------------------------

    const [supplier, setSupplier] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [variantSummary, setVariantSummary] = useState(null);

    const [documentType, setDocumentType] =
        useState("factura_afecta");

    const [invoiceNumber, setInvoiceNumber] =
        useState("");

    const [observations, setObservations] =
        useState("");

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
    // Carga inicial
    //----------------------------------------

    useEffect(() => {

        loadProducts();

        loadSuppliers();

    }, []);

    //----------------------------------------
    // Cargar productos
    //----------------------------------------

    async function loadProducts() {

        const data =
            await InventoryService.getActiveProducts();

        setProducts(data);

    }

    //----------------------------------------
    // Cargar tallas
    //----------------------------------------

    async function loadVariants(productId) {

        const data =
            await InventoryService.getVariants(productId);

        data.sort((a, b) => {

            const sizeA = parseInt(
                a.size.replace(/\D/g, "")
            );

            const sizeB = parseInt(
                b.size.replace(/\D/g, "")
            );

            return sizeA - sizeB;

        });

        setVariants(data);

    }

    //----------------------------------------
    // Agregar producto
    //----------------------------------------

    function addProduct() {

        //----------------------------------------
        // Producto
        //----------------------------------------

        if (!detail.product_id) {

            alert("Selecciona un producto.");

            return;

        }

        //----------------------------------------
        // Talla
        //----------------------------------------

        if (!detail.variant_id) {

            alert("Selecciona una talla.");

            return;

        }

        //----------------------------------------
        // Cantidad
        //----------------------------------------

        if (
            !Number.isFinite(Number(detail.quantity)) ||
            Number(detail.quantity) <= 0
        ) {

            alert("La cantidad debe ser mayor a 0.");

            return;

        }

        //----------------------------------------
        // Costo
        //----------------------------------------

        if (
            !Number.isFinite(Number(detail.unit_cost)) ||
            Number(detail.unit_cost) <= 0
        ) {

            alert(
                "El costo unitario debe ser mayor a $0."
            );

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
        // Seguridad
        //----------------------------------------

        if (!product) {

            alert(
                "No se encontró el producto seleccionado."
            );

            return;

        }

        if (!variant) {

            alert(
                "No se encontró la talla seleccionada."
            );

            return;

        }

        //----------------------------------------
        // Subtotal
        //----------------------------------------

        const subtotal =
            Number(detail.quantity) *
            Number(detail.unit_cost);

        //----------------------------------------
        // Nuevo producto
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
        // Limpiar formulario
        //----------------------------------------

        setDetail({

            product_id: "",

            variant_id: "",

            quantity: 1,

            unit_cost: 0

        });

        setVariants([]);

    }

    //----------------------------------------
    // Validaciones antes de guardar
    //----------------------------------------

    function validatePurchase() {

        //----------------------------------------
        // Proveedor
        //----------------------------------------

        if (!supplier) {

            alert(
                "Selecciona un proveedor antes de guardar la compra."
            );

            return false;

        }

        //----------------------------------------
        // Tipo de documento
        //----------------------------------------

        const validDocumentTypes = [
            "factura_afecta",
            "factura_exenta",
            "boleta",
            "otro"
        ];

        if (
            !documentType ||
            !validDocumentTypes.includes(documentType)
        ) {

            alert(
                "Selecciona un tipo de documento válido."
            );

            return false;

        }

        //----------------------------------------
        // Número de documento
        //----------------------------------------

        if (!String(invoiceNumber).trim()) {

            alert(
                "Ingresa el número de documento."
            );

            return false;

        }

        //----------------------------------------
        // Productos
        //----------------------------------------

        if (!details.length) {

            alert(
                "Debes agregar al menos un producto a la compra."
            );

            return false;

        }

        //----------------------------------------
        // Validar cada línea
        //----------------------------------------

        for (let i = 0; i < details.length; i++) {

            const item = details[i];

            const lineNumber = i + 1;

            //------------------------------------
            // Producto
            //------------------------------------

            if (!item.product_id) {

                alert(
                    `El producto de la línea ${lineNumber} no es válido.`
                );

                return false;

            }

            //------------------------------------
            // Talla / variante
            //------------------------------------

            if (!item.variant_id) {

                alert(
                    `La talla del producto de la línea ${lineNumber} no es válida.`
                );

                return false;

            }

            //------------------------------------
            // Cantidad
            //------------------------------------

            if (
                !Number.isFinite(Number(item.quantity)) ||
                Number(item.quantity) <= 0
            ) {

                alert(
                    `La cantidad del producto de la línea ${lineNumber} debe ser mayor a 0.`
                );

                return false;

            }

            //------------------------------------
            // Costo unitario
            //------------------------------------

            if (
                !Number.isFinite(Number(item.unit_cost)) ||
                Number(item.unit_cost) <= 0
            ) {

                alert(
                    `El costo unitario del producto de la línea ${lineNumber} debe ser mayor a $0.`
                );

                return false;

            }

        }

        //----------------------------------------
        // Todo correcto
        //----------------------------------------

        return true;

    }

    //----------------------------------------
    // Guardar compra
    //----------------------------------------

    async function savePurchase() {

        console.log("🚀 Guardando compra...");

        //----------------------------------------
        // VALIDAR ANTES DE GUARDAR
        //----------------------------------------

        const isValid =
            validatePurchase();

        if (!isValid) {

            return;

        }

        //----------------------------------------

        console.log("Proveedor:", supplier);

        console.log(
            "Tipo documento:",
            documentType
        );

        console.log(
            "N° documento:",
            invoiceNumber
        );

        console.log(
            "Detalles:",
            details
        );

        //----------------------------------------

        try {

const purchaseId = await PurchaseService.savePurchase({

    supplier,

    documentType,

    invoiceNumber,

    observations,

    details

});

console.log("✅ Compra registrada:", purchaseId);

// ----------------------------------------
// LIMPIAR FORMULARIO
// ----------------------------------------

setSupplier("");

setDocumentType("factura_afecta");

setInvoiceNumber("");

setObservations("");

setDetails([]);

setVariants([]);

setVariantSummary(null);

setDetail({

    product_id: "",

    variant_id: "",

    quantity: 1,

    unit_cost: 0

});

// ----------------------------------------
// AVISAR AL HISTORIAL
// ----------------------------------------

window.dispatchEvent(
    new CustomEvent("purchase:created")
);

alert(
    "Compra registrada correctamente"
);

        }

        catch (error) {

            console.error(error);

            alert(
                error.message ||
                "No fue posible registrar la compra."
            );

        }

    }

    //----------------------------------------
    // Cargar proveedores
    //----------------------------------------

    async function loadSuppliers() {

        const data =
            await getActiveSuppliers();

        setSuppliers(data);

    }

    //----------------------------------------
    // Resumen de variante
    //----------------------------------------

    async function loadVariantSummary(variantId) {

        if (!variantId) {

            setVariantSummary(null);

            return;

        }

        const data =
            await InventoryService.getVariantSummary(
                variantId
            );

        setVariantSummary(data);

        setDetail(prev => ({

            ...prev,

            unit_cost: data?.last_cost
                ? Number(data.last_cost)
                : prev.unit_cost

        }));

    }

    //----------------------------------------
    // RETURN
    //----------------------------------------

    return {

        supplier,
        suppliers,
        setSupplier,

        documentType,
        setDocumentType,

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

        variantSummary,

        loadVariantSummary,

        savePurchase

    };

}

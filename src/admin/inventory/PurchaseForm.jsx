import { useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import InventoryService from "../shared/services/InventoryService";
import AdminCard from "../components/AdminCard";
import usePurchase from "./hooks/usePurchase";

import PurchaseLayout from "./layout/PurchaseLayout";
import PurchaseSummary from "./components/PurchaseSummary";
import PurchaseHeader from "./components/PurchaseHeader";
import PurchaseItemsTable from "./components/PurchaseItemsTable";
import PurchaseProductModal from "./purchases/components/PurchaseProductModal";

export default function PurchaseForm() {

const {

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

    savePurchase,
    resetPurchase

} = usePurchase();

const [openProductModal, setOpenProductModal] = useState(false);


const [codigoCompra, setCodigoCompra] = useState("");
const [errorEscaner, setErrorEscaner] = useState("");
const [mensajeEscaner, setMensajeEscaner] = useState("");
const [escaneando, setEscaneando] = useState(false);

const escaneoEnProceso = useRef(false);

const procesarEscaneoCompra = async (codigoIngresado) => {
    const codigo = String(codigoIngresado || "")
        .trim()
        .toUpperCase();

    if (!codigo || escaneoEnProceso.current) return;

    escaneoEnProceso.current = true;
    setEscaneando(true);
    setErrorEscaner("");
    setMensajeEscaner("");

    try {
        // Buscar la variante por código de barras o SKU.
        const { data: coincidencias, error: errorBusqueda } =
            await supabase
                .from("product_variants")
                .select("id, product_id, size, barcode, sku")
                .or(`barcode.eq.${codigo},sku.eq.${codigo}`)
                .limit(2);

        if (errorBusqueda) throw errorBusqueda;

        if (!coincidencias?.length) {
            setErrorEscaner(`Código no encontrado: ${codigo}`);
            return;
        }

        if (coincidencias.length > 1) {
            setErrorEscaner(
                `El código ${codigo} corresponde a más de una variante.`
            );
            return;
        }

        const variante = coincidencias[0];

        const producto = products.find(
            p => String(p.id) === String(variante.product_id)
        );

        if (!producto) {
            setErrorEscaner(
                "El producto no está disponible entre los productos activos."
            );
            return;
        }

        // Si ya está agregado, conservar su costo editable.
        const existente = details.find(
            item => String(item.variant_id) === String(variante.id)
        );

        let costo = Number(existente?.unit_cost || 0);

        if (!existente) {
            const resumen =
                await InventoryService.getVariantSummary(variante.id);

            costo = Number(resumen?.last_cost || 0);
        }
        
        // Permitir agregar productos sin costo anterior.
        if (!Number.isFinite(costo) || costo <= 0) {
            costo = 0;
        }

        setDetails(prev => {
            const indice = prev.findIndex(
                item => String(item.variant_id) === String(variante.id)
            );

            if (indice >= 0) {
                return prev.map((item, i) => {
                    if (i !== indice) return item;

                    const cantidad = Number(item.quantity) + 1;

                    return {
                        ...item,
                        quantity: cantidad,
                        subtotal: cantidad * Number(item.unit_cost)
                    };
                });
            }

            return [
                ...prev,
                {
                    product_id: producto.id,
                    product_name: producto.name,
                    variant_id: variante.id,
                    size: variante.size,
                    quantity: 1,
                    unit_cost: costo,
                    subtotal: costo,
                    image: producto.product_images?.[0]?.url ||
                        "/placeholder.png"
                }
            ];
        });

            if (costo === 0) {
                setMensajeEscaner(
                    `Agregado: ${producto.name} - ${variante.size}. ` +
                    "Pendiente de ingresar costo unitario."
                );
            } else {
                setMensajeEscaner(
                    `Agregado: ${producto.name} - ${variante.size}`
                );
            }

    } catch (error) {
        console.error("Error al escanear compra:", error);
        setErrorEscaner(
            "No fue posible consultar el producto o su último costo."
        );
    } finally {
        setCodigoCompra("");
        setEscaneando(false);
        escaneoEnProceso.current = false;
    }
};


return (

    <PurchaseLayout

        header={

            <PurchaseHeader

                supplier={supplier}
                setSupplier={setSupplier}

                suppliers={suppliers}
                
                documentType={documentType}
                setDocumentType={setDocumentType}

                invoiceNumber={invoiceNumber}
                setInvoiceNumber={setInvoiceNumber}

                observations={observations}
                setObservations={setObservations}

            />

        }

summary={
    <PurchaseSummary
        details={details}
        documentType={documentType}
        savePurchase={savePurchase}
        resetPurchase={resetPurchase}
    />
}

        table={
            <>


<PurchaseItemsTable
    details={details}
    setDetails={setDetails}
    onAddProduct={() => setOpenProductModal(true)}
    codigoCompra={codigoCompra}
    setCodigoCompra={setCodigoCompra}
    procesarEscaneoCompra={procesarEscaneoCompra}
    errorEscaner={errorEscaner}
    mensajeEscaner={mensajeEscaner}
    escaneando={escaneando}
/>
            
    <PurchaseProductModal

    open={openProductModal}

    onClose={() => setOpenProductModal(false)}

    products={products}

    variants={variants}

    detail={detail}

    setDetail={setDetail}

    loadVariants={loadVariants}

    addProduct={() => {

        addProduct();

        setOpenProductModal(false);

    }}
            variantSummary={variantSummary}
            loadVariantSummary={loadVariantSummary}

                />    
            </>
        } 

    />

);
    
}

import { useState } from "react";
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

    savePurchase

} = usePurchase();

const [openProductModal, setOpenProductModal] = useState(false);

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
    />
}

        table={
            <>

<PurchaseItemsTable
    details={details}
    setDetails={setDetails}
    onAddProduct={() => setOpenProductModal(true)}
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

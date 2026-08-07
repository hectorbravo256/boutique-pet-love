import { useState } from "react";
import AdminCard from "../components/AdminCard";
import Button from "../shared/ui/Button";
import usePurchase from "./hooks/usePurchase";

import PurchaseLayout from "./layout/PurchaseLayout";
import PurchaseSummary from "./components/PurchaseSummary";
import PurchaseHeader from "./components/PurchaseHeader";
import PurchaseItemsTable from "./components/PurchaseItemsTable";
import PurchaseFooter from "./components/PurchaseFooter";
import PurchaseProductModal from "./purchases/components/PurchaseProductModal";

export default function PurchaseForm() {

const {

    supplier,
    suppliers,
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

                invoiceNumber={invoiceNumber}
                setInvoiceNumber={setInvoiceNumber}

                observations={observations}
                setObservations={setObservations}

            />

        }

summary={<></>}

        selector={

<AdminCard>

    <div className="flex items-center justify-between">

        <div>

            <h2 className="text-2xl font-black">

                Productos

            </h2>

            <p className="text-slate-500">

                Agrega uno o más productos.

            </p>

        </div>

        <Button

            onClick={() => setOpenProductModal(true)}

        >

            + Agregar producto

        </Button>

    </div>

</AdminCard>

        }

        table={
            <>

            <PurchaseItemsTable

    details={details}

    setDetails={setDetails}

/>
                <PurchaseSummary

    details={details}

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
        

footer={

    <PurchaseFooter

        savePurchase={savePurchase}

    />

}

    />

);
    
}

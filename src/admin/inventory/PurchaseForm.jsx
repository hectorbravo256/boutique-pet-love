import usePurchase from "./hooks/usePurchase";

import PurchaseHeader from "./components/PurchaseHeader";
import PurchaseProductSelector from "./components/PurchaseProductSelector";
import PurchaseItemsTable from "./components/PurchaseItemsTable";


export default function PurchaseForm() {

const {

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

} = usePurchase();

    return (

        <div className="space-y-8">

            <PurchaseHeader

    supplier={supplier}
    setSupplier={setSupplier}

    invoiceNumber={invoiceNumber}
    setInvoiceNumber={setInvoiceNumber}

    observations={observations}
    setObservations={setObservations}

/>

            <PurchaseProductSelector

    products={products}

    variants={variants}

    detail={detail}
    setDetail={setDetail}

    loadVariants={loadVariants}

/>

     <PurchaseItemsTable

    details={details}

/>
            

        </div>

    );

}

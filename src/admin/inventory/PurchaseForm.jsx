import usePurchase from "./hooks/usePurchase";

import PurchaseLayout from "./layout/PurchaseLayout";

import PurchaseHeader from "./components/PurchaseHeader";
import PurchaseProductSelector from "./components/PurchaseProductSelector";
import PurchaseItemsTable from "./components/PurchaseItemsTable";
import PurchaseSummary from "./components/PurchaseSummary";
import PurchaseFooter from "./components/PurchaseFooter";

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

    addProduct,

    savePurchase

} = usePurchase();

return (

    <PurchaseLayout

        header={

            <PurchaseHeader

                supplier={supplier}
                setSupplier={setSupplier}

                invoiceNumber={invoiceNumber}
                setInvoiceNumber={setInvoiceNumber}

                observations={observations}
                setObservations={setObservations}

            />

        }

        summary={

            <PurchaseSummary

                details={details}

            />

        }

        selector={

            <PurchaseProductSelector

                products={products}

                variants={variants}

                detail={detail}
                setDetail={setDetail}

                loadVariants={loadVariants}

                addProduct={addProduct}

            />

        }

        table={

            <PurchaseItemsTable

    details={details}

    setDetails={setDetails}

/>

        }

footer={

    <PurchaseFooter

        savePurchase={savePurchase}

    />

}

    />

);
    
}

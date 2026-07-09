import usePurchase from "./hooks/usePurchase";

import PurchaseHeader
from "./components/PurchaseHeader";

export default function PurchaseForm() {

    const purchase =
        usePurchase();

    return (

        <div className="space-y-8">

            <PurchaseHeader

                supplier={purchase.supplier}
                setSupplier={purchase.setSupplier}

                invoiceNumber={purchase.invoiceNumber}
                setInvoiceNumber={purchase.setInvoiceNumber}

                observations={purchase.observations}
                setObservations={purchase.setObservations}

            />

        </div>

    );

}

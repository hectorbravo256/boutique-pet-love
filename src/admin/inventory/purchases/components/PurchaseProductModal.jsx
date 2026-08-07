import Modal from "../../../shared/ui/Modal";

import PurchaseProductSelector from "../../components/PurchaseProductSelector";

export default function PurchaseProductModal({

    open,

    onClose,

    ...props

}) {

    if (!open) return null;

    return (

        <Modal

            title="Agregar producto"
            open={open}
            onClose={onClose}
            maxWidth="5xl"

        >

            <PurchaseProductSelector

                {...props}

            />

        </Modal>

    );

}

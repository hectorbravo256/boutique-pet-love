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
    open={open}
    onClose={onClose}
    title="Agregar producto"
    size="xxl"
    workspace
>

            <PurchaseProductSelector

                {...props}

            />

        </Modal>

    );

}

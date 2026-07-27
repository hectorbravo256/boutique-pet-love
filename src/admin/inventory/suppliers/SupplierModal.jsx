import SupplierForm from "./SupplierForm";

export default function SupplierModal({

    open,

    onClose,

    onSave

}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl p-8 w-[600px]">

                <h2 className="text-2xl font-bold mb-6">

                    Nuevo proveedor

                </h2>

                <SupplierForm

                    onSubmit={onSave}

                    onCancel={onClose}

                />

            </div>

        </div>

    );

}

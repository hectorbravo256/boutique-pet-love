import { Link } from "react-router-dom";
import { useState } from "react";

import Modal from "../../shared/ui/Modal";
import Button from "../../shared/ui/Button";

import PageHeader from "../../shared/ui/PageHeader";

import PurchaseDashboard from "./PurchaseDashboard";
import PurchaseForm from "../PurchaseForm";
import PurchaseHistory from "./PurchaseHistory";

export default function PurchasePage() {

    const [testModal, setTestModal] = useState(false);

    return (

        <div className="max-w-[1500px] mx-auto p-8">

            <div className="mb-5">

                <Link
                    to="/admin/inventario"
                    className="text-pink-600 font-semibold hover:underline"
                >
                    ← Volver a Inventario
                </Link>

            </div>

            <PageHeader
                icon="📥"
                title="Compras"
                subtitle="Recepción de mercadería y actualización de stock."
            />

            <div className="mt-6 mb-6">

    <Button onClick={() => setTestModal(true)}>

        🧪 Probar Modal

    </Button>

</div>

            <PurchaseDashboard />

            <div className="mt-8">

                <PurchaseForm />

            </div>

            <div className="mt-8">

                <PurchaseHistory />

            </div>

            <Modal

    open={testModal}

    onClose={() => setTestModal(false)}

    title="Modal de prueba"

>

    <div className="space-y-4">

        <p>

            ¡Felicitaciones!

            Tu componente Modal está funcionando correctamente.

        </p>

        <Button

            onClick={() => setTestModal(false)}

        >

            Cerrar

        </Button>

    </div>

</Modal>

        </div>

    );

}

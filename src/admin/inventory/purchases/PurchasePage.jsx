import { Link } from "react-router-dom";

import InventorySection from "../shared/InventorySection";

import PurchaseForm from "../PurchaseForm";
import PurchaseHistory from "./PurchaseHistory";

export default function PurchasePage() {
    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-8 p-6 lg:p-8">

            {/* VOLVER */}
            <div>
                <Link
                    to="/admin/inventario"
                    className="inline-flex items-center text-sm font-semibold text-pink-600 transition hover:text-pink-700 hover:underline"
                >
                    ← Volver a Inventario
                </Link>
            </div>

            {/* ENCABEZADO */}
            <InventorySection
                icon="📥"
                title="Compras"
                subtitle="Recepción de mercadería y actualización de stock."
            />

            {/* REGISTRO DE COMPRA */}
            <div>
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Registrar compra
                    </h2>
            
                    <p className="mt-1 text-sm text-slate-500">
                        Ingresa los datos de la compra y agrega los productos recibidos.
                    </p>
                </div>
            
                <PurchaseForm />
            </div>

            {/* HISTORIAL */}
            <InventorySection
                icon="🕘"
                title="Historial de compras"
                subtitle="Registro de las compras realizadas y su información tributaria."
            >
                <PurchaseHistory />
            </InventorySection>

        </div>
    );
}

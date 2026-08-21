import { Link } from "react-router-dom";


import PageHeader from "../../shared/ui/PageHeader";


import PurchaseForm from "../PurchaseForm";
import PurchaseHistory from "./PurchaseHistory";

export default function PurchasePage() {


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


            <div className="mt-8">

                <PurchaseForm />

            </div>

            <div className="mt-8">

                <PurchaseHistory />

            </div>

        </div>

    );

}

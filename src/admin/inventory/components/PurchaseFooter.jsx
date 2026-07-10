import AdminCard from "../../components/AdminCard";

export default function PurchaseFooter() {

    return (

        <AdminCard>

            <div className="flex justify-end gap-4">

                <button
                    className="
                        px-6
                        py-3
                        rounded-xl
                        bg-slate-200
                        font-bold
                    "
                >
                    Cancelar
                </button>

                <button
                    className="
                        px-6
                        py-3
                        rounded-xl
                        bg-pink-500
                        text-white
                        font-bold
                    "
                >
                    Guardar compra
                </button>

            </div>

        </AdminCard>

    );

}

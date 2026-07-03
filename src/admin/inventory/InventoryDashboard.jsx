import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminCard from "../components/AdminCard";
import InventoryMovements from "./InventoryMovements";

export default function InventoryDashboard() {

    const [dashboard, setDashboard] = useState({

    stockTotal: 0,

    productos: 0,

    variantes: 0,

    stockCritico: 0

});

    useEffect(() => {

    cargarDashboard();

}, []);

    async function cargarDashboard() {

    //-----------------------------------
    // STOCK TOTAL
    //-----------------------------------

    const { data: variantes } =
        await supabase
            .from("product_variants")
            .select("stock");

    const stockTotal =
        (variantes || [])
            .reduce(
                (a, b) => a + Number(b.stock),
                0
            );

    //-----------------------------------
    // PRODUCTOS
    //-----------------------------------

    const { count: productos } =
        await supabase
            .from("products")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("active", true);

    //-----------------------------------
    // VARIANTES
    //-----------------------------------

    const { count: variantesCount } =
        await supabase
            .from("product_variants")
            .select("*", {
                count: "exact",
                head: true
            });

    //-----------------------------------
    // STOCK CRÍTICO
    //-----------------------------------

    const stockCritico =
        (variantes || [])
            .filter(v => v.stock <= 3)
            .length;

    //-----------------------------------

    setDashboard({

        stockTotal,

        productos,

        variantes: variantesCount,

        stockCritico

    });

}


    return (

        <div className="grid gap-6">

            <div className="grid md:grid-cols-4 gap-6">

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Stock total
                    </div>

                    <div className="text-4xl font-black mt-3">
                        {dashboard.stockTotal}
                    </div>

                </AdminCard>

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Productos activos
                    </div>

                    <div className="text-4xl font-black mt-3">
                        {dashboard.productos}
                    </div>

                </AdminCard>

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Variantes
                    </div>

                    <div className="text-4xl font-black mt-3">
                        {dashboard.variantes}
                    </div>

                </AdminCard>

                <AdminCard>

                    <div className="text-slate-500 text-sm">
                        Stock crítico
                    </div>

                    <div className="text-4xl font-black mt-3">
                        {dashboard.stockCritico}
                    </div>

                </AdminCard>

            </div>

            <InventoryMovements />

        </div>

    );

}

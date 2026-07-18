import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

import InventoryKPIs from "./dashboard/components/InventoryKPIs";
import InventoryRecentMovements from "./dashboard/components/InventoryRecentMovements";

export default function InventoryDashboard() {

    const [dashboard, setDashboard] = useState({
        stockTotal: 0,
        productos: 0,
        variantes: 0,
        stockCritico: 0,
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

        <div className="space-y-8">

            <InventoryKPIs
                dashboard={dashboard}
            />

            <InventoryRecentMovements />

        </div>

    );

}

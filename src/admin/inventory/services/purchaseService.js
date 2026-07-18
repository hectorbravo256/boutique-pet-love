import { supabase } from "../../../supabaseClient";

class PurchaseService {

    //----------------------------------------
    // Crear cabecera compra
    //----------------------------------------

    async createPurchase({

        supplier,

        invoiceNumber,

        observations

    }) {

        const { data, error } =
            await supabase.rpc(
                "registrar_compra",
                {

                    p_supplier: supplier,

                    p_invoice: invoiceNumber,

                    p_observations: observations

                }
            );

        if (error) throw error;

        return data;

    }

}

export default new PurchaseService();

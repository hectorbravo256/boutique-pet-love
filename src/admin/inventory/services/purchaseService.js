import { supabase } from "../../../supabaseClient";

class PurchaseService {

    async savePurchase({

        supplier,

        invoiceNumber,

        observations,

        details

    }) {

        const { data, error } =
            await supabase.rpc(
                "guardar_compra_completa",
                {

                    p_supplier: supplier,

                    p_invoice: invoiceNumber,

                    p_observations: observations,

                    p_items: details

                }

            );

        if (error) throw error;

        return data;

    }

}

export default new PurchaseService();

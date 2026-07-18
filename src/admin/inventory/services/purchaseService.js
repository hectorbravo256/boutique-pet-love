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

    //----------------------------------------
// Agregar detalle compra
//----------------------------------------

async addPurchaseDetail({

    purchaseId,

    item

}) {

    const { error } =
        await supabase
            .from("purchase_details")
            .insert({

                purchase_id: purchaseId,

                product_id: item.product_id,

                variant_id: item.variant_id,

                quantity: item.quantity,

                unit_cost: item.unit_cost,

                subtotal: item.subtotal

            });

    if (error) throw error;

}

}

export default new PurchaseService();

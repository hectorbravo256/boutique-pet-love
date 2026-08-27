const {
  createClient,
} = require("@supabase/supabase-js");

const confirmarVenta = async ({
  paymentId,
  orderData,
}) => {

  const supabase =
    createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },

        realtime: {
          enabled: false,
        },
      }
    );

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "confirmar_venta_online",
      {
        p_payment_id:
          String(paymentId),

        p_order_data:
          orderData,
      }
    );

  if (error) {

    console.log(
      "ERROR RPC confirmar_venta_online:",
      error
    );

    return {
      success: false,
      error,
    };
  }

  console.log(
    "RESULTADO confirmar_venta_online:",
    data
  );

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    console.log(
      "RPC SIN RESULTADO"
    );

    return {
      success: false,
      error:
        "La RPC no devolvió resultado",
    };
  }

  const result = data[0];

  return {
    success: true,

    orderId:
      result.order_id,

    numeroVenta:
      result.numero_venta,

    finalTotal:
      Number(result.total || 0),

    alreadyProcessed:
      result.already_processed === true,
  };
};

module.exports = {
  confirmarVenta,
};

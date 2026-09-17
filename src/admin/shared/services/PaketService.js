import { supabase } from "../../../supabaseClient";


const CAMPOS = `
  id,
  order_id,
  carrier,
  amount,
  paid_by,
  reimbursement_status,
  paid_at,
  reimbursed_at,
  reimbursement_payment_method,
  notes,
  created_at
`;


const normalizarError = (error) => {

  if (!error) {
    return "Error desconocido.";
  }

  return (
    error.message ||
    error.details ||
    error.hint ||
    "No fue posible completar la operación."
  );

};


const PaketService = {


  // =========================================================
  // OBTENER GASTOS PAKET
  // =========================================================

  async getExpenses() {

    const {
      data,
      error
    } = await supabase

      .from("shipping_expenses")

      .select(CAMPOS)

      .ilike(
        "carrier",
        "PAKET"
      )

      .order(
        "reimbursement_status",
        {
          ascending: true
        }
      )

      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {

      throw new Error(
        normalizarError(error)
      );

    }


    const expenses =
      data || [];


    if (
      expenses.length === 0
    ) {

      return [];

    }


    // -------------------------------------------------------
    // OBTENER IDS DE LAS VENTAS
    // -------------------------------------------------------

    const orderIds = [

      ...new Set(

        expenses

          .map(
            expense =>
              expense.order_id
          )

          .filter(Boolean)

      )

    ];


    if (
      orderIds.length === 0
    ) {

      return expenses.map(
        expense => ({
          ...expense,
          order: null
        })
      );

    }


    // -------------------------------------------------------
    // OBTENER INFORMACIÓN DE LAS VENTAS
    // -------------------------------------------------------

    const {
      data: orders,
      error: ordersError
    } = await supabase

      .from("orders")

      .select(`
        id,
        numero_venta,
        nombre,
        costo_envio
      `)

      .in(
        "id",
        orderIds
      );


    if (ordersError) {

      throw new Error(
        normalizarError(
          ordersError
        )
      );

    }


    const ordersById =
      new Map(

        (orders || []).map(
          order => [
            order.id,
            order
          ]
        )

      );


    // -------------------------------------------------------
    // COMBINAR GASTO + VENTA
    // -------------------------------------------------------

    return expenses.map(
      expense => ({

        ...expense,

        order:
          ordersById.get(
            expense.order_id
          ) || null

      })
    );

  },


  // =========================================================
  // REGISTRAR REEMBOLSO
  // =========================================================

  async marcarReembolso({

    id,
    paymentMethod,
    notes

  }) {


    if (!id) {

      throw new Error(
        "El gasto PAKET es obligatorio."
      );

    }


    if (
      !paymentMethod ||
      !String(
        paymentMethod
      ).trim()
    ) {

      throw new Error(
        "El medio de pago del reembolso es obligatorio."
      );

    }


    const {
      data,
      error
    } = await supabase.rpc(

      "marcar_reembolso_paket",

      {

        p_shipping_expense_id:
          id,

        p_payment_method:
          String(
            paymentMethod
          ).trim(),

        p_notes:
          notes
            ? String(
                notes
              ).trim()
            : null

      }

    );


    if (error) {

      throw new Error(
        normalizarError(error)
      );

    }


    return data;

  },


  // =========================================================
  // OBTENER RESUMEN
  // =========================================================

  calcularResumen(
    expenses = []
  ) {


    const resumen = {

      totalDespachos: 0,

      costoTotal: 0,

      pendienteReembolso: 0,

      reembolsado: 0,

      absorbido: 0,

      cobradoClientes: 0

    };


    expenses.forEach(
      expense => {

        const monto =
          Number(
            expense.amount
          ) || 0;


        const costoEnvio =
          Number(
            expense.order?.costo_envio
          ) || 0;


        resumen.totalDespachos +=
          1;


        resumen.costoTotal +=
          monto;


        if (
          expense.reimbursement_status ===
          "pending"
        ) {

          resumen.pendienteReembolso +=
            monto;

        }


        if (
          expense.reimbursement_status ===
          "reimbursed"
        ) {

          resumen.reembolsado +=
            monto;

        }


        if (
          costoEnvio === 0
        ) {

          resumen.absorbido +=
            monto;

        } else {

          resumen.cobradoClientes +=
            costoEnvio;

        }

      }
    );


    return resumen;

  }

};


export default PaketService;

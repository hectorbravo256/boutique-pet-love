global.WebSocket = require("ws");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
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

exports.handler = async () => {

  try {

    // ============================================================
    // OBTENER PEDIDOS
    // ============================================================

    const { data, error } =
      await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });


    if (error) {

      console.log(
        "SUPABASE ERROR:",
        error
      );

      return {
        statusCode: 500,

        body: JSON.stringify({
          error: error.message,
        }),
      };

    }


    // ============================================================
    // OBTENER IDS DE LAS VENTAS
    // ============================================================

    const orderIds =
      (
        Array.isArray(data)
          ? data
          : []
      )
        .map((o) => o.id)
        .filter(Boolean);


    // ============================================================
    // OBTENER CAMBIOS Y COBROS ADICIONALES
    // ============================================================

    let exchanges = [];


    if (orderIds.length > 0) {

      const {
        data: exchangeData,
        error: exchangeError,
      } =
        await supabase
          .from("sale_exchanges")
          .select(`
            id,
            order_id,
            additional_payment,
            payment_status,
            payment_method,
            created_at
          `)
          .in(
            "order_id",
            orderIds
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


      if (exchangeError) {

        console.log(
          "SALE EXCHANGES ERROR:",
          exchangeError
        );

        /*
         * No detenemos la carga de Ventas
         * si la tabla de cambios presenta
         * algún problema.
         *
         * En ese caso las ventas normales
         * seguirán funcionando.
         */

        exchanges = [];

      } else {

        exchanges =
          Array.isArray(
            exchangeData
          )
            ? exchangeData
            : [];

      }

    }


    // ============================================================
    // SANITIZAR PEDIDOS
    // ============================================================

    const safeData =
      (
        Array.isArray(data)
          ? data
          : []
      ).map((o) => {


        // ========================================================
// BUSCAR TODOS LOS CAMBIOS ASOCIADOS A LA VENTA
// ========================================================

const cambios =
  exchanges.filter(
    (e) =>
      String(
        e.order_id
      ) ===
      String(
        o.id
      )
  );


// ========================================================
// COBROS ADICIONALES DE TODOS LOS CAMBIOS
// ========================================================

const montoAdicionalCambio =
  cambios.reduce(
    (total, cambio) =>
      total +
      Number(
        cambio.additional_payment || 0
      ),
    0
  );


// ========================================================
// COBROS DE CAMBIOS YA PAGADOS
// ========================================================

const adicionalCambioPagado =
  cambios.reduce(
    (total, cambio) => {

      const estaPagado =
        String(
          cambio.payment_status || ""
        ).toLowerCase() ===
        "paid";

      return (
        total +
        (
          estaPagado
            ? Number(
                cambio.additional_payment || 0
              )
            : 0
        )
      );

    },
    0
  );


// ========================================================
// CAMBIOS PENDIENTES
// ========================================================

const cambiosPendientes =
  cambios.filter(
    (cambio) =>
      String(
        cambio.payment_status || ""
      ).toLowerCase() ===
      "pending" &&
      Number(
        cambio.additional_payment || 0
      ) > 0
  );


// ========================================================
// CAMBIO QUE SE MOSTRARÁ PARA REGISTRAR PAGO
// ========================================================
//
// Tomamos el primer cambio pendiente.
// Después de registrarlo como pagado,
// get-orders volverá a seleccionar
// automáticamente el siguiente pendiente.
//

const cambioPendiente =
  cambiosPendientes[0] ||
  null;


// ========================================================
// CAMBIO PRINCIPAL PARA COMPATIBILIDAD
// ========================================================

const cambio =
  cambioPendiente ||
  cambios[0] ||
  null;
        
        // ========================================================
        // TOTAL ORIGINAL
        // ========================================================

        const totalOriginal =
          Number.isFinite(
            Number(
              o.total
            )
          )
            ? Number(
                o.total
              )
            : 0;


        // ========================================================
        // TOTAL REALMENTE COBRADO
        //
        // IMPORTANTE:
        // NO modifica orders.total.
        //
        // Solamente calcula:
        //
        // total original
        // +
        // adicional pagado por cambio
        // ========================================================

const totalCobrado =
  totalOriginal +
  adicionalCambioPagado;


        // ========================================================
        // DEVOLVER PEDIDO NORMALIZADO
        // ========================================================

        return {

          ...o,


          // ======================================================
          // PRODUCTOS
          // ======================================================

          items:
            Array.isArray(
              o.items
            )
              ? o.items
              : [],


          // ======================================================
          // TOTAL ORIGINAL
          // ======================================================

          total:
            totalOriginal,


          // ======================================================
          // TOTAL COBRADO
          // ======================================================

          total_cobrado:
            totalCobrado,


          // ======================================================
          // COBRO ADICIONAL DEL CAMBIO
          // ======================================================

adicional_cambio:
  montoAdicionalCambio,


          // ======================================================
          // INFORMACIÓN DEL CAMBIO
          // ======================================================

          cambio_id:
            cambio?.id ||
            null,


estado_pago_cambio:
  cambiosPendientes.length > 0
    ? "pending"
    : cambios.length > 0
      ? "paid"
      : "not_required",

          medio_pago_cambio:
            cambio?.payment_method ||
            null,


          fecha_cambio:
            cambio?.created_at ||
            null,


          // ======================================================
          // ESTADO DE LA VENTA
          // ======================================================

          estado:
            typeof o.estado ===
            "string"

              ? o.estado.toLowerCase()

              : "pendiente",


          // ======================================================
          // DATOS CLIENTE
          // ======================================================

          nombre:
            o.nombre ||
            "",


          correo:
            o.correo ||
            "",


          rut:
            o.rut ||
            "",


          telefono:
            o.telefono ||
            "",


          direccion:
            o.direccion ||
            "",


          comuna:
            o.comuna ||
            "",


          region:
            o.region ||
            "",


          observacion:
            o.observacion ||
            "",


          // ======================================================
          // FECHA
          // ======================================================

          created_at:
            o.created_at ||
            null,

        };

      });


    // ============================================================
    // RESPUESTA
    // ============================================================

    return {

      statusCode: 200,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          safeData
        ),

    };


  } catch (err) {

    console.log(
      "FUNCTION ERROR:",
      err
    );


    return {

      statusCode: 500,

      body:
        JSON.stringify({

          error:
            err.message ||
            "Error interno",

        }),

    };

  }

};

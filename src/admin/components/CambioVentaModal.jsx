import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function CambioVentaModal({
  venta,
  onClose,
  onSuccess,
}) {
  const [variantes, setVariantes] = useState([]);

  const [productoDevuelto, setProductoDevuelto] =
    useState("");

  const [productoReemplazo, setProductoReemplazo] =
    useState("");

  const [devolver, setDevolver] =
    useState("");

  const [reemplazo, setReemplazo] =
    useState("");

  const [cantidadDevuelta, setCantidadDevuelta] =
    useState(1);

  const [cantidadReemplazo, setCantidadReemplazo] =
    useState(1);

  const [observacion, setObservacion] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [cargandoVariantes, setCargandoVariantes] =
    useState(true);


  // ============================================================
  // CARGAR VARIANTES
  // ============================================================

  useEffect(() => {
    cargarVariantes();
  }, []);


  const cargarVariantes = async () => {
    setCargandoVariantes(true);

    const { data, error } = await supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        size,
        stock,
        price,
        products (
          name
        )
      `)
      .order("product_id")
      .order("size");

    if (error) {
      console.error(
        "Error cargando variantes:",
        error
      );

      alert(
        "No fue posible cargar las variantes de productos."
      );

      setVariantes([]);
    } else {
      setVariantes(data || []);
    }

    setCargandoVariantes(false);
  };


  // ============================================================
  // VARIANTES QUE REALMENTE PERTENECEN A LA VENTA
  // ============================================================

  const variantesVenta = useMemo(() => {
    if (
      !venta?.items ||
      !Array.isArray(venta.items)
    ) {
      return [];
    }

    const mapa = new Map();

    venta.items.forEach((item) => {
      const varianteId =
        item.variant_id ??
        item.product_variant_id ??
        item.variantId;

      if (!varianteId) {
        return;
      }

      const variante =
        variantes.find(
          (v) =>
            String(v.id) ===
            String(varianteId)
        );

      if (!variante) {
        return;
      }

      const clave =
        String(variante.id);

      const cantidad =
        Number(item.qty || 1);

      if (mapa.has(clave)) {
        mapa.get(clave).cantidadVendida +=
          cantidad;
      } else {
        mapa.set(clave, {
          ...variante,
          cantidadVendida: cantidad,
        });
      }
    });

    return Array.from(
      mapa.values()
    );
  }, [venta, variantes]);


  // ============================================================
  // PRODUCTOS DE LA VENTA
  // ============================================================

  const productosVenta = useMemo(() => {
    const mapa = new Map();

    variantesVenta.forEach(
      (variante) => {
        const productId =
          variante.product_id;

        if (!productId) {
          return;
        }

        if (
          !mapa.has(
            String(productId)
          )
        ) {
          mapa.set(
            String(productId),
            {
              id: productId,
              name:
                variante.products?.name ||
                "Producto",
            }
          );
        }
      }
    );

    return Array.from(
      mapa.values()
    ).sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "es",
          {
            sensitivity: "base",
          }
        )
    );
  }, [variantesVenta]);


  // ============================================================
  // TODOS LOS PRODUCTOS DISPONIBLES
  // ============================================================

  const productosDisponibles =
    useMemo(() => {
      const mapa = new Map();

      variantes.forEach(
        (variante) => {
          const productId =
            variante.product_id;

          if (!productId) {
            return;
          }

          if (
            !mapa.has(
              String(productId)
            )
          ) {
            mapa.set(
              String(productId),
              {
                id: productId,
                name:
                  variante.products?.name ||
                  "Producto",
              }
            );
          }
        }
      );

      return Array.from(
        mapa.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            "es",
            {
              sensitivity: "base",
            }
          )
      );
    }, [variantes]);


  // ============================================================
  // TALLAS DEL PRODUCTO DEVUELTO
  // ============================================================

  const tallasDevueltas =
    useMemo(() => {
      if (!productoDevuelto) {
        return [];
      }

      return variantesVenta
        .filter(
          (v) =>
            String(v.product_id) ===
            String(productoDevuelto)
        )
        .sort(
          (a, b) => {

            const tallaA =
              parseInt(
                String(
                  a.size || ""
                ).match(
                  /\d+/
                )?.[0] ||
                  "999",
                10
              );

            const tallaB =
              parseInt(
                String(
                  b.size || ""
                ).match(
                  /\d+/
                )?.[0] ||
                  "999",
                10
              );

            return (
              tallaA - tallaB
            );
          }
        );
    }, [
      variantesVenta,
      productoDevuelto,
    ]);


  // ============================================================
  // TALLAS DEL PRODUCTO DE REEMPLAZO
  // ============================================================

  const tallasReemplazo =
    useMemo(() => {
      if (!productoReemplazo) {
        return [];
      }

      return variantes
        .filter(
          (v) =>
            String(v.product_id) ===
            String(productoReemplazo)
        )
        .sort(
          (a, b) => {

            const tallaA =
              parseInt(
                String(
                  a.size || ""
                ).match(
                  /\d+/
                )?.[0] ||
                  "999",
                10
              );

            const tallaB =
              parseInt(
                String(
                  b.size || ""
                ).match(
                  /\d+/
                )?.[0] ||
                  "999",
                10
              );

            return (
              tallaA - tallaB
            );
          }
        );
    }, [
      variantes,
      productoReemplazo,
    ]);


  // ============================================================
  // VARIANTE DEVUELTA
  // ============================================================

  const varianteDevuelta =
    useMemo(() => {
      return variantes.find(
        (v) =>
          String(v.id) ===
          String(devolver)
      );
    }, [
      variantes,
      devolver,
    ]);


  // ============================================================
  // VARIANTE DE REEMPLAZO
  // ============================================================

  const varianteReemplazo =
    useMemo(() => {
      return variantes.find(
        (v) =>
          String(v.id) ===
          String(reemplazo)
      );
    }, [
      variantes,
      reemplazo,
    ]);


  // ============================================================
  // CANTIDAD MÁXIMA QUE SE PUEDE DEVOLVER
  // ============================================================

  const cantidadMaximaDevuelta =
    useMemo(() => {
      const variante =
        variantesVenta.find(
          (v) =>
            String(v.id) ===
            String(devolver)
        );

      return (
        Number(
          variante?.cantidadVendida ||
            1
        )
      );
    }, [
      variantesVenta,
      devolver,
    ]);


  // ============================================================
  // DIFERENCIA DE PRECIO
  // ============================================================

  const diferencia =
    useMemo(() => {

      const precioDevuelto =
        Number(
          varianteDevuelta?.price ||
            0
        );

      const precioReemplazo =
        Number(
          varianteReemplazo?.price ||
            0
        );

      return (
        precioReemplazo *
          Number(
            cantidadReemplazo || 0
          ) -
        precioDevuelto *
          Number(
            cantidadDevuelta || 0
          )
      );

    }, [
      varianteDevuelta,
      varianteReemplazo,
      cantidadDevuelta,
      cantidadReemplazo,
    ]);


  // ============================================================
  // FORMATO PRECIO
  // ============================================================

  const formatoPrecio = (
    valor
  ) => {
    return Number(
      valor || 0
    ).toLocaleString(
      "es-CL"
    );
  };


  // ============================================================
  // NOMBRE VARIANTE
  // ============================================================

  const nombreVariante = (
    variante
  ) => {

    if (!variante) {
      return "Sin seleccionar";
    }

    const nombre =
      variante.products?.name ||
      "Producto";

    const talla =
      variante.size ||
      "Sin talla";

    return `${nombre} — ${talla}`;
  };


  // ============================================================
  // CAMBIO DE PRODUCTO DEVUELTO
  // ============================================================

  const cambiarProductoDevuelto =
    (valor) => {

      setProductoDevuelto(
        valor
      );

      setDevolver("");

      setCantidadDevuelta(
        1
      );
    };


  // ============================================================
  // CAMBIO DE TALLA DEVUELTA
  // ============================================================

  const cambiarTallaDevuelta =
    (valor) => {

      setDevolver(
        valor
      );

      const variante =
        variantesVenta.find(
          (v) =>
            String(v.id) ===
            String(valor)
        );

      const cantidad =
        Number(
          variante?.cantidadVendida ||
            1
        );

      setCantidadDevuelta(
        Math.min(
          1,
          cantidad
        )
      );
    };


  // ============================================================
  // CAMBIO DE PRODUCTO REEMPLAZO
  // ============================================================

  const cambiarProductoReemplazo =
    (valor) => {

      setProductoReemplazo(
        valor
      );

      setReemplazo("");
    };


  // ============================================================
  // CONFIRMAR CAMBIO
  // ============================================================

  const confirmarCambio =
    async () => {

      if (!venta?.id) {

        alert(
          "No se encontró la venta."
        );

        return;
      }


      if (!productoDevuelto) {

        alert(
          "Selecciona el producto que devuelve el cliente."
        );

        return;
      }


      if (!devolver) {

        alert(
          "Selecciona la talla o variante que devuelve el cliente."
        );

        return;
      }


      if (!productoReemplazo) {

        alert(
          "Selecciona el producto que recibirá el cliente."
        );

        return;
      }


      if (!reemplazo) {

        alert(
          "Selecciona la talla o variante de reemplazo."
        );

        return;
      }


      if (
        String(devolver) ===
        String(reemplazo)
      ) {

        alert(
          "La prenda devuelta y la prenda de reemplazo deben ser diferentes."
        );

        return;
      }


      if (
        Number(cantidadDevuelta) <=
          0 ||
        Number(cantidadReemplazo) <=
          0
      ) {

        alert(
          "Las cantidades deben ser mayores que cero."
        );

        return;
      }


      if (
        Number(cantidadDevuelta) >
        Number(
          cantidadMaximaDevuelta
        )
      ) {

        alert(
          `No puedes devolver más unidades de las compradas.\n\n` +
          `Cantidad comprada: ${cantidadMaximaDevuelta}`
        );

        return;
      }


      if (!varianteDevuelta) {

        alert(
          "No se pudo encontrar la variante devuelta."
        );

        return;
      }


      if (!varianteReemplazo) {

        alert(
          "No se pudo encontrar la variante de reemplazo."
        );

        return;
      }


      const stockDisponible =
        Number(
          varianteReemplazo.stock ||
            0
        );


      if (
        stockDisponible <
        Number(
          cantidadReemplazo
        )
      ) {

        alert(
          `Stock insuficiente.\n\n` +
          `Producto: ${nombreVariante(
            varianteReemplazo
          )}\n` +
          `Disponible: ${stockDisponible}\n` +
          `Solicitado: ${cantidadReemplazo}`
        );

        return;
      }


      let mensaje =
        "¿Confirmar cambio?\n\n";


      mensaje +=
        "VENTA #" +
        (
          venta.numero_venta ||
          venta.id
        ) +
        "\n\n";


      mensaje +=
        "DEVUELVE:\n";

      mensaje +=
        `${nombreVariante(
          varianteDevuelta
        )}\n`;

      mensaje +=
        `Cantidad: ${cantidadDevuelta}\n\n`;


      mensaje +=
        "RECIBE:\n";

      mensaje +=
        `${nombreVariante(
          varianteReemplazo
        )}\n`;

      mensaje +=
        `Cantidad: ${cantidadReemplazo}\n\n`;


      if (
        diferencia > 0
      ) {

        mensaje +=
          `Diferencia a pagar: $${formatoPrecio(
            diferencia
          )}\n`;

      } else if (
        diferencia < 0
      ) {

        mensaje +=
          `Saldo a favor: $${formatoPrecio(
            Math.abs(
              diferencia
            )
          )}\n`;

      } else {

        mensaje +=
          "Sin diferencia de precio\n";
      }


      const confirmar =
        window.confirm(
          mensaje
        );


      if (!confirmar) {
        return;
      }


      setCargando(true);


      try {

        const {
          data,
          error,
        } =
          await supabase.rpc(
            "registrar_cambio_venta",
            {
              p_order_id:
                Number(
                  venta.id
                ),

              p_return_variant_id:
                Number(
                  devolver
                ),

              p_return_qty:
                Number(
                  cantidadDevuelta
                ),

              p_replacement_variant_id:
                Number(
                  reemplazo
                ),

              p_replacement_qty:
                Number(
                  cantidadReemplazo
                ),

              p_observation:
                observacion.trim() ||
                null,

              p_created_by:
                "Panel administrativo",
            }
          );


        if (error) {

          console.error(
            "Error registrando cambio:",
            error
          );

          alert(
            `No se pudo registrar el cambio.\n\n${error.message}`
          );

          return;
        }


        console.log(
          "Cambio registrado:",
          data
        );


        alert(
          "✅ Cambio registrado correctamente.\n\n" +
          "La prenda devuelta fue reincorporada al stock y " +
          "la nueva prenda fue descontada."
        );


        if (
          typeof onSuccess ===
          "function"
        ) {

          onSuccess(
            data
          );
        }


        onClose();

      } catch (error) {

        console.error(
          "Error inesperado:",
          error
        );

        alert(
          "Ocurrió un error inesperado al registrar el cambio."
        );

      } finally {

        setCargando(
          false
        );
      }
    };


  // ============================================================
  // SI NO HAY VENTA
  // ============================================================

  if (!venta) {
    return null;
  }


  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          rounded-[28px]
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            bg-gradient-to-r
            from-pink-500
            via-fuchsia-500
            to-purple-600
            px-6
            py-6
            text-white
            md:px-8
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >

            <div>

              <div
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-pink-100
                "
              >
                Gestión de cambio
              </div>


              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  md:text-3xl
                "
              >
                ↔️ Cambio de producto
              </h2>


              <p
                className="
                  mt-2
                  text-sm
                  text-pink-100
                "
              >
                Venta #
                {
                  venta.numero_venta ||
                  venta.id
                }
              </p>

            </div>


            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white/20
                text-xl
                font-bold
                hover:bg-white/30
              "
            >
              ×
            </button>

          </div>

        </div>


        {/* CONTENIDO */}

        <div
          className="
            p-6
            md:p-8
          "
        >

          {/* CLIENTE */}

          <div
            className="
              mb-6
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >

            <div
              className="
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Cliente
            </div>


            <div
              className="
                mt-1
                font-bold
                text-slate-900
              "
            >
              {
                venta.nombre ||
                "Cliente"
              }
            </div>

          </div>


          {cargandoVariantes ? (

            <div
              className="
                py-12
                text-center
                text-slate-500
              "
            >
              Cargando productos y tallas...
            </div>

          ) : (

            <>

              {/* ==================================================
                  PRODUCTO QUE DEVUELVE
              ================================================== */}

              <div
                className="
                  mb-5
                  rounded-2xl
                  border
                  border-rose-200
                  bg-rose-50
                  p-5
                "
              >

                <div
                  className="
                    mb-4
                    text-sm
                    font-black
                    text-rose-700
                  "
                >
                  ↩️ PRODUCTO QUE DEVUELVE
                </div>


                {/* PRODUCTO */}

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Producto
                </label>


                <select
                  value={
                    productoDevuelto
                  }

                  onChange={(e) =>
                    cambiarProductoDevuelto(
                      e.target.value
                    )
                  }

                  disabled={cargando}

                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-slate-900
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                >

                  <option value="">
                    Seleccionar producto
                  </option>


                  {productosVenta.map(
                    (producto) => (

                      <option
                        key={producto.id}
                        value={producto.id}
                      >
                        {producto.name}
                      </option>

                    )
                  )}

                </select>


                {/* TALLA */}

                {productoDevuelto && (

                  <div
                    className="mt-4"
                  >

                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-600
                      "
                    >
                      Talla / variante
                    </label>


                    <select
                      value={devolver}

                      onChange={(e) =>
                        cambiarTallaDevuelta(
                          e.target.value
                        )
                      }

                      disabled={cargando}

                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-3
                        text-slate-900
                        outline-none
                        focus:ring-2
                        focus:ring-pink-400
                      "
                    >

                      <option value="">
                        Seleccionar talla
                      </option>


                      {tallasDevueltas.map(
                        (variante) => (

                          <option
                            key={
                              variante.id
                            }
                            value={
                              variante.id
                            }
                          >
                            {
                              variante.size ||
                              "Sin talla"
                            }

                            {" — $"}

                            {
                              formatoPrecio(
                                variante.price
                              )
                            }

                            {" — Comprado: "}

                            {
                              variante.cantidadVendida ||
                              1
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>

                )}


                {/* CANTIDAD */}

                <div
                  className="mt-4"
                >

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-600
                    "
                  >
                    Cantidad devuelta
                  </label>


                  <input
                    type="number"
                    min="1"
                    max={
                      cantidadMaximaDevuelta
                    }
                    step="1"
                    value={
                      cantidadDevuelta
                    }

                    onChange={(e) => {

                      const valor =
                        Number(
                          e.target.value
                        );

                      setCantidadDevuelta(
                        Math.min(
                          Math.max(
                            valor,
                            1
                          ),
                          cantidadMaximaDevuelta
                        )
                      );

                    }}

                    disabled={
                      cargando ||
                      !devolver
                    }

                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                      outline-none
                      focus:ring-2
                      focus:ring-pink-400
                    "
                  />


                  {devolver && (

                    <div
                      className="
                        mt-2
                        text-xs
                        font-bold
                        text-rose-600
                      "
                    >
                      Máximo permitido:
                      {" "}
                      {
                        cantidadMaximaDevuelta
                      }
                      {" "}
                      unidad(es)
                    </div>

                  )}

                </div>

              </div>


              {/* FLECHA */}

              <div
                className="
                  mb-5
                  flex
                  justify-center
                  text-3xl
                "
              >
                ↓
              </div>


              {/* ==================================================
                  PRODUCTO QUE RECIBE
              ================================================== */}

              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-5
                "
              >

                <div
                  className="
                    mb-4
                    text-sm
                    font-black
                    text-emerald-700
                  "
                >
                  📦 PRODUCTO QUE RECIBE
                </div>


                {/* PRODUCTO */}

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Producto
                </label>


                <select
                  value={
                    productoReemplazo
                  }

                  onChange={(e) =>
                    cambiarProductoReemplazo(
                      e.target.value
                    )
                  }

                  disabled={cargando}

                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-slate-900
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                >

                  <option value="">
                    Seleccionar producto
                  </option>


                  {productosDisponibles.map(
                    (producto) => (

                      <option
                        key={producto.id}
                        value={producto.id}
                      >
                        {producto.name}
                      </option>

                    )
                  )}

                </select>


                {/* TALLA */}

                {productoReemplazo && (

                  <div
                    className="mt-4"
                  >

                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-600
                      "
                    >
                      Talla / variante
                    </label>


                    <select
                      value={
                        reemplazo
                      }

                      onChange={(e) =>
                        setReemplazo(
                          e.target.value
                        )
                      }

                      disabled={cargando}

                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-3
                        text-slate-900
                        outline-none
                        focus:ring-2
                        focus:ring-pink-400
                      "
                    >

                      <option value="">
                        Seleccionar talla
                      </option>


                      {tallasReemplazo.map(
                        (variante) => (

                          <option
                            key={
                              variante.id
                            }
                            value={
                              variante.id
                            }
                          >

                            {
                              variante.size ||
                              "Sin talla"
                            }

                            {" — Stock: "}

                            {
                              variante.stock ||
                              0
                            }

                            {" — $"}

                            {
                              formatoPrecio(
                                variante.price
                              )
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>

                )}


                {/* CANTIDAD */}

                <div
                  className="mt-4"
                >

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-600
                    "
                  >
                    Cantidad nueva
                  </label>


                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      cantidadReemplazo
                    }

                    onChange={(e) =>
                      setCantidadReemplazo(
                        Math.max(
                          Number(
                            e.target.value
                          ),
                          1
                        )
                      )
                    }

                    disabled={
                      cargando ||
                      !reemplazo
                    }

                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                      outline-none
                      focus:ring-2
                      focus:ring-pink-400
                    "
                  />


                  {varianteReemplazo && (

                    <div
                      className="
                        mt-4
                        rounded-xl
                        bg-white
                        px-4
                        py-3
                        text-sm
                      "
                    >

                      <span
                        className="font-bold"
                      >
                        Stock disponible:
                      </span>

                      {" "}

                      {
                        varianteReemplazo.stock ||
                        0
                      }


                      {" | Después del cambio: "}


                      <span
                        className="font-bold"
                      >
                        {
                          Math.max(
                            0,
                            Number(
                              varianteReemplazo.stock ||
                              0
                            ) -
                            Number(
                              cantidadReemplazo ||
                              0
                            )
                          )
                        }
                      </span>

                    </div>

                  )}

                </div>

              </div>


              {/* ==================================================
                  DIFERENCIA
              ================================================== */}

              <div
                className="
                  mb-6
                  rounded-2xl
                  bg-slate-900
                  p-5
                  text-white
                "
              >

                <div
                  className="
                    text-sm
                    text-slate-300
                  "
                >
                  Diferencia de precio
                </div>


                <div
                  className="
                    mt-2
                    text-3xl
                    font-black
                  "
                >
                  $
                  {
                    formatoPrecio(
                      Math.abs(
                        diferencia
                      )
                    )
                  }
                </div>


                <div
                  className="
                    mt-2
                    text-sm
                    font-bold
                  "
                >

                  {
                    diferencia > 0
                      ? "Cliente debe pagar la diferencia"
                      : diferencia < 0
                      ? "Cliente queda con saldo a favor"
                      : "Sin diferencia de precio"
                  }

                </div>

              </div>


              {/* ==================================================
                  OBSERVACIÓN
              ================================================== */}

              <div
                className="mb-6"
              >

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Observación
                </label>


                <textarea
                  value={
                    observacion
                  }

                  onChange={(e) =>
                    setObservacion(
                      e.target.value
                    )
                  }

                  disabled={cargando}

                  rows={3}

                  placeholder="
                    Ej: Cliente solicita cambio de Talla 8 a Talla 9
                  "

                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-pink-400
                  "
                />

              </div>


              {/* ==================================================
                  BOTONES
              ================================================== */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                "
              >

                <button
                  type="button"
                  onClick={onClose}
                  disabled={cargando}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-300
                    py-3
                    font-bold
                    text-slate-700
                    hover:bg-slate-100
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>


                <button
                  type="button"
                  onClick={
                    confirmarCambio
                  }

                  disabled={
                    cargando ||
                    cargandoVariantes ||
                    !devolver ||
                    !reemplazo
                  }

                  className="
                    flex-1
                    rounded-xl
                    bg-gradient-to-r
                    from-pink-500
                    to-purple-600
                    py-3
                    font-black
                    text-white
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {
                    cargando
                      ? "Procesando cambio..."
                      : "↔️ Confirmar cambio"
                  }

                </button>

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

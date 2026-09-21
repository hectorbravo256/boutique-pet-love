import { fechaVenta } from "./formatoVenta";


export const imprimirComprobante = (venta) => {

    if (!venta) return;


    const escaparHTML = (valor) =>
        String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");


    const monedaPrint = (valor) =>
        `$${Number(valor || 0).toLocaleString("es-CL")}`;


    const fechaPrint = venta.created_at
        ? fechaVenta(venta.created_at)
        : "-";


    const canal =
        venta.tipo_venta === "rrss"
            ? "RRSS"
            : "Presencial";


    const medioPago = (() => {

        switch (venta.medio_pago) {

            case "efectivo":
                return "Efectivo";

            case "transferencia":
                return "Transferencia";

            case "pos_tuu":
                return "POS TUU";

            case "mercado_pago":
                return "Mercado Pago";

            default:
                return venta.medio_pago || "-";

        }

    })();


    const itemsVenta =
        Array.isArray(venta.items)
            ? venta.items
            : [];


    const productosHTML =
        itemsVenta.length > 0

            ? itemsVenta
                .map((item) => {

                    const itemCantidad =
                        Number(
                            item.quantity ??
                            item.cantidad ??
                            item.qty ??
                            0
                        );


                    const itemPrecio =
                        Number(
                            item.price ??
                            item.precio ??
                            0
                        );


                    const nombre =
                        item.name ??
                        item.product_name ??
                        item.nombre ??
                        item.producto ??
                        "Producto";


                    const talla =
                        item.size ??
                        item.talla ??
                        "-";


                    const subtotal =
                        itemCantidad *
                        itemPrecio;


                    return `
                        <tr>
                            <td>
                                <strong>
                                    ${escaparHTML(nombre)}
                                </strong>

                                <span class="detalle">
                                    Talla:
                                    ${escaparHTML(talla)}
                                </span>
                            </td>

                            <td class="center">
                                ${itemCantidad}
                            </td>

                            <td class="right">
                                ${monedaPrint(itemPrecio)}
                            </td>

                            <td class="right">
                                ${monedaPrint(subtotal)}
                            </td>
                        </tr>
                    `;

                })
                .join("")

            : `
                <tr>
                    <td
                        colspan="4"
                        class="empty"
                    >
                        No hay productos registrados.
                    </td>
                </tr>
            `;


    const ventana = window.open(
        "",
        "_blank",
        "width=850,height=900"
    );


    if (!ventana) {

        alert(
            "El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio."
        );

        return;

    }


    ventana.document.write(`

        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Comprobante Venta #${escaparHTML(
                    venta.numero_venta
                )}
            </title>


            <style>

                @page {
                    size: A4;
                    margin: 14mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    background: #fff;
                    color: #172033;
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .comprobante {
                    width: 100%;
                    max-width: 760px;
                    margin: 0 auto;
                }

                .encabezado {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 30px;
                    padding-bottom: 18px;
                    border-bottom: 2px solid #172033;
                }

                .marca {
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: .04em;
                }

                .submarca {
                    margin-top: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: .2em;
                    color: #64748b;
                }

                .titulo {
                    text-align: right;
                }

                .titulo-principal {
                    font-size: 20px;
                    font-weight: 900;
                }

                .numero {
                    margin-top: 5px;
                    font-size: 14px;
                    font-weight: 800;
                }

                .bloque-datos {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                    margin-top: 18px;
                }

                .dato {
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                }

                .dato-label {
                    display: block;
                    margin-bottom: 4px;
                    color: #64748b;
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: .08em;
                }

                .dato-valor {
                    font-size: 12px;
                    font-weight: 700;
                    word-break: break-word;
                }

                .seccion {
                    margin-top: 24px;
                }

                .seccion-titulo {
                    margin-bottom: 8px;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: .08em;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                th {
                    padding: 9px 7px;
                    border-bottom: 2px solid #cbd5e1;
                    color: #64748b;
                    font-size: 9px;
                    font-weight: 900;
                    text-align: left;
                    text-transform: uppercase;
                }

                td {
                    padding: 11px 7px;
                    border-bottom: 1px solid #e2e8f0;
                    vertical-align: top;
                }

                th:nth-child(2),
                td:nth-child(2) {
                    width: 70px;
                    text-align: center;
                }

                th:nth-child(3),
                th:nth-child(4),
                td:nth-child(3),
                td:nth-child(4) {
                    width: 115px;
                    text-align: right;
                }

                .center {
                    text-align: center;
                }

                .right {
                    text-align: right;
                    white-space: nowrap;
                }

                .detalle {
                    display: block;
                    margin-top: 4px;
                    color: #64748b;
                    font-size: 10px;
                }

                .empty {
                    text-align: center;
                    color: #64748b;
                }

                .resumen {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 18px;
                }

                .total-box {
                    min-width: 270px;
                    padding-top: 12px;
                    border-top: 2px solid #172033;
                }

                .total-linea {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    font-size: 20px;
                    font-weight: 900;
                }

                .extra {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                    margin-top: 20px;
                }

                .observaciones {
                    margin-top: 20px;
                    padding: 12px;
                    border-radius: 10px;
                    background: #f8fafc;
                }

                .observaciones-texto {
                    margin-top: 5px;
                    font-size: 11px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                }

                .pie {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px dashed #94a3b8;
                    color: #64748b;
                    font-size: 10px;
                    line-height: 1.6;
                    text-align: center;
                }

                @media print {

                    body {
                        background: #fff;
                    }

                    .comprobante {
                        max-width: none;
                    }

                }

            </style>

        </head>


        <body>

            <main class="comprobante">

                <header class="encabezado">

                    <div>

                        <div class="marca">
                            🐾 BOUTIQUE PET LOVE
                        </div>

                        <div class="submarca">
                            TIENDA PARA MASCOTAS
                        </div>

                    </div>


                    <div class="titulo">

                        <div class="titulo-principal">
                            COMPROBANTE DE VENTA
                        </div>

                        <div class="numero">
                            Venta #${escaparHTML(
                                venta.numero_venta
                            )}
                        </div>

                    </div>

                </header>


                <section class="bloque-datos">

                    <div class="dato">

                        <span class="dato-label">
                            Cliente
                        </span>

                        <span class="dato-valor">
                            ${escaparHTML(
                                venta.nombre ||
                                "Sin nombre"
                            )}
                        </span>

                    </div>


                    <div class="dato">

                        <span class="dato-label">
                            Fecha
                        </span>

                        <span class="dato-valor">
                            ${escaparHTML(
                                fechaPrint
                            )}
                        </span>

                    </div>


                    <div class="dato">

                        <span class="dato-label">
                            Canal de venta
                        </span>

                        <span class="dato-valor">
                            ${escaparHTML(
                                canal
                            )}
                        </span>

                    </div>


                    <div class="dato">

                        <span class="dato-label">
                            Medio de pago
                        </span>

                        <span class="dato-valor">
                            ${escaparHTML(
                                medioPago
                            )}
                        </span>

                    </div>


                    ${
                        venta.rut
                            ? `
                                <div class="dato">

                                    <span class="dato-label">
                                        RUT
                                    </span>

                                    <span class="dato-valor">
                                        ${escaparHTML(
                                            venta.rut
                                        )}
                                    </span>

                                </div>
                            `
                            : ""
                    }


                    ${
                        venta.correo
                            ? `
                                <div class="dato">

                                    <span class="dato-label">
                                        Correo
                                    </span>

                                    <span class="dato-valor">
                                        ${escaparHTML(
                                            venta.correo
                                        )}
                                    </span>

                                </div>
                            `
                            : ""
                    }


                    ${
                        venta.telefono
                            ? `
                                <div class="dato">

                                    <span class="dato-label">
                                        Teléfono
                                    </span>

                                    <span class="dato-valor">
                                        ${escaparHTML(
                                            venta.telefono
                                        )}
                                    </span>

                                </div>
                            `
                            : ""
                    }

                </section>


                <section class="seccion">

                    <div class="seccion-titulo">
                        Productos vendidos
                    </div>


                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Producto
                                </th>

                                <th>
                                    Cant.
                                </th>

                                <th>
                                    Precio
                                </th>

                                <th>
                                    Total
                                </th>

                            </tr>

                        </thead>


                        <tbody>
                            ${productosHTML}
                        </tbody>

                    </table>

                </section>


                <section class="resumen">

                    <div class="total-box">

                        <div class="total-linea">

                            <span>
                                TOTAL
                            </span>

                            <span>
                                ${monedaPrint(
                                    venta.total
                                )}
                            </span>

                        </div>

                    </div>

                </section>


                <section class="extra">

                    <div class="dato">

                        <span class="dato-label">
                            Vendedor
                        </span>

                        <span class="dato-valor">
                            ${escaparHTML(
                                venta.vendedor ||
                                "-"
                            )}
                        </span>

                    </div>


                    <div class="dato">

                        <span class="dato-label">
                            Estado de pago
                        </span>

                        <span class="dato-valor">
                            ${escaparHTML(
                                venta.estado_pago ||
                                "-"
                            )}
                        </span>

                    </div>

                </section>


                ${
                    venta.observacion
                        ? `
                            <section class="observaciones">

                                <div class="dato-label">
                                    Observaciones
                                </div>

                                <div class="observaciones-texto">
                                    ${escaparHTML(
                                        venta.observacion
                                    )}
                                </div>

                            </section>
                        `
                        : ""
                }


                <footer class="pie">

                    <strong>
                        Boutique Pet Love
                    </strong>

                    <br>

                    Gracias por tu compra 🐾

                    <br>

                    boutique-petlove.cl

                </footer>

            </main>


            <script>

                window.onload = function () {

                    window.focus();

                    setTimeout(
                        function () {
                            window.print();
                        },
                        250
                    );

                };


                window.onafterprint = function () {

                    setTimeout(
                        function () {
                            window.close();
                        },
                        150
                    );

                };

            </script>

        </body>

        </html>

    `);


    ventana.document.close();

};

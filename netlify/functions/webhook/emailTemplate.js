const {
  money,
  escapeHtml,
} = require("../utils/formato");

const crearEmailHTML = ({
  numeroVenta,
  payment,
  formData,
  items,
  finalTotal,
}) => {

  const productosHTML =
    items
      .map((item) => {

        const price =
          Number(item.price || 0);

        const qty =
          Number(item.qty || 1);

        return `
<tr>
  <td style="
    padding:12px 8px;
    border-bottom:1px solid #eeeeee;
  ">
    <strong>
      ${escapeHtml(
        item.name || "Producto"
      )}
    </strong>
    <br>

    <span style="
      color:#777777;
      font-size:13px;
    ">
      Talla:
      ${escapeHtml(
        item.size || "-"
      )}
    </span>
  </td>

  <td style="
    padding:12px 8px;
    text-align:center;
    border-bottom:1px solid #eeeeee;
  ">
    ${qty}
  </td>

  <td style="
    padding:12px 8px;
    text-align:right;
    border-bottom:1px solid #eeeeee;
  ">
    $${money(price)}
  </td>

  <td style="
    padding:12px 8px;
    text-align:right;
    border-bottom:1px solid #eeeeee;
  ">
    $${money(price * qty)}
  </td>
</tr>
`;
      })
      .join("");

  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.qty || 1),
      0
    );

  const shipping =
    Math.max(
      0,
      Number(finalTotal) -
        subtotal
    );

  const customerName =
    escapeHtml(
      formData.nombre ||
      "Cliente"
    );

  return `
<!DOCTYPE html>

<html lang="es">

<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1.0">
</head>

<body style="
margin:0;
padding:0;
background:#f5f5f5;
font-family:Arial,Helvetica,sans-serif;
color:#333333;
">

<div style="
max-width:680px;
margin:30px auto;
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 3px 15px rgba(0,0,0,.08);
">

  <!-- ENCABEZADO -->

  <div style="
  padding:30px;
  text-align:center;
  border-bottom:1px solid #eeeeee;
  ">

    <div style="
    font-size:27px;
    font-weight:bold;
    ">
      🐾 Boutique Pet Love
    </div>

    <div style="
    margin-top:6px;
    color:#888888;
    font-size:14px;
    ">
      Moda y accesorios para mascotas
    </div>

  </div>


  <!-- CONTENIDO -->

  <div style="
  padding:30px;
  ">

    <h1 style="
    margin:0 0 18px;
    font-size:23px;
    ">
      ¡Compra confirmada!
    </h1>

    <p style="
    font-size:16px;
    line-height:1.6;
    ">
      Hola
      <strong>
        ${customerName}
      </strong>,
    </p>

    <p style="
    font-size:15px;
    line-height:1.6;
    color:#555555;
    ">
      Hemos recibido y confirmado
      correctamente tu pago.
      Muchas gracias por comprar
      en Boutique Pet Love.
    </p>


    <!-- RESUMEN -->

    <div style="
    margin:25px 0;
    padding:18px;
    background:#fafafa;
    border-radius:8px;
    border:1px solid #eeeeee;
    ">

      <div style="
      font-size:13px;
      color:#777777;
      ">
        Número de orden
      </div>

      <div style="
      margin-top:5px;
      font-size:20px;
      font-weight:bold;
      ">
        ORD-${escapeHtml(
          numeroVenta
        )}
      </div>

      <div style="
      margin-top:14px;
      font-size:13px;
      color:#777777;
      ">
        Estado
      </div>

      <div style="
      margin-top:4px;
      font-weight:bold;
      ">
        Pago aprobado
      </div>

      <div style="
      margin-top:14px;
      font-size:13px;
      color:#777777;
      ">
        Total pagado
      </div>

      <div style="
      margin-top:4px;
      font-size:20px;
      font-weight:bold;
      ">
        $${money(finalTotal)}
      </div>

    </div>


    <!-- PRODUCTOS -->

    <h2 style="
    font-size:18px;
    ">
      Detalle de la compra
    </h2>

    <table width="100%"
           cellpadding="0"
           cellspacing="0"
           style="
           border-collapse:collapse;
           font-size:14px;
           ">

      <thead>

        <tr style="
        background:#f7f7f7;
        ">

          <th style="
          padding:10px 8px;
          text-align:left;
          ">
            Producto
          </th>

          <th style="
          padding:10px 8px;
          text-align:center;
          ">
            Cant.
          </th>

          <th style="
          padding:10px 8px;
          text-align:right;
          ">
            Precio
          </th>

          <th style="
          padding:10px 8px;
          text-align:right;
          ">
            Total
          </th>

        </tr>

      </thead>

      <tbody>
        ${productosHTML}
      </tbody>

    </table>


    <!-- TOTALES -->

    <div style="
    margin-top:20px;
    border-top:1px solid #dddddd;
    padding-top:15px;
    ">

      <table width="100%">

        <tr>
          <td>
            Subtotal productos
          </td>

          <td style="text-align:right">
            $${money(subtotal)}
          </td>
        </tr>

        <tr>
          <td style="padding-top:6px">
            Envío
          </td>

          <td style="
          padding-top:6px;
          text-align:right;
          ">
            $${money(shipping)}
          </td>
        </tr>

        <tr>
          <td style="
          padding-top:12px;
          font-size:19px;
          font-weight:bold;
          ">
            Total pagado
          </td>

          <td style="
          padding-top:12px;
          text-align:right;
          font-size:19px;
          font-weight:bold;
          ">
            $${money(finalTotal)}
          </td>
        </tr>

      </table>

    </div>


    <!-- DESPACHO -->

    <h2 style="
    margin-top:30px;
    font-size:18px;
    ">
      Datos de despacho
    </h2>

    <div style="
    padding:15px;
    background:#fafafa;
    border-radius:8px;
    font-size:14px;
    line-height:1.7;
    ">

      <strong>
        ${escapeHtml(
          formData.nombre || ""
        )}
      </strong>

      <br>

      ${escapeHtml(
        formData.direccion || ""
      )}

      <br>

      ${escapeHtml(
        formData.comuna || ""
      )}

      <br>

      ${escapeHtml(
        formData.region || ""
      )}

      ${
        formData.telefono
          ? `<br>Teléfono: ${escapeHtml(
              formData.telefono
            )}`
          : ""
      }

    </div>


    <p style="
    margin-top:25px;
    font-size:14px;
    line-height:1.6;
    color:#666666;
    ">
      Adjuntamos a este correo el
      comprobante de compra en formato
      PDF con el detalle de la venta y
      la información registrada para
      el despacho.
    </p>


    <p style="
    margin-top:25px;
    font-size:14px;
    color:#555555;
    ">
      Gracias por preferir
      <strong>Boutique Pet Love</strong>.
    </p>

  </div>


  <!-- PIE -->

  <div style="
  padding:20px 30px;
  background:#fafafa;
  text-align:center;
  color:#888888;
  font-size:12px;
  ">

    Boutique Pet Love<br>
    ventas@boutiquepetlove.cl

  </div>

</div>

</body>
</html>
`;
};

module.exports = {
  crearEmailHTML,
};

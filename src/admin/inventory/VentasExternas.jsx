import {
    useEffect,
    useMemo,
    useState
} from "react";

import { supabase } from "../../supabaseClient";
import AdminCard from "../components/AdminCard";
import {
    formatearFechaHoraChile,
    formatearFechaChile
} from "../utils/fechaChile";

export default function VentasExternas() {

    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [actualizando, setActualizando] = useState(false);

    const [tipoVenta, setTipoVenta] =
        useState("presencial");

    const [medioPago, setMedioPago] =
        useState("efectivo");

const [cliente, setCliente] = useState({
    nombre: "",
    rut: "",
    correo: "",
    telefono: "",
    observacion: ""
});

const [despacho, setDespacho] = useState({
    direccion: "",
    comuna: "",
    region: "",
    empresa_envio: ""
});

    const [productoSeleccionado, setProductoSeleccionado] =
        useState("");

    const [varianteSeleccionada, setVarianteSeleccionada] =
        useState("");

    const [cantidad, setCantidad] =
        useState(1);

    const [items, setItems] =
        useState([]);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");

    const [busqueda, setBusqueda] =
        useState("");

    const [filtroCanal, setFiltroCanal] =
        useState("todos");

    const [filtroPago, setFiltroPago] =
        useState("todos");

    const [ventaSeleccionada, setVentaSeleccionada] =
        useState(null);


    /* =====================================================
       CARGAR INFORMACIÓN
    ===================================================== */

    useEffect(() => {

        cargarProductos();
        cargarVentas();

    }, []);


    /* =====================================================
       CARGAR PRODUCTOS
    ===================================================== */

    const cargarProductos = async () => {

        const { data, error } =
            await supabase
                .from("products")
                .select(`
                    id,
                    name,
                    active,
                    product_variants (
                        id,
                        size,
                        price,
                        stock
                    )
                `)
                .eq("active", true)
                .order("name");

        if (error) {

            console.error(error);

            setError(
                "No fue posible cargar los productos."
            );

            return;

        }

        setProductos(data || []);
        setLoading(false);

    };


    /* =====================================================
       CARGAR HISTORIAL DE VENTAS EXTERNAS
    ===================================================== */

    const cargarVentas = async () => {

        const { data, error } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    numero_venta,
                    created_at,
                    nombre,
                    rut,
                    correo,
                    telefono,
                    tipo_venta,
                    medio_pago,
                    estado_pago,
                    estado,
                    total,
                    vendedor,
                    observacion,
                    items
                `)
.in(
    "tipo_venta",
    [
        "presencial",
        "rrss"
    ]
)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(error);

            setError(
                "No fue posible cargar el historial de ventas."
            );

            return;

        }

        setVentas(data || []);

    };


    /* =====================================================
       ACTUALIZAR HISTORIAL
    ===================================================== */

    const actualizarHistorial = async () => {

        setActualizando(true);
        setError("");

        await cargarVentas();

        setActualizando(false);

    };


    /* =====================================================
       PRODUCTO SELECCIONADO
    ===================================================== */

    const productoActual =
        productos.find(
            p =>
                String(p.id) ===
                String(productoSeleccionado)
        );


    const variantesDisponibles =
        productoActual?.product_variants || [];


    /* =====================================================
       VARIANTE ACTUAL
    ===================================================== */

    const varianteActual =
        variantesDisponibles.find(
            v =>
                String(v.id) ===
                String(varianteSeleccionada)
        );


/* =====================================================
   DESPACHO
===================================================== */

const regionesPaket = [
    "Región Metropolitana de Santiago",
    "Valparaíso",
    "Libertador General Bernardo O'Higgins"
];

const esVentaRRSS = tipoVenta === "rrss";

const esRegionPaket =
    esVentaRRSS &&
    regionesPaket.includes(despacho.region);

const empresaEnvio =
    !esVentaRRSS
        ? ""
        : esRegionPaket
            ? "paket"
            : despacho.empresa_envio;

const envioPorPagar =
    esVentaRRSS && !esRegionPaket;

const costoEnvio =
    esRegionPaket ? 3500 : 0;


/* =====================================================
   SUBTOTAL PRODUCTOS
===================================================== */

const subtotalProductos =
    useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum +
                    (
                        Number(item.price) *
                        Number(item.quantity)
                    ),
                0
            ),
        [items]
    );


/* =====================================================
   TOTAL
===================================================== */

const total =
    subtotalProductos + costoEnvio;



    /* =====================================================
       AGREGAR PRODUCTO
    ===================================================== */

    const agregarProducto = () => {

        setError("");

        if (!productoActual) {

            setError(
                "Selecciona un producto."
            );

            return;

        }

        if (!varianteActual) {

            setError(
                "Selecciona una talla."
            );

            return;

        }

        const qty =
            Number(cantidad);


        if (
            !Number.isInteger(qty) ||
            qty <= 0
        ) {

            setError(
                "La cantidad debe ser mayor que cero."
            );

            return;

        }


        /* Stock considerando lo que ya está
           agregado al carrito */

        const cantidadEnCarrito =
            items
                .filter(
                    item =>
                        Number(item.variant_id) ===
                        Number(varianteActual.id)
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(item.quantity),
                    0
                );


        if (
            cantidadEnCarrito + qty >
            Number(varianteActual.stock || 0)
        ) {

            setError(
                `Stock insuficiente. Disponible: ${varianteActual.stock}.`
            );

            return;

        }


        const existente =
            items.find(
                item =>
                    Number(item.variant_id) ===
                    Number(varianteActual.id)
            );


        if (existente) {

            setItems(
                items.map(item =>
                    Number(item.variant_id) ===
                    Number(varianteActual.id)
                        ? {
                            ...item,
                            quantity:
                                Number(item.quantity) +
                                qty
                        }
                        : item
                )
            );

        } else {

            setItems([
                ...items,
                {
                    variant_id:
                        varianteActual.id,

                    product_id:
                        productoActual.id,

                    name:
                        productoActual.name,

                    size:
                        varianteActual.size,

                    price:
                        Number(varianteActual.price),

                    quantity:
                        qty
                }
            ]);

        }


        setProductoSeleccionado("");
        setVarianteSeleccionada("");
        setCantidad(1);

    };


    /* =====================================================
       ELIMINAR PRODUCTO
    ===================================================== */

    const eliminarItem = (variantId) => {

        setItems(
            items.filter(
                item =>
                    Number(item.variant_id) !==
                    Number(variantId)
            )
        );

    };


    /* =====================================================
       REGISTRAR VENTA
    ===================================================== */

    const registrarVenta = async () => {

        setError("");
        setMensaje("");

        if (items.length === 0) {

            setError(
                "Agrega al menos un producto."
            );

            return;

        }


        setGuardando(true);


        try {

const payloadItems =
    items.map(item => ({
        variant_id:
            Number(item.variant_id),

        qty:
            Number(item.quantity)
    }));


            const {
                data,
                error
            } =
                await supabase.rpc(
                    "registrar_venta_externa",
                    {
                        p_tipo_venta:
                            tipoVenta,

                        p_nombre:
                            cliente.nombre,

                        p_rut:
                            cliente.rut,

                        p_correo:
                            cliente.correo,

                        p_telefono:
                            cliente.telefono,

                        p_observacion:
                            cliente.observacion,

                        p_items:
                            payloadItems,

                        p_medio_pago:
                            medioPago,

                        p_vendedor:
    "Administrador",

p_direccion:
    esVentaRRSS
        ? despacho.direccion
        : null,

p_comuna:
    esVentaRRSS
        ? despacho.comuna
        : null,

p_region:
    esVentaRRSS
        ? despacho.region
        : null,

p_empresa_envio:
    esVentaRRSS
        ? empresaEnvio
        : null,

p_costo_envio:
    esVentaRRSS
        ? costoEnvio
        : 0,

p_envio_por_pagar:
    esVentaRRSS
        ? envioPorPagar
        : false
                    }
                );


            if (error) {

                console.error(error);

                throw error;

            }


            const resultado =
                data?.[0];


            setMensaje(
                `Venta #${resultado.numero_venta} registrada correctamente.`
            );


            /* Limpiar formulario */

            setCliente({
                nombre: "",
                rut: "",
                correo: "",
                telefono: "",
                observacion: ""
            });
            setDespacho({
    direccion: "",
    comuna: "",
    region: "",
    empresa_envio: ""
});

            setItems([]);

            setProductoSeleccionado("");
            setVarianteSeleccionada("");
            setCantidad(1);


            /* Actualizar stock e historial */

            await cargarProductos();
            await cargarVentas();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No fue posible registrar la venta."
            );

        } finally {

            setGuardando(false);

        }

    };

    /* =====================================================
       IMPRIMIR COMPROBANTE
    ===================================================== */

    const imprimirComprobante = (venta) => {

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
                case "efectivo": return "Efectivo";
                case "transferencia": return "Transferencia";
                case "pos_tuu": return "POS TUU";
                case "mercado_pago": return "Mercado Pago";
                default: return venta.medio_pago || "-";
            }
        })();

        const itemsVenta = Array.isArray(venta.items) ? venta.items : [];

        const productosHTML = itemsVenta.length > 0
            ? itemsVenta.map((item) => {
                const itemCantidad = Number(
                    item.quantity ?? item.cantidad ?? item.qty ?? 0
                );
                const itemPrecio = Number(
                    item.price ?? item.precio ?? 0
                );
                const nombre =
                    item.name ??
                    item.product_name ??
                    item.nombre ??
                    item.producto ??
                    "Producto";
                const talla = item.size ?? item.talla ?? "-";
                const subtotal = itemCantidad * itemPrecio;

                return `
                    <tr>
                        <td>
                            <strong>${escaparHTML(nombre)}</strong>
                            <span class="detalle">Talla: ${escaparHTML(talla)}</span>
                        </td>
                        <td class="center">${itemCantidad}</td>
                        <td class="right">${monedaPrint(itemPrecio)}</td>
                        <td class="right">${monedaPrint(subtotal)}</td>
                    </tr>
                `;
            }).join("")
            : `
                <tr>
                    <td colspan="4" class="empty">No hay productos registrados.</td>
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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Comprobante Venta #${escaparHTML(venta.numero_venta)}</title>
                <style>
                    @page { size: A4; margin: 14mm; }
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        background: #fff;
                        color: #172033;
                        font-family: Arial, Helvetica, sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .comprobante { width: 100%; max-width: 760px; margin: 0 auto; }
                    .encabezado {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 30px;
                        padding-bottom: 18px;
                        border-bottom: 2px solid #172033;
                    }
                    .marca { font-size: 24px; font-weight: 900; letter-spacing: .04em; }
                    .submarca { margin-top: 4px; font-size: 10px; font-weight: 700; letter-spacing: .2em; color: #64748b; }
                    .titulo { text-align: right; }
                    .titulo-principal { font-size: 20px; font-weight: 900; }
                    .numero { margin-top: 5px; font-size: 14px; font-weight: 800; }
                    .bloque-datos {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 10px;
                        margin-top: 18px;
                    }
                    .dato { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
                    .dato-label { display: block; margin-bottom: 4px; color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
                    .dato-valor { font-size: 12px; font-weight: 700; word-break: break-word; }
                    .seccion { margin-top: 24px; }
                    .seccion-titulo { margin-bottom: 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th { padding: 9px 7px; border-bottom: 2px solid #cbd5e1; color: #64748b; font-size: 9px; font-weight: 900; text-align: left; text-transform: uppercase; }
                    td { padding: 11px 7px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
                    th:nth-child(2), td:nth-child(2) { width: 70px; text-align: center; }
                    th:nth-child(3), th:nth-child(4), td:nth-child(3), td:nth-child(4) { width: 115px; text-align: right; }
                    .center { text-align: center; }
                    .right { text-align: right; white-space: nowrap; }
                    .detalle { display: block; margin-top: 4px; color: #64748b; font-size: 10px; }
                    .empty { text-align: center; color: #64748b; }
                    .resumen { display: flex; justify-content: flex-end; margin-top: 18px; }
                    .total-box { min-width: 270px; padding-top: 12px; border-top: 2px solid #172033; }
                    .total-linea { display: flex; justify-content: space-between; align-items: center; gap: 20px; font-size: 20px; font-weight: 900; }
                    .extra { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 20px; }
                    .observaciones { margin-top: 20px; padding: 12px; border-radius: 10px; background: #f8fafc; }
                    .observaciones-texto { margin-top: 5px; font-size: 11px; line-height: 1.5; white-space: pre-wrap; }
                    .pie { margin-top: 30px; padding-top: 15px; border-top: 1px dashed #94a3b8; color: #64748b; font-size: 10px; line-height: 1.6; text-align: center; }
                    @media print { body { background: #fff; } .comprobante { max-width: none; } }
                </style>
            </head>
            <body>
                <main class="comprobante">
                    <header class="encabezado">
                        <div>
                            <div class="marca">🐾 BOUTIQUE PET LOVE</div>
                            <div class="submarca">TIENDA PARA MASCOTAS</div>
                        </div>
                        <div class="titulo">
                            <div class="titulo-principal">COMPROBANTE DE VENTA</div>
                            <div class="numero">Venta #${escaparHTML(venta.numero_venta)}</div>
                        </div>
                    </header>

                    <section class="bloque-datos">
                        <div class="dato"><span class="dato-label">Cliente</span><span class="dato-valor">${escaparHTML(venta.nombre || "Sin nombre")}</span></div>
                        <div class="dato"><span class="dato-label">Fecha</span><span class="dato-valor">${escaparHTML(fechaPrint)}</span></div>
                        <div class="dato"><span class="dato-label">Canal de venta</span><span class="dato-valor">${escaparHTML(canal)}</span></div>
                        <div class="dato"><span class="dato-label">Medio de pago</span><span class="dato-valor">${escaparHTML(medioPago)}</span></div>
                        ${venta.rut ? `<div class="dato"><span class="dato-label">RUT</span><span class="dato-valor">${escaparHTML(venta.rut)}</span></div>` : ""}
                        ${venta.correo ? `<div class="dato"><span class="dato-label">Correo</span><span class="dato-valor">${escaparHTML(venta.correo)}</span></div>` : ""}
                        ${venta.telefono ? `<div class="dato"><span class="dato-label">Teléfono</span><span class="dato-valor">${escaparHTML(venta.telefono)}</span></div>` : ""}
                    </section>

                    <section class="seccion">
                        <div class="seccion-titulo">Productos vendidos</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cant.</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${productosHTML}</tbody>
                        </table>
                    </section>

                    <section class="resumen">
                        <div class="total-box">
                            <div class="total-linea">
                                <span>TOTAL</span>
                                <span>${monedaPrint(venta.total)}</span>
                            </div>
                        </div>
                    </section>

                    <section class="extra">
                        <div class="dato"><span class="dato-label">Vendedor</span><span class="dato-valor">${escaparHTML(venta.vendedor || "-")}</span></div>
                        <div class="dato"><span class="dato-label">Estado de pago</span><span class="dato-valor">${escaparHTML(venta.estado_pago || "-")}</span></div>
                    </section>

                    ${venta.observacion ? `
                        <section class="observaciones">
                            <div class="dato-label">Observaciones</div>
                            <div class="observaciones-texto">${escaparHTML(venta.observacion)}</div>
                        </section>
                    ` : ""}

                    <footer class="pie">
                        <strong>Boutique Pet Love</strong><br>
                        Gracias por tu compra 🐾<br>
                        boutique-petlove.cl
                    </footer>
                </main>

                <script>
                    window.onload = function () {
                        window.focus();
                        setTimeout(function () { window.print(); }, 250);
                    };
                    window.onafterprint = function () {
                        setTimeout(function () { window.close(); }, 150);
                    };
                </script>
            </body>
            </html>
        `);

        ventana.document.close();

    };

    /* =====================================================
       FORMATO MONEDA
    ===================================================== */

    const moneda = (valor) =>
        `$${Number(valor || 0).toLocaleString("es-CL")}`;


   /* =====================================================
   FORMATO FECHA
===================================================== */

/*
 * orders.created_at se almacena sin zona horaria,
 * pero representa un timestamp UTC.
 *
 * Se agrega explícitamente "Z" para que JavaScript
 * lo interprete como UTC antes de convertirlo a
 * America/Santiago mediante formatearFechaHoraChile().
 */
const normalizarFechaOrderUTC = (fecha) => {

    if (!fecha) {
        return null;
    }

    const fechaTexto = String(fecha);

    /*
     * Si ya contiene información de zona horaria
     * (+00:00, -03:00, Z, etc.), no modificar.
     */
    if (
        fechaTexto.endsWith("Z") ||
        /[+-]\d{2}:\d{2}$/.test(fechaTexto)
    ) {
        return fechaTexto;
    }

    return `${fechaTexto}Z`;
};


const fechaVenta = (fecha) => {

    const fechaUTC =
        normalizarFechaOrderUTC(fecha);

    return formatearFechaHoraChile(fechaUTC);
};


    /* =====================================================
       ETIQUETA CANAL
    ===================================================== */

    const etiquetaCanal = (tipo) => {

        if (tipo === "rrss") {
    return "📱 RRSS";
}

        return "🏪 Presencial";

    };


    /* =====================================================
       ETIQUETA MEDIO DE PAGO
    ===================================================== */

    const etiquetaPago = (medio) => {

        switch (medio) {

            case "efectivo":
                return "💵 Efectivo";

            case "transferencia":
                return "🏦 Transferencia";

            case "debito":
                return "💳 POS TUU";

            case "mercado_pago":
                return "🟢 Mercado Pago";

            default:
                return medio || "-";

        }

    };


    /* =====================================================
       FILTRAR HISTORIAL
    ===================================================== */

    const ventasFiltradas =
        useMemo(
            () => {

                const texto =
                    busqueda
                        .trim()
                        .toLowerCase();

                return ventas.filter(
                    venta => {

                        const coincideBusqueda =
                            !texto ||
                            String(
                                venta.numero_venta || ""
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                venta.nombre || ""
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                venta.rut || ""
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                venta.correo || ""
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                venta.telefono || ""
                            )
                                .toLowerCase()
                                .includes(texto);


                        const coincideCanal =
                            filtroCanal === "todos" ||
                            venta.tipo_venta ===
                                filtroCanal;


                        const coincidePago =
                            filtroPago === "todos" ||
                            venta.medio_pago ===
                                filtroPago;


                        return (
                            coincideBusqueda &&
                            coincideCanal &&
                            coincidePago
                        );

                    }
                );

            },
            [
                ventas,
                busqueda,
                filtroCanal,
                filtroPago
            ]
        );


    /* =====================================================
       ESTADÍSTICAS
    ===================================================== */

    const estadisticas =
        useMemo(
            () => {

                const total =
                    ventas.reduce(
                        (sum, venta) =>
                            sum +
                            Number(
                                venta.total || 0
                            ),
                        0
                    );


                const presencial =
                    ventas.filter(
                        venta =>
                            venta.tipo_venta ===
                            "presencial"
                    );


                const rrss =
                    ventas.filter(
                        venta =>
                            venta.tipo_venta ===
                            "rrss"
                    );


                return {

                    cantidad:
                        ventas.length,

                    total,

                    presencial:
                        presencial.length,

                    rrss:
                        rrss.length

                };

            },
            [ventas]
        );


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="
                max-w-[1500px]
                mx-auto
                p-8
            ">

                <AdminCard>

                    <p className="
                        text-slate-500
                    ">

                        Cargando ventas...

                    </p>

                </AdminCard>

            </div>

        );

    }


    return (

        <div className="
            max-w-[1500px]
            mx-auto
            p-4
            md:p-8
        ">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                mb-8
                rounded-[30px]
                bg-gradient-to-r
                from-pink-500
                to-purple-600
                text-white
                p-8
                shadow-xl
            ">

                <p className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    font-bold
                    text-pink-100
                ">

                    Boutique Pet Love ERP

                </p>

                <h1 className="
                    text-4xl
                    md:text-5xl
                    font-black
                    mt-2
                ">

                    🛒 Ventas externas

                </h1>

                <p className="
                    mt-3
                    text-white/90
                    text-lg
                ">

                    Registra ventas presenciales y ventas
                    realizadas por RRSS.

                </p>

            </div>


            {/* =================================================
                MENSAJES
            ================================================= */}

            {mensaje && (

                <div className="
                    mb-6
                    rounded-2xl
                    bg-emerald-50
                    border
                    border-emerald-200
                    text-emerald-700
                    p-4
                    font-bold
                ">

                    ✅ {mensaje}

                </div>

            )}


            {error && (

                <div className="
                    mb-6
                    rounded-2xl
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    p-4
                    font-bold
                ">

                    ⚠️ {error}

                </div>

            )}


            {/* =================================================
                NUEVA VENTA
            ================================================= */}

            <div className="
                grid
                xl:grid-cols-[1.3fr_0.7fr]
                gap-6
                mb-10
            ">


                {/* =================================================
                    FORMULARIO
                ================================================= */}

                <AdminCard>

                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-6
                    ">

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-[0.2em]
                                text-pink-500
                                font-bold
                            ">

                                Nueva venta

                            </p>

                            <h2 className="
                                text-2xl
                                font-black
                                mt-1
                            ">

                                Registrar venta

                            </h2>

                        </div>

                    </div>


                    {/* TIPO DE VENTA */}

                    <div className="mb-6">

                        <label className="
                            block
                            text-sm
                            font-bold
                            text-slate-600
                            mb-2
                        ">

                            Canal de venta

                        </label>

                        <div className="
                            grid
                            grid-cols-2
                            gap-3
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    setTipoVenta(
                                        "presencial"
                                    )
                                }
                                className={`
                                    p-4
                                    rounded-2xl
                                    border
                                    font-bold
                                    transition

                                    ${
                                        tipoVenta ===
                                        "presencial"
                                            ? `
                                                bg-pink-500
                                                text-white
                                                border-pink-500
                                            `
                                            : `
                                                bg-white
                                                text-slate-600
                                                border-slate-200
                                            `
                                    }
                                `}
                            >

                                🏪 Presencial

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                setTipoVenta(
                                    "rrss"
                                    )
                                }
                                className={`
                                    p-4
                                    rounded-2xl
                                    border
                                    font-bold
                                    transition

                                    ${
                                        tipoVenta ===
                                        "rrss"
                                            ? `
                                                bg-green-500
                                                text-white
                                                border-green-500
                                            `
                                            : `
                                                bg-white
                                                text-slate-600
                                                border-slate-200
                                            `
                                    }
                                `}
                            >

                                📱 RRSS

                            </button>

                        </div>

                    </div>


                    {/* CLIENTE */}

                    <div className="
                        grid
                        md:grid-cols-2
                        gap-4
                        mb-6
                    ">

                        <input
                            value={
                                cliente.nombre
                            }
                            onChange={e =>
                                setCliente({
                                    ...cliente,
                                    nombre:
                                        e.target.value
                                })
                            }
                            placeholder="
                                Nombre del cliente
                            "
                            className="
                                border
                                border-slate-200
                                rounded-xl
                                p-3
                                outline-none
                                focus:ring-2
                                focus:ring-pink-300
                            "
                        />


                        <input
                            value={
                                cliente.rut
                            }
                            onChange={e =>
                                setCliente({
                                    ...cliente,
                                    rut:
                                        e.target.value
                                })
                            }
                            placeholder="RUT"
                            className="
                                border
                                border-slate-200
                                rounded-xl
                                p-3
                                outline-none
                                focus:ring-2
                                focus:ring-pink-300
                            "
                        />


                        <input
                            value={
                                cliente.correo
                            }
                            onChange={e =>
                                setCliente({
                                    ...cliente,
                                    correo:
                                        e.target.value
                                })
                            }
                            placeholder="Correo"
                            type="email"
                            className="
                                border
                                border-slate-200
                                rounded-xl
                                p-3
                                outline-none
                                focus:ring-2
                                focus:ring-pink-300
                            "
                        />


                        <input
                            value={
                                cliente.telefono
                            }
                            onChange={e =>
                                setCliente({
                                    ...cliente,
                                    telefono:
                                        e.target.value
                                })
                            }
                            placeholder="Teléfono"
                            className="
                                border
                                border-slate-200
                                rounded-xl
                                p-3
                                outline-none
                                focus:ring-2
                                focus:ring-pink-300
                            "
                        />

                    </div>

                    {tipoVenta === "rrss" && (
    <div className="space-y-4">

        <div>
            <label>Dirección de envío</label>

            <input
                type="text"
                value={despacho.direccion}
                onChange={(e) =>
                    setDespacho({
                        ...despacho,
                        direccion: e.target.value
                    })
                }
                placeholder="Ej: Av. Providencia 1234"
            />
        </div>

        <div>
            <label>Comuna</label>

            <input
                type="text"
                value={despacho.comuna}
                onChange={(e) =>
                    setDespacho({
                        ...despacho,
                        comuna: e.target.value
                    })
                }
                placeholder="Ej: Providencia"
            />
        </div>

        <div>
            <label>Región</label>

            <select
                value={despacho.region}
                onChange={(e) =>
                    setDespacho({
                        ...despacho,
                        region: e.target.value,
                        empresa_envio: ""
                    })
                }
            >
                <option value="">
                    Seleccionar región
                </option>

                <option value="Región de Arica y Parinacota">
                    Arica y Parinacota
                </option>

                <option value="Región de Tarapacá">
                    Tarapacá
                </option>

                <option value="Región de Antofagasta">
                    Antofagasta
                </option>

                <option value="Región de Atacama">
                    Atacama
                </option>

                <option value="Región de Coquimbo">
                    Coquimbo
                </option>

                <option value="Valparaíso">
                    Valparaíso
                </option>

                <option value="Región Metropolitana de Santiago">
                    Metropolitana de Santiago
                </option>

                <option value="Libertador General Bernardo O'Higgins">
                    Libertador General Bernardo O'Higgins
                </option>

                <option value="Región del Maule">
                    Maule
                </option>

                <option value="Región de Ñuble">
                    Ñuble
                </option>

                <option value="Región del Biobío">
                    Biobío
                </option>

                <option value="Región de La Araucanía">
                    La Araucanía
                </option>

                <option value="Región de Los Ríos">
                    Los Ríos
                </option>

                <option value="Región de Los Lagos">
                    Los Lagos
                </option>

                <option value="Región de Aysén del General Carlos Ibáñez del Campo">
                    Aysén
                </option>

                <option value="Región de Magallanes y de la Antártica Chilena">
                    Magallanes
                </option>
            </select>
        </div>

        {despacho.region &&
            !esRegionPaket && (
                <div>
                    <label>Empresa de envío</label>

                    <select
                        value={despacho.empresa_envio}
                        onChange={(e) =>
                            setDespacho({
                                ...despacho,
                                empresa_envio:
                                    e.target.value
                            })
                        }
                    >
                        <option value="">
                            Seleccionar empresa
                        </option>

                        <option value="starken">
                            STARKEN
                        </option>

                        <option value="bluexpress">
                            BLUEXPRESS
                        </option>
                    </select>
                </div>
            )}

        {despacho.region && (
            <div>
                {esRegionPaket ? (
                    <>
                        <p>
                            Empresa de envío: <strong>PAKET</strong>
                        </p>

                        <p>
                            Costo de envío: <strong>$3.500</strong>
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            Empresa de envío:{" "}
                            <strong>
                                {despacho.empresa_envio
                                    ? despacho.empresa_envio.toUpperCase()
                                    : "Pendiente de selección"}
                            </strong>
                        </p>

                        <p>
                            <strong>Envío por pagar</strong>
                        </p>
                    </>
                )}
            </div>
        )}

    </div>
)}


                    {/* PRODUCTO */}

                    <div className="
                        grid
                        md:grid-cols-3
                        gap-4
                        items-end
                        mb-6
                    ">

                        <div>

                            <label className="
                                block
                                text-sm
                                font-bold
                                text-slate-600
                                mb-2
                            ">

                                Producto

                            </label>

                            <select
                                value={
                                    productoSeleccionado
                                }
                                onChange={e => {

                                    setProductoSeleccionado(
                                        e.target.value
                                    );

                                    setVarianteSeleccionada(
                                        ""
                                    );

                                }}
                                className="
                                    w-full
                                    border
                                    border-slate-200
                                    rounded-xl
                                    p-3
                                    bg-white
                                "
                            >

                                <option value="">

                                    Seleccionar producto

                                </option>

                                {productos.map(
                                    producto => (

                                        <option
                                            key={
                                                producto.id
                                            }
                                            value={
                                                producto.id
                                            }
                                        >

                                            {
                                                producto.name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-bold
                                text-slate-600
                                mb-2
                            ">

                                Talla

                            </label>

                            <select
                                value={
                                    varianteSeleccionada
                                }
                                onChange={e =>
                                    setVarianteSeleccionada(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    !productoSeleccionado
                                }
                                className="
                                    w-full
                                    border
                                    border-slate-200
                                    rounded-xl
                                    p-3
                                    bg-white
                                    disabled:bg-slate-100
                                "
                            >

                                <option value="">

                                    Seleccionar talla

                                </option>

                                {variantesDisponibles.map(
                                    variante => (

                                        <option
                                            key={
                                                variante.id
                                            }
                                            value={
                                                variante.id
                                            }
                                            disabled={
                                                Number(
                                                    variante.stock
                                                ) <= 0
                                            }
                                        >

                                            {variante.size}
                                            {" — "}
                                            {
                                                moneda(
                                                    variante.price
                                                )
                                            }
                                            {" — Stock: "}
                                            {
                                                variante.stock
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-bold
                                text-slate-600
                                mb-2
                            ">

                                Cantidad

                            </label>

                            <div className="
                                flex
                                gap-2
                            ">

                                <input
                                    type="number"
                                    min="1"
                                    max={
                                        varianteActual?.stock ||
                                        1
                                    }
                                    value={
                                        cantidad
                                    }
                                    onChange={e =>
                                        setCantidad(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        border
                                        border-slate-200
                                        rounded-xl
                                        p-3
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={
                                        agregarProducto
                                    }
                                    className="
                                        px-5
                                        rounded-xl
                                        bg-slate-900
                                        text-white
                                        font-bold
                                        hover:bg-slate-700
                                    "
                                >

                                    +

                                </button>

                            </div>

                        </div>

                    </div>


                    {/* DETALLE DE VENTA */}

                    <div className="
                        border
                        border-slate-200
                        rounded-2xl
                        overflow-hidden
                        mb-6
                    ">

                        <div className="
                            bg-slate-50
                            px-4
                            py-3
                            font-bold
                            text-slate-600
                        ">

                            Detalle de la venta

                        </div>


                        {items.length === 0 ? (

                            <div className="
                                p-6
                                text-center
                                text-slate-400
                            ">

                                No hay productos agregados.

                            </div>

                        ) : (

                            <div>

                                {items.map(
                                    item => (

                                        <div
                                            key={
                                                item.variant_id
                                            }
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                p-4
                                                border-t
                                            "
                                        >

                                            <div>

                                                <div className="
                                                    font-bold
                                                ">

                                                    {
                                                        item.name
                                                    }

                                                </div>

                                                <div className="
                                                    text-sm
                                                    text-slate-500
                                                ">

                                                    {
                                                        item.size
                                                    }

                                                    {" × "}

                                                    {
                                                        item.quantity
                                                    }

                                                </div>

                                            </div>


                                            <div className="
                                                flex
                                                items-center
                                                gap-4
                                            ">

                                                <strong>

                                                    {
                                                        moneda(
                                                            Number(
                                                                item.price
                                                            ) *
                                                            Number(
                                                                item.quantity
                                                            )
                                                        )
                                                    }

                                                </strong>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        eliminarItem(
                                                            item.variant_id
                                                        )
                                                    }
                                                    className="
                                                        text-red-500
                                                        font-bold
                                                    "
                                                >

                                                    ✕

                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* OBSERVACIÓN */}

                    <textarea
                        value={
                            cliente.observacion
                        }
                        onChange={e =>
                            setCliente({
                                ...cliente,
                                observacion:
                                    e.target.value
                            })
                        }
                        placeholder="Observaciones"
                        rows={3}
                        className="
                            w-full
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            mb-6
                        "
                    />


                    {/* MEDIO DE PAGO */}

                    <div className="mb-6">

                        <label className="
                            block
                            text-sm
                            font-bold
                            text-slate-600
                            mb-2
                        ">

                            Medio de pago

                        </label>

                        <select
                            value={
                                medioPago
                            }
                            onChange={e =>
                                setMedioPago(
                                    e.target.value
                                )
                            }
                            className="
                                w-full
                                border
                                border-slate-200
                                rounded-xl
                                p-3
                                bg-white
                            "
                        >

                            <option value="efectivo">

                                💵 Efectivo

                            </option>

                            <option value="transferencia">

                                🏦 Transferencia

                            </option>

                            <option value="debito">

                                💳 POS TUU

                            </option>

                        </select>

                    </div>


                    <button
                        type="button"
                        disabled={
                            guardando ||
                            items.length === 0
                        }
                        onClick={
                            registrarVenta
                        }
                        className="
                            w-full
                            py-4
                            rounded-2xl
                            bg-gradient-to-r
                            from-pink-500
                            to-purple-600
                            text-white
                            font-black
                            text-lg
                            shadow-lg
                            hover:scale-[1.01]
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >

                        {guardando
                            ? "Registrando..."
                            : "💰 Registrar venta"}

                    </button>

                </AdminCard>


                {/* =================================================
                    RESUMEN
                ================================================= */}

                <div className="
                    space-y-6
                ">


                    <AdminCard>

                        <p className="
                            text-xs
                            uppercase
                            tracking-[0.2em]
                            text-slate-400
                            font-bold
                        ">

                            Resumen

                        </p>


                        <div className="
                            mt-4
                            flex
                            justify-between
                            items-end
                        ">

                            <span className="
                                text-slate-500
                            ">

                                Total venta

                            </span>


                            <strong className="
                                text-4xl
                                font-black
                                text-slate-900
                            ">

                                {
                                    moneda(total)
                                }

                            </strong>

                        </div>


                        <div className="
                            mt-4
                            text-sm
                            text-slate-500
                        ">

                            {items.length} producto(s)

                        </div>

                    </AdminCard>


                    <AdminCard>

                        <p className="
                            text-xs
                            uppercase
                            tracking-[0.2em]
                            text-slate-400
                            font-bold
                        ">

                            Ventas externas

                        </p>


                        <div className="
                            grid
                            grid-cols-2
                            gap-3
                            mt-5
                        ">

                            <div className="
                                rounded-2xl
                                bg-slate-50
                                p-4
                            ">

                                <div className="
                                    text-xs
                                    font-bold
                                    text-slate-400
                                ">

                                    Total

                                </div>

                                <div className="
                                    text-2xl
                                    font-black
                                    mt-1
                                ">

                                    {
                                        estadisticas.cantidad
                                    }

                                </div>

                            </div>


                            <div className="
                                rounded-2xl
                                bg-slate-50
                                p-4
                            ">

                                <div className="
                                    text-xs
                                    font-bold
                                    text-slate-400
                                ">

                                    Vendido

                                </div>

                                <div className="
                                    text-xl
                                    font-black
                                    mt-1
                                ">

                                    {
                                        moneda(
                                            estadisticas.total
                                        )
                                    }

                                </div>

                            </div>


                            <div className="
                                rounded-2xl
                                bg-blue-50
                                p-4
                            ">

                                <div className="
                                    text-xs
                                    font-bold
                                    text-blue-500
                                ">

                                    Presenciales

                                </div>

                                <div className="
                                    text-2xl
                                    font-black
                                    mt-1
                                    text-blue-700
                                ">

                                    {
                                        estadisticas.presencial
                                    }

                                </div>

                            </div>


                            <div className="
                                rounded-2xl
                                bg-green-50
                                p-4
                            ">

                                <div className="
                                    text-xs
                                    font-bold
                                    text-green-500
                                ">

                                    RRHH

                                </div>

                                <div className="
                                    text-2xl
                                    font-black
                                    mt-1
                                    text-green-700
                                ">

                                    {
                                        estadisticas.RRHH
                                    }

                                </div>

                            </div>

                        </div>

                    </AdminCard>

                </div>

            </div>


            {/* =================================================
                HISTORIAL
            ================================================= */}

            <AdminCard>

                <div className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    mb-6
                ">

                    <div>

                        <p className="
                            text-xs
                            uppercase
                            tracking-[0.2em]
                            text-pink-500
                            font-bold
                        ">

                            Control de ventas

                        </p>

                        <h2 className="
                            text-3xl
                            font-black
                            text-slate-900
                            mt-1
                        ">

                            📋 Historial de ventas externas

                        </h2>

                        <p className="
                            text-sm
                            text-slate-500
                            mt-2
                        ">

                            Ventas realizadas presencialmente
                            o mediante RRHH.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            actualizarHistorial
                        }
                        disabled={
                            actualizando
                        }
                        className="
                            px-5
                            py-3
                            rounded-xl
                            bg-slate-900
                            text-white
                            font-bold
                            hover:bg-slate-700
                            disabled:opacity-50
                        "
                    >

                        {actualizando
                            ? "Actualizando..."
                            : "🔄 Actualizar"}

                    </button>

                </div>


                {/* FILTROS */}

                <div className="
                    grid
                    grid-cols-1
                    lg:grid-cols-[1fr_220px_220px]
                    gap-4
                    mb-6
                ">

                    <input
                        value={
                            busqueda
                        }
                        onChange={e =>
                            setBusqueda(
                                e.target.value
                            )
                        }
                        placeholder="
                            Buscar por cliente, RUT,
                            teléfono o número de venta...
                        "
                        className="
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            outline-none
                            focus:ring-2
                            focus:ring-pink-300
                        "
                    />


                    <select
                        value={
                            filtroCanal
                        }
                        onChange={e =>
                            setFiltroCanal(
                                e.target.value
                            )
                        }
                        className="
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            bg-white
                        "
                    >

                        <option value="todos">

                            Todos los canales

                        </option>

                        <option value="presencial">

                            🏪 Presencial

                        </option>

                        <option value="rrss">

                            📱 RRSS

                        </option>

                    </select>


                    <select
                        value={
                            filtroPago
                        }
                        onChange={e =>
                            setFiltroPago(
                                e.target.value
                            )
                        }
                        className="
                            border
                            border-slate-200
                            rounded-xl
                            p-3
                            bg-white
                        "
                    >

                        <option value="todos">

                            Todos los pagos

                        </option>

                        <option value="efectivo">

                            💵 Efectivo

                        </option>

                        <option value="transferencia">

                            🏦 Transferencia

                        </option>

                        <option value="debito">

                            💳 POS TUU

                        </option>


                        <option value="mercado_pago">

                            🟢 Mercado Pago

                        </option>

                    </select>

                </div>


                {/* TABLA */}

                <div className="
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-slate-200
                ">

                    <table className="
                        w-full
                        min-w-[1050px]
                    ">

                        <thead>

                            <tr className="
                                bg-slate-50
                                border-b
                                border-slate-200
                            ">

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Venta

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Fecha

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Cliente

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Canal

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Pago

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-left
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Estado

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-right
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Total

                                </th>

                                <th className="
                                    px-4
                                    py-4
                                    text-center
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-slate-500
                                ">

                                    Detalle

                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {ventasFiltradas.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="
                                            px-6
                                            py-12
                                            text-center
                                            text-slate-400
                                        "
                                    >

                                        No hay ventas que coincidan
                                        con los filtros.

                                    </td>

                                </tr>

                            ) : (

                                ventasFiltradas.map(
                                    venta => (

                                        <tr
                                            key={
                                                venta.id
                                            }
                                            className="
                                                border-b
                                                border-slate-100
                                                hover:bg-pink-50/30
                                            "
                                        >

                                            {/* VENTA */}

                                            <td className="
                                                px-4
                                                py-4
                                            ">

                                                <span className="
                                                    font-black
                                                    text-pink-600
                                                ">

                                                    #

                                                    {
                                                        venta.numero_venta
                                                    }

                                                </span>

                                            </td>


                                            {/* FECHA */}

                                            <td className="
                                                px-4
                                                py-4
                                                whitespace-nowrap
                                                text-sm
                                                text-slate-600
                                            ">

                                                {
                                                    fechaVenta(
                                                        venta.created_at
                                                    )
                                                }

                                            </td>


                                            {/* CLIENTE */}

                                            <td className="
                                                px-4
                                                py-4
                                            ">

                                                <div className="
                                                    font-bold
                                                    text-slate-800
                                                ">

                                                    {
                                                        venta.nombre ||
                                                        "Sin nombre"
                                                    }

                                                </div>

                                                {venta.rut && (

                                                    <div className="
                                                        text-xs
                                                        text-slate-400
                                                        mt-1
                                                    ">

                                                        RUT:{" "}
                                                        {
                                                            venta.rut
                                                        }

                                                    </div>

                                                )}

                                            </td>


                                            {/* CANAL */}

                                            <td className="
                                                px-4
                                                py-4
                                            ">

                                                <span className={`
                                                    inline-flex
                                                    rounded-full
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-black

                                                    ${
                                                        venta.tipo_venta ===
                                                        "rrss"
                                                            ? `
                                                                bg-green-100
                                                                text-green-700
                                                            `
                                                            : `
                                                                bg-blue-100
                                                                text-blue-700
                                                            `
                                                    }
                                                `}>

                                                    {
                                                        etiquetaCanal(
                                                            venta.tipo_venta
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* PAGO */}

                                            <td className="
                                                px-4
                                                py-4
                                                text-sm
                                                font-semibold
                                                text-slate-600
                                            ">

                                                {
                                                    etiquetaPago(
                                                        venta.medio_pago
                                                    )
                                                }

                                            </td>


                                            {/* ESTADO */}

                                            <td className="
                                                px-4
                                                py-4
                                            ">

                                                <span className="
                                                    inline-flex
                                                    rounded-full
                                                    bg-emerald-100
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-black
                                                    text-emerald-700
                                                ">

                                                    {
                                                        venta.estado_pago ===
                                                        "pagado"
                                                            ? "Pagado"
                                                            : venta.estado_pago ||
                                                              venta.estado ||
                                                              "-"
                                                    }

                                                </span>

                                            </td>


                                            {/* TOTAL */}

                                            <td className="
                                                px-4
                                                py-4
                                                text-right
                                                whitespace-nowrap
                                            ">

                                                <strong className="
                                                    text-slate-900
                                                ">

                                                    {
                                                        moneda(
                                                            venta.total
                                                        )
                                                    }

                                                </strong>

                                            </td>


                                            {/* DETALLE */}

                                            <td className="
                                                px-4
                                                py-4
                                                text-center
                                            ">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVentaSeleccionada(
                                                            venta
                                                        )
                                                    }
                                                    className="
                                                        rounded-xl
                                                        bg-slate-100
                                                        px-4
                                                        py-2
                                                        text-sm
                                                        font-bold
                                                        text-slate-700
                                                        hover:bg-pink-100
                                                        hover:text-pink-600
                                                    "
                                                >

                                                    👁 Ver

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>


                {/* RESUMEN FILTRADO */}

                <div className="
                    mt-4
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:justify-between
                    text-sm
                    text-slate-500
                ">

                    <span>

                        Mostrando{" "}
                        <strong className="
                            text-slate-800
                        ">

                            {
                                ventasFiltradas.length
                            }

                        </strong>{" "}
                        de{" "}
                        <strong className="
                            text-slate-800
                        ">

                            {
                                ventas.length
                            }

                        </strong>{" "}
                        ventas

                    </span>


                    <span>

                        Total filtrado:{" "}

                        <strong className="
                            text-slate-900
                        ">

                            {
                                moneda(
                                    ventasFiltradas.reduce(
                                        (sum, venta) =>
                                            sum +
                                            Number(
                                                venta.total ||
                                                0
                                            ),
                                        0
                                    )
                                )
                            }

                        </strong>

                    </span>

                </div>

            </AdminCard>


            {/* =================================================
                MODAL DETALLE
            ================================================= */}

            {ventaSeleccionada && (

                <div className="
                    fixed
                    inset-0
                    z-50
                    flex
                    items-center
                    justify-center
                    bg-slate-950/50
                    p-4
                ">

                    <div className="
                        max-h-[90vh]
                        w-full
                        max-w-3xl
                        overflow-y-auto
                        rounded-3xl
                        bg-white
                        shadow-2xl
                    ">

                        {/* CABECERA */}

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            border-b
                            border-slate-200
                            px-6
                            py-5
                        ">

                            <div>

                                <p className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    font-black
                                    text-pink-500
                                ">

                                    Detalle de venta

                                </p>

                                <h2 className="
                                    text-2xl
                                    font-black
                                    text-slate-900
                                    mt-1
                                ">

                                    Venta #
                                    {
                                        ventaSeleccionada.numero_venta
                                    }

                                </h2>

                            </div>


                            <div className="
                                flex
                                items-center
                                gap-2
                            ">

                                <button
                                    type="button"
                                    onClick={() =>
                                        imprimirComprobante(
                                            ventaSeleccionada
                                        )
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-slate-900
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-black
                                        text-white
                                        shadow-sm
                                        transition
                                        hover:bg-slate-700
                                    "
                                    title="Imprimir comprobante"
                                >

                                    <span>
                                        🖨️
                                    </span>

                                    <span className="
                                        hidden
                                        sm:inline
                                    ">

                                        Imprimir

                                    </span>

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setVentaSeleccionada(
                                            null
                                        )
                                    }
                                    className="
                                        h-10
                                        w-10
                                        rounded-xl
                                        bg-slate-100
                                        font-bold
                                        text-slate-500
                                        hover:bg-red-50
                                        hover:text-red-500
                                    "
                                    aria-label="Cerrar"
                                >

                                    ✕

                                </button>

                            </div>

                        </div>


                        <div className="p-6">

                            {/* DATOS PRINCIPALES */}

                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-4
                            ">

                                <div className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">

                                        Cliente

                                    </p>

                                    <p className="
                                        mt-1
                                        font-bold
                                        text-slate-800
                                    ">

                                        {
                                            ventaSeleccionada.nombre ||
                                            "Sin nombre"
                                        }

                                    </p>

                                </div>


                                <div className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">

                                        Fecha

                                    </p>

                                    <p className="
                                        mt-1
                                        font-bold
                                        text-slate-800
                                    ">

                                        {
                                            fechaVenta(
                                                ventaSeleccionada.created_at
                                            )
                                        }

                                    </p>

                                </div>


                                <div className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">

                                        Canal

                                    </p>

                                    <p className="
                                        mt-1
                                        font-bold
                                        text-slate-800
                                    ">

                                        {
                                            etiquetaCanal(
                                                ventaSeleccionada.tipo_venta
                                            )
                                        }

                                    </p>

                                </div>


                                <div className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">

                                        Medio de pago

                                    </p>

                                    <p className="
                                        mt-1
                                        font-bold
                                        text-slate-800
                                    ">

                                        {
                                            etiquetaPago(
                                                ventaSeleccionada.medio_pago
                                            )
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* DATOS CLIENTE */}

                            {(ventaSeleccionada.rut ||
                                ventaSeleccionada.correo ||
                                ventaSeleccionada.telefono) && (

                                <div className="
                                    mt-5
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-5
                                ">

                                    <h3 className="
                                        font-black
                                        text-slate-900
                                    ">

                                        Datos del cliente

                                    </h3>


                                    <div className="
                                        grid
                                        grid-cols-1
                                        md:grid-cols-3
                                        gap-4
                                        mt-4
                                    ">

                                        <div>

                                            <p className="
                                                text-xs
                                                font-bold
                                                text-slate-400
                                            ">

                                                RUT

                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                            ">

                                                {
                                                    ventaSeleccionada.rut ||
                                                    "-"
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="
                                                text-xs
                                                font-bold
                                                text-slate-400
                                            ">

                                                Correo

                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                break-all
                                            ">

                                                {
                                                    ventaSeleccionada.correo ||
                                                    "-"
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="
                                                text-xs
                                                font-bold
                                                text-slate-400
                                            ">

                                                Teléfono

                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                            ">

                                                {
                                                    ventaSeleccionada.telefono ||
                                                    "-"
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* PRODUCTOS */}

                            <div className="
                                mt-5
                                rounded-2xl
                                border
                                border-slate-200
                                overflow-hidden
                            ">

                                <div className="
                                    bg-slate-50
                                    px-5
                                    py-4
                                    font-black
                                    text-slate-800
                                ">

                                    Productos vendidos

                                </div>


                                {Array.isArray(
                                    ventaSeleccionada.items
                                ) &&
                                ventaSeleccionada.items.length >
                                    0 ? (

                                    ventaSeleccionada.items.map(
                                        (item, index) => {

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

                                            return (

                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-4
                                                        border-t
                                                        border-slate-100
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div>

                                                        <div className="
                                                            font-bold
                                                            text-slate-800
                                                        ">

                                                            {
                                                                nombre
                                                            }

                                                        </div>

                                                        <div className="
                                                            mt-1
                                                            text-sm
                                                            text-slate-500
                                                        ">

                                                            Talla:{" "}
                                                            {
                                                                talla
                                                            }

                                                            {" · "}

                                                            Cantidad:{" "}
                                                            {
                                                                itemCantidad
                                                            }

                                                        </div>

                                                    </div>


                                                    <strong className="
                                                        whitespace-nowrap
                                                        text-slate-900
                                                    ">

                                                        {
                                                            moneda(
                                                                itemPrecio *
                                                                itemCantidad
                                                            )
                                                        }

                                                    </strong>

                                                </div>

                                            );

                                        }
                                    )

                                ) : (

                                    <div className="
                                        p-6
                                        text-center
                                        text-slate-400
                                    ">

                                        No hay detalle de productos
                                        disponible.

                                    </div>

                                )}

                            </div>


                            {/* VENDEDOR */}

                            <div className="
                                mt-5
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-4
                            ">

                                <div className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-slate-400
                                    ">

                                        Vendedor

                                    </p>

                                    <p className="
                                        mt-1
                                        font-bold
                                        text-slate-800
                                    ">

                                        {
                                            ventaSeleccionada.vendedor ||
                                            "-"
                                        }

                                    </p>

                                </div>


                                <div className="
                                    rounded-2xl
                                    bg-slate-900
                                    p-4
                                    text-white
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        text-white/60
                                    ">

                                        Total venta

                                    </p>

                                    <p className="
                                        mt-1
                                        text-2xl
                                        font-black
                                    ">

                                        {
                                            moneda(
                                                ventaSeleccionada.total
                                            )
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* OBSERVACIONES */}

                            {ventaSeleccionada.observacion && (

                                <div className="
                                    mt-5
                                    rounded-2xl
                                    bg-slate-50
                                    p-5
                                ">

                                    <p className="
                                        text-xs
                                        uppercase
                                        tracking-wider
                                        font-black
                                        text-slate-400
                                    ">

                                        Observaciones

                                    </p>

                                    <p className="
                                        mt-2
                                        whitespace-pre-wrap
                                        text-sm
                                        text-slate-700
                                    ">

                                        {
                                            ventaSeleccionada.observacion
                                        }

                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

import { Link } from "react-router-dom";
import {
    useEffect,
    useMemo,
    useState
} from "react";

import { supabase } from "../../supabaseClient";
import AdminCard from "../components/AdminCard";
import CanalVentaSelector from "./ventas-externas/components/CanalVentaSelector";
import ClienteForm from "./ventas-externas/components/ClienteForm";
import MedioPagoSelector from "./ventas-externas/components/MedioPagoSelector";
import ProductoSelector from "./ventas-externas/components/ProductoSelector";
import VentaProductoModal from "./ventas-externas/components/VentaProductoModal";
import DespachoRRSS from "./ventas-externas/components/DespachoRRSS";
import ItemsVenta from "./ventas-externas/components/ItemsVenta";
import ResumenVenta from "./ventas-externas/components/ResumenVenta";
import HistorialVentas from "./ventas-externas/components/HistorialVentas";
import VentaDetalleModal from "./ventas-externas/components/VentaDetalleModal";

import {
    moneda,
    fechaVenta,
    etiquetaCanal,
    etiquetaPago
} from "./ventas-externas/utils/formatoVenta";

import {
    imprimirComprobante as imprimirComprobanteUtil
} from "./ventas-externas/utils/imprimirComprobante";

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

    const [modalProductoAbierto, setModalProductoAbierto] = useState(false);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");
    
    const [erroresValidacion, setErroresValidacion] =
    useState([]);

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
                    category,
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
        "Región de Valparaíso",
        "Región del Libertador General Bernardo O'Higgins"
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


    const agregarProducto = (
        productoModal = null,
        varianteModal = null,
        cantidadModal = null
    ) => {
        setError("");

        const productoParaAgregar = productoModal || productoActual;
        const varianteParaAgregar = varianteModal || varianteActual;
        const qty = Number(cantidadModal ?? cantidad);

        if (!productoParaAgregar) {
            setError("Selecciona un producto.");
            return false;
        }

        if (!varianteParaAgregar) {
            setError("Selecciona una talla.");
            return false;
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            setError("La cantidad debe ser mayor que cero.");
            return false;
        }

        const cantidadEnCarrito = items
            .filter(
                (item) =>
                    Number(item.variant_id) ===
                    Number(varianteParaAgregar.id)
            )
            .reduce(
                (sum, item) => sum + Number(item.quantity),
                0
            );

        if (
            cantidadEnCarrito + qty >
            Number(varianteParaAgregar.stock || 0)
        ) {
            setError(
                `Stock insuficiente. Disponible: ${Math.max(
                    0,
                    Number(varianteParaAgregar.stock || 0) -
                        cantidadEnCarrito
                )}.`
            );
            return false;
        }

        const existente = items.find(
            (item) =>
                Number(item.variant_id) ===
                Number(varianteParaAgregar.id)
        );

        if (existente) {
            setItems((prev) =>
                prev.map((item) =>
                    Number(item.variant_id) ===
                    Number(varianteParaAgregar.id)
                        ? {
                            ...item,
                            quantity:
                                Number(item.quantity) + qty
                        }
                        : item
                )
            );
        } else {
            setItems((prev) => [
                ...prev,
                {
                    variant_id: varianteParaAgregar.id,
                    product_id: productoParaAgregar.id,
                    name: productoParaAgregar.name,
                    size: varianteParaAgregar.size,
                    price: Number(varianteParaAgregar.price),
                    quantity: qty
                }
            ]);
        }

        setProductoSeleccionado("");
        setVarianteSeleccionada("");
        setCantidad(1);
        setError("");

        return true;
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
   VALIDACIÓN DEL FORMULARIO
===================================================== */

const validarFormulario = () => {

    const errores = [];

    if (!cliente.nombre.trim()) {
        errores.push("Nombre del cliente");
    }

    if (esVentaRRSS) {

        if (!despacho.direccion.trim()) {
            errores.push("Dirección de despacho");
        }

        if (!despacho.comuna.trim()) {
            errores.push("Comuna de despacho");
        }

        if (!despacho.region) {
            errores.push("Región de despacho");
        }

        if (
            despacho.region &&
            !esRegionPaket &&
            !despacho.empresa_envio
        ) {
            errores.push("Empresa de envío");
        }

    }

    if (items.length === 0) {
        errores.push("Agrega al menos un producto");
    }

    setErroresValidacion(errores);

    if (errores.length > 0) {

        setTimeout(() => {

            document
                .getElementById("errores-validacion-venta")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

        }, 0);

        return false;

    }

    return true;
};


    /* =====================================================
       REGISTRAR VENTA
    ===================================================== */

    const registrarVenta = async () => {
    
        setError("");
        setMensaje("");
    
        if (!validarFormulario()) {
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
                            esVentaRRSS
                                ? cliente.rut
                                : null,
                        
                        p_correo:
                            esVentaRRSS
                                ? cliente.correo
                                : null,
                        
                        p_telefono:
                            esVentaRRSS
                                ? cliente.telefono
                                : null,

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
            setErroresValidacion([]);

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

     const limpiarFormulario = () => {
    if (guardando) return;

    const confirmar = window.confirm(
        "¿Deseas limpiar el formulario? Se eliminarán los datos ingresados y los productos agregados que aún no se han registrado."
    );

    if (!confirmar) return;

    setTipoVenta("presencial");
    setMedioPago("efectivo");

    setCliente({
        nombre: "",
        rut: "",
        correo: "",
        telefono: "",
        observacion: "",
    });

    setDespacho({
        direccion: "",
        comuna: "",
        region: "",
        empresa_envio: "",
    });

    setProductoSeleccionado("");
    setVarianteSeleccionada("");
    setCantidad(1);
    setItems([]);

    setMensaje("");
    setError("");
    setErroresValidacion([]);
};


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

            <div className="mb-6">
    <Link
        to="/admin/inventario"
        className="
            inline-flex
            items-center
            text-sm
            font-semibold
            text-pink-600
            transition
            hover:text-pink-700
            hover:underline
        "
    >
        ← Volver a Inventario
    </Link>
</div>
            {/* Encabezado independiente, sin tarjeta */}
<div className="mb-6">
    <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-500">
        Nueva venta
    </p>

    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Registrar venta 🛒
        </h1>

        {/* Conserva aquí la etiqueta actual del canal */}
    </div>

    <p className="mt-2 text-slate-500">
        Registra ventas presenciales y ventas realizadas por RRSS.
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
                    mb-10
                ">


                {/* =================================================
                    FORMULARIO
                ================================================= */}

<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
    <div className="min-w-0 space-y-6 xl:col-span-2">
                    

                {/* PASO 1: TIPO DE VENTA */}
                <section className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    md:p-6
                    shadow-sm
                ">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-br
                            from-pink-500
                            to-purple-600
                            text-white
                            font-black
                            shadow-md
                        ">
                            1
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <h3 className="text-base md:text-lg font-black text-slate-800">
                                Tipo de venta
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                {esVentaRRSS
                                    ? "Registra una venta realizada por redes sociales con despacho."
                                    : "Registra una venta realizada presencialmente en tienda."
                                }
                            </p>
                        </div>

                        <span className={`
                            inline-flex
                            items-center
                            rounded-full
                            border
                            px-3
                            py-2
                            text-xs
                            font-black
                            uppercase
                            tracking-wide
                            ${
                                esVentaRRSS
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : "bg-pink-50 text-pink-600 border-pink-200"
                            }
                        `}>
                            {esVentaRRSS
                                ? "Venta RRSS"
                                : "Venta presencial"
                            }
                        </span>
                    </div>

                    <CanalVentaSelector
                        tipoVenta={tipoVenta}
                        setTipoVenta={setTipoVenta}
                    />
                </section>

                {/* CLIENTE */}


                    <ClienteForm
                        cliente={cliente}
                        setCliente={setCliente}
                        esVentaRRSS={esVentaRRSS}
                    />

                    {tipoVenta === "rrss" && (
                        <div className="space-y-4">
                    
                            <DespachoRRSS
                                despacho={despacho}
                                setDespacho={setDespacho}
                                esRegionPaket={esRegionPaket}
                            />
                    
                        </div>
                    )}


                    {/* PRODUCTO */}

                    <ProductoSelector
                        numero={esVentaRRSS ? 4 : 3}
                        productos={productos}
                        moneda={moneda}
                        items={items}
                        eliminarItem={eliminarItem}
                        abrirModal={() => setModalProductoAbierto(true)}
                    />


                    {/* OBSERVACIÓN */}

                    <section className="
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-5
                        md:p-6
                        shadow-sm
                    ">
                    
                        <div className="
                            flex
                            items-start
                            gap-4
                            mb-5
                        ">
                    
                            <div className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-gradient-to-br
                                from-pink-500
                                to-purple-600
                                text-white
                                font-black
                                shadow-md
                            ">
                    
                                {esVentaRRSS ? 6 : 5}
                    
                            </div>
                    
                    
                            <div className="
                                min-w-0
                                pt-0.5
                            ">
                    
                                <h3 className="
                                    text-base
                                    md:text-lg
                                    font-black
                                    text-slate-800
                                ">
                    
                                    Observaciones
                    
                                </h3>
                    
                    
                                <p className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                    leading-relaxed
                                ">
                    
                                    Información adicional opcional.
                    
                                </p>
                    
                            </div>
                    
                        </div>
                    
                    
                        <div>
                    
                            <textarea
                                value={cliente.observacion}
                                onChange={(e) =>
                                    setCliente({
                                        ...cliente,
                                        observacion: e.target.value
                                    })
                                }
                                maxLength={300}
                                rows={4}
                                placeholder="Ej: Enviado por PAKET, retiro en tienda, horario de entrega..."
                                className="
                                    w-full
                                    resize-none
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3.5
                                    text-sm
                                    leading-relaxed
                                    text-slate-800
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-pink-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-pink-100
                                "
                            />
                    
                    
                            <div className="
                                mt-2
                                flex
                                items-center
                                justify-between
                                gap-3
                            ">
                    
                                <span className="
                                    text-xs
                                    text-slate-400
                                ">
                    
                                    Opcional
                    
                                </span>
                    
                    
                                <span className="
                                    text-xs
                                    font-medium
                                    text-slate-400
                                ">
                    
                                    {cliente.observacion?.length || 0}/300
                    
                                </span>
                    
                            </div>
                    
                        </div>
                    
                    </section>


                    {/* MEDIO DE PAGO */}

                    <MedioPagoSelector
                        numero={esVentaRRSS ? 7 : 6}
                        medioPago={medioPago}
                        setMedioPago={setMedioPago}
                    />

                </div>
        
<aside className="min-w-0 self-start xl:sticky xl:top-6">
    <div className="space-y-4">

        {/* Resumen de la venta: productos, despacho y total */}
        <ResumenVenta
            subtotalProductos={subtotalProductos}
            costoEnvio={costoEnvio}
            total={total}
            esVentaRRSS={esVentaRRSS}
            envioPorPagar={envioPorPagar}
            moneda={moneda}
        />

        {/* Errores de validación y botón Registrar venta */}
        <div
            className="
                mt-6
                rounded-3xl
                border
                border-pink-100
                bg-gradient-to-br
                from-pink-50
                via-white
                to-purple-50
                p-4
                md:p-5
            "
        >
            {erroresValidacion.length > 0 && (
                <div
                    id="errores-validacion-venta"
                    className="
                        mb-4
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-4
                        text-red-700
                    "
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-red-100
                                text-lg
                            "
                        >
                            ⚠️
                        </div>

                        <div>
                            <p className="font-black text-red-800">
                                Faltan datos para registrar la venta
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                Completa los siguientes campos:
                            </p>

                            <ul className="mt-3 space-y-1 text-sm font-medium">
                                {erroresValidacion.map((campo) => (
                                    <li
                                        key={campo}
                                        className="flex items-center gap-2"
                                    >
                                        <span>•</span>
                                        <span>{campo}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                disabled={guardando}
                onClick={registrarVenta}
                aria-busy={guardando}
                className={`
                    group
                    relative
                    w-full
                    overflow-hidden
                    rounded-2xl
                    px-5
                    py-4
                    text-white
                    shadow-lg
                    transition-all
                    duration-200
                    focus:outline-none
                    focus:ring-4
                    focus:ring-pink-200
                    ${
                        guardando
                            ? `
                                cursor-not-allowed
                                bg-slate-300
                                shadow-none
                            `
                            : `
                                bg-gradient-to-r
                                from-pink-500
                                to-purple-600
                                hover:-translate-y-0.5
                                hover:shadow-xl
                                active:translate-y-0
                                active:scale-[0.99]
                            `
                    }
                `}
            >
                {!guardando && erroresValidacion.length === 0 && (
                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-r
                            from-white/0
                            via-white/15
                            to-white/0
                            opacity-0
                            transition
                            group-hover:opacity-100
                        "
                    />
                )}

                <div className="relative flex items-center justify-center gap-3">
                    <span
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-white/15
                            text-xl
                        "
                    >
                        {guardando
                            ? "⏳"
                            : erroresValidacion.length > 0
                                ? "⚠️"
                                : "💰"}
                    </span>

                    <span className="flex min-w-0 flex-col items-start text-left">
                        <span className="text-base font-black md:text-lg">
                            {guardando
                                ? "Registrando venta..."
                                : erroresValidacion.length > 0
                                    ? "Revisa los datos pendientes"
                                    : "Registrar venta"}
                        </span>

                        <span className="mt-0.5 text-xs font-medium text-white/75">
                            {guardando
                                ? "No cierres esta ventana"
                                : erroresValidacion.length > 0
                                    ? "Completa la información requerida"
                                    : "Confirmar y guardar esta venta"}
                        </span>
                    </span>

                    {!guardando && erroresValidacion.length === 0 && (
                        <span
                            className="
                                ml-auto
                                hidden
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-white/15
                                text-lg
                                sm:flex
                            "
                        >
                            →
                        </span>
                    )}
                </div>
            </button>
        </div>

        {/* Limpiar formulario: siempre después de Registrar venta */}
        <button
            type="button"
            onClick={limpiarFormulario}
            disabled={guardando}
            className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                px-5
                py-3
                font-semibold
                text-slate-600
                transition
                hover:border-slate-400
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
        >
            Limpiar formulario
        </button>

    </div>
</aside>

                    
                
                </div>
     </div>

                {/* =================================================
                    HISTORIAL
                ================================================= */}
                
                <AdminCard>
                
                    <HistorialVentas
                        ventas={ventas}
                        ventasFiltradas={ventasFiltradas}
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        filtroCanal={filtroCanal}
                        setFiltroCanal={setFiltroCanal}
                        filtroPago={filtroPago}
                        setFiltroPago={setFiltroPago}
                        actualizarHistorial={actualizarHistorial}
                        actualizando={actualizando}
                        fechaVenta={fechaVenta}
                        etiquetaCanal={etiquetaCanal}
                        etiquetaPago={etiquetaPago}
                        moneda={moneda}
                        setVentaSeleccionada={setVentaSeleccionada}
                    />
                
                </AdminCard>

                {/* =================================================
                    MODAL DETALLE
                ================================================= */}
                
                <VentaDetalleModal
                    ventaSeleccionada={ventaSeleccionada}
                    setVentaSeleccionada={setVentaSeleccionada}
                    imprimirComprobante={imprimirComprobanteUtil}
                    fechaVenta={fechaVenta}
                    etiquetaCanal={etiquetaCanal}
                    etiquetaPago={etiquetaPago}
                    moneda={moneda}
                />

                <VentaProductoModal
                    open={modalProductoAbierto}
                    onClose={() => setModalProductoAbierto(false)}
                    productos={productos}
                    onAgregar={(producto, variante, cantidadModal) => {
                        const agregado = agregarProducto(
                            producto,
                            variante,
                            cantidadModal
                        );

                        if (agregado) {
                            setModalProductoAbierto(false);
                        }

                        return agregado;
                    }}
                />

        </div>

    );
}

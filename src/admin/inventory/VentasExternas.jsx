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
                    mb-10
                ">


                {/* =================================================
                    FORMULARIO
                ================================================= */}

                <AdminCard>

                    <div className="
                        flex
                        flex-col
                        gap-3
                        mb-8
                    ">
                    
                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-4
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
                                    md:text-3xl
                                    font-black
                                    mt-1
                                    text-slate-900
                                ">
                    
                                    Registrar venta
                    
                                </h2>
                    
                            </div>
                    
                            <span className={`
                                inline-flex
                                items-center
                                rounded-full
                                px-4
                                py-2
                                text-xs
                                font-black
                                uppercase
                                tracking-wide
                                whitespace-nowrap
                    
                                ${
                                    esVentaRRSS
                                        ? `
                                            bg-emerald-50
                                            text-emerald-600
                                            border
                                            border-emerald-200
                                        `
                                        : `
                                            bg-pink-50
                                            text-pink-600
                                            border
                                            border-pink-200
                                        `
                                }
                            `}>
                    
                                {esVentaRRSS
                                    ? "Venta RRSS"
                                    : "Venta presencial"
                                }
                    
                            </span>
                    
                        </div>
                    
                        <p className="
                            text-sm
                            md:text-base
                            text-slate-500
                            max-w-2xl
                        ">
                    
                            {esVentaRRSS
                                ? "Registra una venta realizada por redes sociales con despacho."
                                : "Registra una venta realizada presencialmente en tienda."
                            }
                    
                        </p>
                    
                    </div>


                    {/* TIPO DE VENTA */}

                    <CanalVentaSelector
                        tipoVenta={tipoVenta}
                        setTipoVenta={setTipoVenta}
                    />


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
                        productos={productos}
                        productoSeleccionado={productoSeleccionado}
                        setProductoSeleccionado={setProductoSeleccionado}
                        varianteSeleccionada={varianteSeleccionada}
                        setVarianteSeleccionada={setVarianteSeleccionada}
                        variantesDisponibles={variantesDisponibles}
                        varianteActual={varianteActual}
                        cantidad={cantidad}
                        setCantidad={setCantidad}
                        agregarProducto={agregarProducto}
                        moneda={moneda}
                    />


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

                                <ItemsVenta
                                    items={items}
                                    eliminarItem={eliminarItem}
                                    moneda={moneda}
                                />

                            </div>

                        )}

                    </div>

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
                    
                                6
                    
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
                        medioPago={medioPago}
                        setMedioPago={setMedioPago}
                    />


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

                    <ResumenVenta
                        subtotalProductos={subtotalProductos}
                        costoEnvio={costoEnvio}
                        total={total}
                        esVentaRRSS={esVentaRRSS}
                        envioPorPagar={envioPorPagar}
                        moneda={moneda}
                    />

                </AdminCard>
                    
                
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

        </div>

    );

}

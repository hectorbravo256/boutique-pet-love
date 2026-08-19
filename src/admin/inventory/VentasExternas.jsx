import {
    useEffect,
    useMemo,
    useState
} from "react";

import { supabase } from "../../supabaseClient";
import AdminCard from "../components/AdminCard";

export default function VentasExternas() {

    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

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


    /* =====================================================
       CARGAR PRODUCTOS
    ===================================================== */

    useEffect(() => {

        cargarProductos();
        cargarVentas();

    }, []);


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
       CARGAR VENTAS EXTERNAS
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
                    tipo_venta,
                    medio_pago,
                    estado_pago,
                    estado,
                    total,
                    vendedor
                `)
                .in(
                    "tipo_venta",
                    [
                        "presencial",
                        "whatsapp"
                    ]
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(20);

        if (error) {

            console.error(error);

            return;

        }

        setVentas(data || []);

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
       TOTAL
    ===================================================== */

    const total =
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

        cantidad:
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
                            "Administrador"
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

            setItems([]);

            setProductoSeleccionado("");
            setVarianteSeleccionada("");
            setCantidad(1);


            /* Actualizar productos
               para reflejar nuevo stock */

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
       FORMATO MONEDA
    ===================================================== */

    const moneda = (valor) =>
        `$${Number(valor || 0).toLocaleString("es-CL")}`;


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="max-w-[1500px] mx-auto p-8">

                <AdminCard>

                    <p className="text-slate-500">
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
                    realizadas por WhatsApp.
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


            <div className="
                grid
                xl:grid-cols-[1.3fr_0.7fr]
                gap-6
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
                                        "whatsapp"
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
                                        "whatsapp"
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
                                💬 WhatsApp
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
                            value={cliente.nombre}
                            onChange={e =>
                                setCliente({
                                    ...cliente,
                                    nombre:
                                        e.target.value
                                })
                            }
                            placeholder="Nombre del cliente"
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
                            value={cliente.rut}
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
                            value={cliente.correo}
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
                            value={cliente.telefono}
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
                                                            item.price *
                                                            item.quantity
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
                            value={medioPago}
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
                                💳 Débito
                            </option>

                            <option value="credito">
                                💳 Crédito
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

                <div className="space-y-6">


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

                        <div className="
                            flex
                            justify-between
                            items-center
                            mb-4
                        ">

                            <h2 className="
                                text-xl
                                font-black
                            ">
                                Últimas ventas
                            </h2>

                        </div>


                        <div className="
                            space-y-3
                        ">

                            {ventas.length === 0 ? (

                                <p className="
                                    text-slate-400
                                ">
                                    No hay ventas externas.
                                </p>

                            ) : (

                                ventas.map(
                                    venta => (

                                        <div
                                            key={
                                                venta.id
                                            }
                                            className="
                                                border-b
                                                border-slate-100
                                                pb-3
                                            "
                                        >

                                            <div className="
                                                flex
                                                justify-between
                                            ">

                                                <div>

                                                    <strong>
                                                        Venta #
                                                        {
                                                            venta.numero_venta
                                                        }
                                                    </strong>

                                                    <div className="
                                                        text-sm
                                                        text-slate-500
                                                    ">
                                                        {
                                                            venta.nombre
                                                        }
                                                    </div>

                                                </div>


                                                <div className="
                                                    text-right
                                                ">

                                                    <strong>
                                                        {
                                                            moneda(
                                                                venta.total
                                                            )
                                                        }
                                                    </strong>

                                                    <div className="
                                                        text-xs
                                                        text-slate-400
                                                    ">
                                                        {
                                                            venta.tipo_venta ===
                                                            "whatsapp"
                                                                ? "💬 WhatsApp"
                                                                : "🏪 Presencial"
                                                        }
                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </AdminCard>

                </div>

            </div>

        </div>

    );

}

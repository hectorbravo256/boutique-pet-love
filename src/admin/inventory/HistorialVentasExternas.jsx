import { useEffect, useMemo, useState } from "react";
import {
    Eye,
    History,
    RefreshCw,
    Search,
    Store,
    MessageCircle,
    CreditCard,
    Package,
    X,
} from "lucide-react";
import { supabase } from "../../supabaseClient";

function formatSaleNumber(number) {
    if (number === null || number === undefined) {
        return "-";
    }

    return `VEN-${String(number).padStart(6, "0")}`;
}

function formatDate(date) {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatDateTime(date) {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(value) {
    const number = Number(value || 0);

    return number.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    });
}

function getSaleTypeLabel(type) {
    if (type === "whatsapp") {
        return "WhatsApp";
    }

    if (type === "presencial") {
        return "Presencial";
    }

    return type || "-";
}

function getPaymentLabel(payment) {
    switch (payment) {
        case "transferencia":
            return "Transferencia";

        case "efectivo":
            return "Efectivo";

        case "tarjeta":
            return "Tarjeta";

        case "mercado_pago":
            return "Mercado Pago";

        default:
            return payment || "-";
    }
}

function getSaleItems(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items;
}

export default function HistorialVentasExternas() {

    const [sales, setSales] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [channelFilter, setChannelFilter] = useState("todos");
    const [paymentFilter, setPaymentFilter] = useState("todos");

    const [selectedSale, setSelectedSale] = useState(null);

    // -------------------------------------------------
    // Cargar ventas externas
    // -------------------------------------------------

    async function loadSales() {

        try {

            setLoading(true);
            setError("");

            const {
                data,
                error: salesError,
            } = await supabase
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
                .in("tipo_venta", [
                    "presencial",
                    "whatsapp",
                ])
                .order("numero_venta", {
                    ascending: false,
                });

            if (salesError) {
                throw salesError;
            }

            setSales(data || []);

        } catch (err) {

            console.error(
                "Error cargando historial de ventas externas:",
                err
            );

            setError(
                err?.message ||
                "No fue posible cargar el historial de ventas."
            );

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadSales();

    }, []);

    // -------------------------------------------------
    // Filtrar ventas
    // -------------------------------------------------

    const filteredSales = useMemo(() => {

        const text = search
            .trim()
            .toLowerCase();

        return sales.filter((sale) => {

            const matchesSearch =
                !text ||
                String(sale.numero_venta || "")
                    .toLowerCase()
                    .includes(text) ||
                String(sale.nombre || "")
                    .toLowerCase()
                    .includes(text) ||
                String(sale.rut || "")
                    .toLowerCase()
                    .includes(text) ||
                String(sale.correo || "")
                    .toLowerCase()
                    .includes(text) ||
                String(sale.telefono || "")
                    .toLowerCase()
                    .includes(text);

            const matchesChannel =
                channelFilter === "todos" ||
                sale.tipo_venta === channelFilter;

            const matchesPayment =
                paymentFilter === "todos" ||
                sale.medio_pago === paymentFilter;

            return (
                matchesSearch &&
                matchesChannel &&
                matchesPayment
            );

        });

    }, [
        sales,
        search,
        channelFilter,
        paymentFilter,
    ]);

    // -------------------------------------------------
    // Estadísticas
    // -------------------------------------------------

    const statistics = useMemo(() => {

        const total = sales.reduce(
            (sum, sale) =>
                sum + Number(sale.total || 0),
            0
        );

        const presencial = sales.filter(
            (sale) =>
                sale.tipo_venta === "presencial"
        );

        const whatsapp = sales.filter(
            (sale) =>
                sale.tipo_venta === "whatsapp"
        );

        const totalPresencial = presencial.reduce(
            (sum, sale) =>
                sum + Number(sale.total || 0),
            0
        );

        const totalWhatsapp = whatsapp.reduce(
            (sum, sale) =>
                sum + Number(sale.total || 0),
            0
        );

        return {
            totalSales: sales.length,
            total,
            presencial: presencial.length,
            whatsapp: whatsapp.length,
            totalPresencial,
            totalWhatsapp,
        };

    }, [sales]);

    return (

        <div className="space-y-6">

            {/* ================================================= */}
            {/* ENCABEZADO */}
            {/* ================================================= */}

            <section className="
                overflow-hidden
                rounded-[28px]
                bg-gradient-to-r
                from-pink-500
                to-purple-600
                px-7
                py-7
                text-white
                shadow-xl
            ">

                <div className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                ">

                    <div>

                        <div className="
                            mb-2
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.35em]
                            text-white/80
                        ">

                            Boutique Pet Love ERP

                        </div>

                        <div className="
                            flex
                            items-center
                            gap-4
                        ">

                            <History
                                size={48}
                                strokeWidth={2.2}
                            />

                            <h1 className="
                                text-4xl
                                font-black
                                tracking-tight
                            ">

                                Historial de ventas externas

                            </h1>

                        </div>

                        <p className="
                            mt-3
                            text-base
                            font-medium
                            text-white/90
                        ">

                            Consulta y controla todas las ventas
                            realizadas presencialmente y por WhatsApp.

                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={loadSales}
                        disabled={loading}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-white
                            px-5
                            py-3
                            font-bold
                            text-purple-600
                            shadow-lg
                            transition
                            hover:bg-white/90
                            disabled:opacity-60
                        "
                    >

                        <RefreshCw
                            size={18}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Actualizar

                    </button>

                </div>

            </section>


            {/* ================================================= */}
            {/* ESTADÍSTICAS */}
            {/* ================================================= */}

            <section className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
            ">

                {/* TOTAL */}

                <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-wider
                                text-slate-400
                            ">

                                Ventas externas

                            </p>

                            <p className="
                                mt-2
                                text-3xl
                                font-black
                                text-slate-900
                            ">

                                {statistics.totalSales}

                            </p>

                        </div>

                        <div className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-pink-100
                            text-pink-600
                        ">

                            <Package size={23} />

                        </div>

                    </div>

                </div>


                {/* TOTAL VENDIDO */}

                <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-wider
                                text-slate-400
                            ">

                                Total vendido

                            </p>

                            <p className="
                                mt-2
                                text-2xl
                                font-black
                                text-slate-900
                            ">

                                {formatCurrency(
                                    statistics.total
                                )}

                            </p>

                        </div>

                        <div className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-100
                            text-green-600
                        ">

                            <CreditCard size={23} />

                        </div>

                    </div>

                </div>


                {/* PRESENCIAL */}

                <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-wider
                                text-slate-400
                            ">

                                Presenciales

                            </p>

                            <p className="
                                mt-2
                                text-3xl
                                font-black
                                text-slate-900
                            ">

                                {statistics.presencial}

                            </p>

                            <p className="
                                mt-1
                                text-xs
                                font-semibold
                                text-slate-400
                            ">

                                {formatCurrency(
                                    statistics.totalPresencial
                                )}

                            </p>

                        </div>

                        <div className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-100
                            text-blue-600
                        ">

                            <Store size={23} />

                        </div>

                    </div>

                </div>


                {/* WHATSAPP */}

                <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-wider
                                text-slate-400
                            ">

                                WhatsApp

                            </p>

                            <p className="
                                mt-2
                                text-3xl
                                font-black
                                text-slate-900
                            ">

                                {statistics.whatsapp}

                            </p>

                            <p className="
                                mt-1
                                text-xs
                                font-semibold
                                text-slate-400
                            ">

                                {formatCurrency(
                                    statistics.totalWhatsapp
                                )}

                            </p>

                        </div>

                        <div className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-100
                            text-green-600
                        ">

                            <MessageCircle size={23} />

                        </div>

                    </div>

                </div>

            </section>


            {/* ================================================= */}
            {/* FILTROS */}
            {/* ================================================= */}

            <section className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
            ">

                <div className="
                    grid
                    grid-cols-1
                    gap-4
                    lg:grid-cols-[1fr_auto_auto]
                ">

                    {/* BUSCAR */}

                    <div className="relative">

                        <Search
                            size={18}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="
                                Buscar por cliente, RUT,
                                correo o número de venta...
                            "
                            className="
                                h-12
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                pl-11
                                pr-4
                                text-sm
                                outline-none
                                transition
                                focus:border-pink-400
                                focus:ring-4
                                focus:ring-pink-100
                            "
                        />

                    </div>


                    {/* CANAL */}

                    <select
                        value={channelFilter}
                        onChange={(event) =>
                            setChannelFilter(
                                event.target.value
                            )
                        }
                        className="
                            h-12
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-sm
                            font-semibold
                            text-slate-700
                            outline-none
                            focus:border-pink-400
                        "
                    >

                        <option value="todos">
                            Todos los canales
                        </option>

                        <option value="presencial">
                            🏪 Presencial
                        </option>

                        <option value="whatsapp">
                            💬 WhatsApp
                        </option>

                    </select>


                    {/* MEDIO DE PAGO */}

                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(
                                event.target.value
                            )
                        }
                        className="
                            h-12
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-sm
                            font-semibold
                            text-slate-700
                            outline-none
                            focus:border-pink-400
                        "
                    >

                        <option value="todos">
                            Todos los pagos
                        </option>

                        <option value="transferencia">
                            🏦 Transferencia
                        </option>

                        <option value="efectivo">
                            💵 Efectivo
                        </option>

                        <option value="tarjeta">
                            💳 Tarjeta
                        </option>

                        <option value="mercado_pago">
                            🟢 Mercado Pago
                        </option>

                    </select>

                </div>

            </section>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

                <div className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-5
                    py-4
                    text-sm
                    font-semibold
                    text-red-700
                ">

                    ⚠️ {error}

                </div>

            )}


            {/* ================================================= */}
            {/* TABLA */}
            {/* ================================================= */}

            <section className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
            ">

                {loading ? (

                    <div className="
                        flex
                        min-h-[300px]
                        items-center
                        justify-center
                        text-slate-500
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                            font-semibold
                        ">

                            <RefreshCw
                                size={22}
                                className="animate-spin"
                            />

                            Cargando historial...

                        </div>

                    </div>

                ) : filteredSales.length === 0 ? (

                    <div className="
                        flex
                        min-h-[300px]
                        flex-col
                        items-center
                        justify-center
                        text-center
                    ">

                        <History
                            size={42}
                            className="
                                mb-4
                                text-slate-300
                            "
                        />

                        <p className="
                            text-lg
                            font-black
                            text-slate-700
                        ">

                            No hay ventas para mostrar

                        </p>

                        <p className="
                            mt-1
                            text-sm
                            text-slate-400
                        ">

                            Prueba cambiando los filtros
                            de búsqueda.

                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            min-w-[1100px]
                        ">

                            <thead>

                                <tr className="
                                    border-b
                                    border-slate-200
                                    bg-slate-50
                                ">

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Detalle

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Venta

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Fecha

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Cliente

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Canal

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Medio de pago

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Estado

                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-right
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">

                                        Total

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredSales.map(
                                    (sale) => {

                                        const isWhatsapp =
                                            sale.tipo_venta ===
                                            "whatsapp";

                                        return (

                                            <tr
                                                key={sale.id}
                                                className="
                                                    border-b
                                                    border-slate-100
                                                    transition
                                                    hover:bg-pink-50/30
                                                "
                                            >

                                                {/* DETALLE */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedSale(
                                                                sale
                                                            )
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-lg
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            px-3
                                                            py-2
                                                            text-xs
                                                            font-bold
                                                            text-slate-600
                                                            shadow-sm
                                                            transition
                                                            hover:border-pink-300
                                                            hover:bg-pink-50
                                                            hover:text-pink-600
                                                        "
                                                    >

                                                        <Eye
                                                            size={15}
                                                        />

                                                        Ver

                                                    </button>

                                                </td>


                                                {/* VENTA */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        font-black
                                                        text-pink-600
                                                    ">

                                                        {formatSaleNumber(
                                                            sale.numero_venta
                                                        )}

                                                    </span>

                                                </td>


                                                {/* FECHA */}

                                                <td className="
                                                    whitespace-nowrap
                                                    px-5
                                                    py-4
                                                    text-sm
                                                    font-medium
                                                    text-slate-600
                                                ">

                                                    {formatDate(
                                                        sale.created_at
                                                    )}

                                                </td>


                                                {/* CLIENTE */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <div>

                                                        <div className="
                                                            font-bold
                                                            text-slate-800
                                                        ">

                                                            {
                                                                sale.nombre ||
                                                                "Sin nombre"
                                                            }

                                                        </div>

                                                        {sale.rut && (

                                                            <div className="
                                                                mt-1
                                                                text-xs
                                                                text-slate-400
                                                            ">

                                                                RUT:{" "}
                                                                {sale.rut}

                                                            </div>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* CANAL */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className={`
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-full
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-black
                                                        ${
                                                            isWhatsapp
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

                                                        {isWhatsapp ? (
                                                            <MessageCircle
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <Store
                                                                size={14}
                                                            />
                                                        )}

                                                        {getSaleTypeLabel(
                                                            sale.tipo_venta
                                                        )}

                                                    </span>

                                                </td>


                                                {/* MEDIO PAGO */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        text-sm
                                                        font-semibold
                                                        text-slate-600
                                                    ">

                                                        {getPaymentLabel(
                                                            sale.medio_pago
                                                        )}

                                                    </span>

                                                </td>


                                                {/* ESTADO */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <div className="
                                                        flex
                                                        flex-col
                                                        gap-1
                                                    ">

                                                        <span className="
                                                            inline-flex
                                                            w-fit
                                                            rounded-full
                                                            bg-green-100
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-black
                                                            text-green-700
                                                        ">

                                                            {sale.estado_pago ===
                                                            "pagado"
                                                                ? "Pagado"
                                                                : sale.estado_pago ||
                                                                  "Pendiente"}

                                                        </span>

                                                        <span className="
                                                            text-xs
                                                            font-medium
                                                            text-slate-400
                                                        ">

                                                            {sale.estado ||
                                                                "-"}

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* TOTAL */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                    text-right
                                                ">

                                                    <span className="
                                                        whitespace-nowrap
                                                        text-base
                                                        font-black
                                                        text-slate-900
                                                    ">

                                                        {formatCurrency(
                                                            sale.total
                                                        )}

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* ================================================= */}
            {/* PIE */}
            {/* ================================================= */}

            {!loading &&
                filteredSales.length > 0 && (

                    <div className="
                        flex
                        flex-col
                        gap-2
                        text-sm
                        text-slate-500
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    ">

                        <span>

                            Mostrando{" "}
                            <strong className="text-slate-700">
                                {filteredSales.length}
                            </strong>{" "}
                            de{" "}
                            <strong className="text-slate-700">
                                {sales.length}
                            </strong>{" "}
                            ventas externas

                        </span>

                        <span>

                            Total filtrado:{" "}
                            <strong className="text-slate-800">

                                {formatCurrency(
                                    filteredSales.reduce(
                                        (sum, sale) =>
                                            sum +
                                            Number(
                                                sale.total || 0
                                            ),
                                        0
                                    )
                                )}

                            </strong>

                        </span>

                    </div>

                )}


            {/* ================================================= */}
            {/* MODAL DETALLE */}
            {/* ================================================= */}

            {selectedSale && (

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

                    <div
                        className="
                            max-h-[90vh]
                            w-full
                            max-w-3xl
                            overflow-y-auto
                            rounded-3xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        {/* CABECERA MODAL */}

                        <div className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-slate-200
                            px-6
                            py-5
                        ">

                            <div>

                                <p className="
                                    text-xs
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-pink-500
                                ">

                                    Detalle de venta

                                </p>

                                <h2 className="
                                    mt-1
                                    text-2xl
                                    font-black
                                    text-slate-900
                                ">

                                    {formatSaleNumber(
                                        selectedSale.numero_venta
                                    )}

                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedSale(null)
                                }
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-500
                                    transition
                                    hover:bg-red-50
                                    hover:text-red-500
                                "
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* INFORMACIÓN */}

                        <div className="p-6">

                            <div className="
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-2
                            ">

                                <div className="
                                    rounded-xl
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

                                        {selectedSale.nombre ||
                                            "Sin nombre"}

                                    </p>

                                </div>

                                <div className="
                                    rounded-xl
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

                                        {formatDateTime(
                                            selectedSale.created_at
                                        )}

                                    </p>

                                </div>

                                <div className="
                                    rounded-xl
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

                                        {getSaleTypeLabel(
                                            selectedSale.tipo_venta
                                        )}

                                    </p>

                                </div>

                                <div className="
                                    rounded-xl
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

                                        {getPaymentLabel(
                                            selectedSale.medio_pago
                                        )}

                                    </p>

                                </div>

                            </div>


                            {/* DATOS CLIENTE */}

                            {(selectedSale.rut ||
                                selectedSale.correo ||
                                selectedSale.telefono) && (

                                <div className="
                                    mt-5
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-5
                                ">

                                    <h3 className="
                                        text-lg
                                        font-black
                                        text-slate-900
                                    ">

                                        Datos del cliente

                                    </h3>

                                    <div className="
                                        mt-4
                                        grid
                                        grid-cols-1
                                        gap-3
                                        sm:grid-cols-3
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

                                                {selectedSale.rut ||
                                                    "-"}

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
                                                break-all
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                            ">

                                                {selectedSale.correo ||
                                                    "-"}

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

                                                {selectedSale.telefono ||
                                                    "-"}

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* PRODUCTOS */}

                            <div className="
                                mt-5
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                            ">

                                <div className="
                                    border-b
                                    border-slate-200
                                    bg-slate-50
                                    px-5
                                    py-4
                                ">

                                    <h3 className="
                                        font-black
                                        text-slate-900
                                    ">

                                        Productos vendidos

                                    </h3>

                                </div>

                                <div>

                                    {getSaleItems(
                                        selectedSale.items
                                    ).length === 0 ? (

                                        <div className="
                                            p-6
                                            text-center
                                            text-sm
                                            text-slate-400
                                        ">

                                            No hay productos registrados.

                                        </div>

                                    ) : (

                                        getSaleItems(
                                            selectedSale.items
                                        ).map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-4
                                                        border-b
                                                        border-slate-100
                                                        px-5
                                                        py-4
                                                        last:border-b-0
                                                    "
                                                >

                                                    <div>

                                                        <p className="
                                                            font-bold
                                                            text-slate-800
                                                        ">

                                                            {item.product_name ||
                                                                item.nombre ||
                                                                item.producto ||
                                                                "Producto"}

                                                        </p>

                                                        <div className="
                                                            mt-1
                                                            flex
                                                            flex-wrap
                                                            gap-3
                                                            text-xs
                                                            text-slate-400
                                                        ">

                                                            {item.size && (
                                                                <span>
                                                                    Talla:{" "}
                                                                    {item.size}
                                                                </span>
                                                            )}

                                                            {item.talla && (
                                                                <span>
                                                                    Talla:{" "}
                                                                    {item.talla}
                                                                </span>
                                                            )}

                                                            <span>
                                                                Cantidad:{" "}
                                                                {Number(
                                                                    item.quantity ??
                                                                    item.cantidad ??
                                                                    0
                                                                )}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div className="
                                                        whitespace-nowrap
                                                        font-black
                                                        text-slate-900
                                                    ">

                                                        {formatCurrency(
                                                            Number(
                                                                item.price ??
                                                                item.precio ??
                                                                0
                                                            ) *
                                                            Number(
                                                                item.quantity ??
                                                                item.cantidad ??
                                                                0
                                                            )
                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>


                            {/* OBSERVACIÓN */}

                            {selectedSale.observacion && (

                                <div className="
                                    mt-5
                                    rounded-2xl
                                    bg-slate-50
                                    p-5
                                ">

                                    <p className="
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wider
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

                                        {selectedSale.observacion}

                                    </p>

                                </div>

                            )}


                            {/* TOTAL */}

                            <div className="
                                mt-5
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                bg-slate-900
                                px-5
                                py-4
                                text-white
                            ">

                                <span className="
                                    font-bold
                                    text-white/70
                                ">

                                    Total venta

                                </span>

                                <span className="
                                    text-2xl
                                    font-black
                                ">

                                    {formatCurrency(
                                        selectedSale.total
                                    )}

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

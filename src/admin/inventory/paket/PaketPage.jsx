import { useCallback, useEffect, useMemo, useState } from "react";
import PaketService from "../../shared/services/PaketService";

const FORMATO_MONEDA = (valor) =>
    Number(valor || 0).toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    });

const FORMATO_FECHA = (valor) => {
    if (!valor) return "—";

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return "—";
    }

    return fecha.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
};

const ESTADO_REEMBOLSO = {
    pending: {
        label: "Pendiente",
        className:
            "bg-amber-100 text-amber-700 border border-amber-200",
    },

    reimbursed: {
        label: "Reembolsado",
        className:
            "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
};

function StatCard({
    icon,
    title,
    value,
    description,
}) {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>

                    <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                        {value}
                    </p>

                    {description && (
                        <p className="text-xs text-slate-400 mt-2">
                            {description}
                        </p>
                    )}
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ReembolsoModal({
    expenses,
    onClose,
    onSuccess,
}) {
    const [paymentMethod, setPaymentMethod] =
        useState("transferencia");

    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [result, setResult] = useState(null);

    const esMasivo = expenses.length > 1;

    const montoTotal = expenses.reduce(
        (total, expense) =>
            total + Number(expense?.amount || 0),
        0
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!expenses.length) {
            setError(
                "No se encontraron gastos PAKET seleccionados."
            );
            return;
        }

        if (
            !paymentMethod ||
            !String(paymentMethod).trim()
        ) {
            setError(
                "Debes seleccionar un medio de pago."
            );
            return;
        }

        setSaving(true);
        setError("");
        setResult(null);

try {
    let respuesta;

    // =====================================================
    // REEMBOLSO MASIVO
    // =====================================================

    if (esMasivo) {
        respuesta =
            await PaketService.marcarReembolsosMasivos({
                ids: expenses.map(
                    (expense) => expense.id
                ),
                paymentMethod,
                notes,
            });

        // Si todos fueron procesados correctamente
        if (respuesta.completado) {
            await onSuccess();

            onClose();
            return;
        }

        // Hubo errores parciales
        await onSuccess();

        setResult({
            exitosos: respuesta.exitosos,
            fallidos: respuesta.fallidos,
        });

        if (respuesta.errores?.length > 0) {
            setError(
                respuesta.errores[0]?.error ||
                    "Algunos reembolsos no pudieron registrarse."
            );
        } else {
            setError(
                "Algunos reembolsos no pudieron registrarse."
            );
        }

        return;
    }

    // =====================================================
    // REEMBOLSO INDIVIDUAL
    // =====================================================

    respuesta =
        await PaketService.marcarReembolso({
            id: expenses[0].id,
            paymentMethod,
            notes,
        });

    await onSuccess();

    onClose();

} catch (err) {

            console.error(
                "Error registrando reembolso PAKET:",
                err
            );

            setError(
                err?.message ||
                    "No fue posible registrar el reembolso."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    if (!saving) {
                        onClose();
                    }
                }
            }}
        >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            PAKET
                        </p>

                        <h2 className="text-xl font-black text-slate-900 mt-1">
                            {esMasivo
                                ? "Reembolsar seleccionados"
                                : "Registrar reembolso"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >
                    {/* RESUMEN */}
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-slate-500">
                                    {esMasivo
                                        ? "Gastos seleccionados"
                                        : "Venta"}
                                </p>

                                <p className="font-black text-slate-900 text-lg">
                                    {esMasivo
                                        ? `${expenses.length} ${
                                              expenses.length === 1
                                                  ? "gasto"
                                                  : "gastos"
                                          }`
                                        : expenses[0]?.order
                                                ?.numero_venta
                                          ? `#${expenses[0].order.numero_venta}`
                                          : "Sin número"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-500">
                                    {esMasivo
                                        ? "Monto total"
                                        : "Monto PAKET"}
                                </p>

                                <p className="text-lg font-black text-slate-900">
                                    {FORMATO_MONEDA(
                                        montoTotal
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* LISTA DE VENTAS */}
                        <div className="mt-4">
                            {esMasivo ? (
                                <div className="flex flex-wrap gap-2">
                                    {expenses.map(
                                        (expense) => (
                                            <span
                                                key={
                                                    expense.id
                                                }
                                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700"
                                            >
                                                {expense.order
                                                    ?.numero_venta
                                                    ? `#${expense.order.numero_venta}`
                                                    : "Sin número"}
                                            </span>
                                        )
                                    )}
                                </div>
                            ) : (
                                expenses[0]?.order
                                    ?.nombre && (
                                    <p className="text-sm text-slate-500">
                                        Cliente:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {
                                                expenses[0]
                                                    .order
                                                    .nombre
                                            }
                                        </span>
                                    </p>
                                )
                            )}
                        </div>
                    </div>

                    {/* MEDIO DE PAGO */}
                    <div>
                        <label
                            htmlFor="paket-payment-method"
                            className="block text-sm font-bold text-slate-700 mb-2"
                        >
                            Medio de pago
                        </label>

                        <select
                            id="paket-payment-method"
                            value={paymentMethod}
                            onChange={(event) =>
                                setPaymentMethod(
                                    event.target.value
                                )
                            }
                            disabled={saving}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="transferencia">
                                Transferencia
                            </option>

                            <option value="efectivo">
                                Efectivo
                            </option>

                            <option value="tarjeta">
                                Tarjeta
                            </option>

                            <option value="otro">
                                Otro
                            </option>
                        </select>
                    </div>

                    {/* OBSERVACIÓN */}
                    <div>
                        <label
                            htmlFor="paket-notes"
                            className="block text-sm font-bold text-slate-700 mb-2"
                        >
                            Observación
                        </label>

                        <textarea
                            id="paket-notes"
                            value={notes}
                            onChange={(event) =>
                                setNotes(
                                    event.target.value
                                )
                            }
                            disabled={saving}
                            rows={3}
                            maxLength={500}
                            placeholder="Ej.: Reembolso PAKET realizado desde cuenta Boutique Pet Love."
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <p className="text-xs text-slate-400 mt-1 text-right">
                            {notes.length}/500
                        </p>
                    </div>

                    {/* RESULTADO PARCIAL */}
                    {result && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                            <p className="font-bold">
                                Proceso parcialmente completado
                            </p>

                            <p className="mt-1">
                                {result.exitosos} reembolso
                                {result.exitosos === 1
                                    ? ""
                                    : "s"} realizado
                                {result.exitosos === 1
                                    ? ""
                                    : "s"} y{" "}
                                {result.fallidos} con error.
                            </p>
                        </div>
                    )}

                    {/* ERROR */}
                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving
                                ? "Procesando..."
                                : esMasivo
                                  ? `Confirmar ${expenses.length} reembolso${
                                        expenses.length === 1
                                            ? ""
                                            : "s"
                                    }`
                                  : "Confirmar reembolso"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PaketPage() {
    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] = useState("");

    const [filter, setFilter] = useState("all");

    const [search, setSearch] = useState("");

    const [selectedExpenses, setSelectedExpenses] =
        useState([]);

    const [selectedExpense, setSelectedExpense] =
        useState(null);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [itemsPerPage, setItemsPerPage] =
        useState(10);

    const cargarGastos = useCallback(
        async ({ initial = false } = {}) => {
            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            try {
                const data =
                    await PaketService.getExpenses();

                const ordenados = [...data].sort(
                    (a, b) => {
                        const ventaA = Number(
                            a.order?.numero_venta || 0
                        );

                        const ventaB = Number(
                            b.order?.numero_venta || 0
                        );

                        return ventaB - ventaA;
                    }
                );

                setExpenses(ordenados);
            } catch (err) {
                console.error(
                    "Error cargando gastos PAKET:",
                    err
                );

                setError(
                    err?.message ||
                        "No fue posible cargar los gastos PAKET."
                );

                if (initial) {
                    setExpenses([]);
                }
            } finally {
                if (initial) {
                    setLoading(false);
                } else {
                    setRefreshing(false);
                }
            }
        },
        []
    );

    useEffect(() => {
        cargarGastos({
            initial: true,
        });
    }, [cargarGastos]);

    const resumen = useMemo(
        () =>
            PaketService.calcularResumen(
                expenses
            ),
        [expenses]
    );

    /*
     * FILTROS
     */
    const expensesFiltrados = useMemo(() => {
        let resultado = [...expenses];

        if (filter === "pending") {
            resultado = resultado.filter(
                (expense) =>
                    expense.reimbursement_status ===
                    "pending"
            );
        }

        if (filter === "reimbursed") {
            resultado = resultado.filter(
                (expense) =>
                    expense.reimbursement_status ===
                    "reimbursed"
            );
        }

        const termino = search
            .trim()
            .toLowerCase();

        if (termino) {
            resultado = resultado.filter(
                (expense) => {
                    const numeroVenta = String(
                        expense.order
                            ?.numero_venta || ""
                    ).toLowerCase();

                    const cliente = String(
                        expense.order?.nombre || ""
                    ).toLowerCase();

                    return (
                        numeroVenta.includes(
                            termino
                        ) ||
                        cliente.includes(termino)
                    );
                }
            );
        }

        return resultado;
    }, [expenses, filter, search]);

    /*
     * PAGINACIÓN
     */
    const totalPaginas = Math.max(
        1,
        Math.ceil(
            expensesFiltrados.length /
                itemsPerPage
        )
    );

    const paginaActual = Math.min(
        currentPage,
        totalPaginas
    );

    const inicio =
        (paginaActual - 1) * itemsPerPage;

    const fin = inicio + itemsPerPage;

    const expensesPagina =
        expensesFiltrados.slice(inicio, fin);

    /*
     * PENDIENTES VISIBLES
     */
    const pendientesPagina =
        expensesPagina.filter(
            (expense) =>
                expense.reimbursement_status ===
                "pending"
        );

    /*
     * SELECCIONADOS ACTUALES
     */
    const seleccionados = expenses.filter(
        (expense) =>
            selectedExpenses.includes(
                expense.id
            ) &&
            expense.reimbursement_status ===
                "pending"
    );

    const montoSeleccionado =
        seleccionados.reduce(
            (total, expense) =>
                total +
                Number(expense.amount || 0),
            0
        );

    const todosPendientesSeleccionados =
        pendientesPagina.length > 0 &&
        pendientesPagina.every((expense) =>
            selectedExpenses.includes(
                expense.id
            )
        );

    /*
     * CAMBIAR PÁGINA
     */
    const cambiarPagina = (pagina) => {
        const paginaSegura = Math.max(
            1,
            Math.min(pagina, totalPaginas)
        );

        setCurrentPage(paginaSegura);
    };

    /*
     * CAMBIAR FILTRO
     */
    const cambiarFiltro = (nuevoFiltro) => {
        setFilter(nuevoFiltro);
        setCurrentPage(1);
        setSelectedExpenses([]);
    };

    /*
     * BUSCAR
     */
    const cambiarBusqueda = (valor) => {
        setSearch(valor);
        setCurrentPage(1);
        setSelectedExpenses([]);
    };

    /*
     * CAMBIAR CANTIDAD POR PÁGINA
     */
    const cambiarItemsPorPagina = (valor) => {
        setItemsPerPage(Number(valor));
        setCurrentPage(1);
        setSelectedExpenses([]);
    };

    /*
     * SELECCIÓN INDIVIDUAL
     */
    const toggleExpenseSelection = (expense) => {
        if (
            expense.reimbursement_status !==
            "pending"
        ) {
            return;
        }

        setSelectedExpenses((actual) => {
            if (
                actual.includes(expense.id)
            ) {
                return actual.filter(
                    (id) =>
                        id !== expense.id
                );
            }

            return [
                ...actual,
                expense.id,
            ];
        });
    };

    /*
     * SELECCIONAR TODOS LOS PENDIENTES
     * DE LA PÁGINA ACTUAL
     */
    const toggleSeleccionarTodos = () => {
        if (
            todosPendientesSeleccionados
        ) {
            setSelectedExpenses(
                (actual) =>
                    actual.filter(
                        (id) =>
                            !pendientesPagina.some(
                                (expense) =>
                                    expense.id ===
                                    id
                            )
                    )
            );

            return;
        }

        setSelectedExpenses((actual) => {
            const idsNuevos =
                pendientesPagina
                    .map(
                        (expense) =>
                            expense.id
                    )
                    .filter(
                        (id) =>
                            !actual.includes(
                                id
                            )
                    );

            return [
                ...actual,
                ...idsNuevos,
            ];
        });
    };

    /*
     * LIMPIAR SELECCIÓN
     */
    const limpiarSeleccion = () => {
        setSelectedExpenses([]);
    };

    /*
     * ABRIR REEMBOLSO MASIVO
     */
    const abrirReembolsoMasivo = () => {
        if (!seleccionados.length) {
            return;
        }

        setSelectedExpense({
            multiple: true,
            expenses: seleccionados,
        });
    };

    /*
     * ÉXITO DEL REEMBOLSO
     */
    const handleReembolsoSuccess =
        async () => {
            setSelectedExpenses([]);

            await cargarGastos();
        };

    /*
     * PÁGINAS A MOSTRAR
     */
    const paginas = [];

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        paginas.push(pagina);
    }

    return (
        <div className="max-w-[1500px] mx-auto p-6 md:p-8">
            {/* =====================================================
                ENCABEZADO
            ====================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg">
                            📦
                        </div>

                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                                Logística
                            </p>

                            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                                Gestión PAKET
                            </h1>
                        </div>
                    </div>

                    <p className="text-slate-500 mt-3 max-w-2xl">
                        Control de despachos PAKET,
                        costos y reembolsos pagados
                        inicialmente por la empresa.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        cargarGastos()
                    }
                    disabled={
                        loading ||
                        refreshing
                    }
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
                >
                    <span
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    >
                        ↻
                    </span>

                    {refreshing
                        ? "Actualizando..."
                        : "Actualizar"}
                </button>
            </div>

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">
                            ⚠️
                        </span>

                        <div>
                            <p className="font-bold text-red-800">
                                No fue posible cargar PAKET
                            </p>

                            <p className="text-sm text-red-700 mt-1">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    cargarGastos({
                                        initial: true,
                                    })
                                }
                                className="mt-3 text-sm font-bold text-red-800 underline"
                            >
                                Intentar nuevamente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                KPIs
            ====================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <StatCard
                    icon="🚚"
                    title="Despachos PAKET"
                    value={
                        resumen.totalDespachos
                    }
                    description="Registros de gastos PAKET"
                />

                <StatCard
                    icon="💰"
                    title="Costo total"
                    value={FORMATO_MONEDA(
                        resumen.costoTotal
                    )}
                    description="Total pagado a PAKET"
                />

                <StatCard
                    icon="⏳"
                    title="Pendiente de reembolso"
                    value={FORMATO_MONEDA(
                        resumen.pendienteReembolso
                    )}
                    description="Pagos pendientes de recuperar"
                />

                <StatCard
                    icon="✅"
                    title="Reembolsado"
                    value={FORMATO_MONEDA(
                        resumen.reembolsado
                    )}
                    description="Monto ya recuperado"
                />
            </div>

            {/* =====================================================
                INFORMACIÓN FINANCIERA
            ====================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            💳
                        </div>

                        <div>
                            <h2 className="font-black text-slate-900">
                                Recuperación de fondos
                            </h2>

                            <p className="text-sm text-slate-500">
                                Estado de los pagos realizados
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">
                            Pendiente
                        </span>

                        <span className="font-black text-amber-600">
                            {FORMATO_MONEDA(
                                resumen.pendienteReembolso
                            )}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-sm text-slate-600">
                            Reembolsado
                        </span>

                        <span className="font-black text-emerald-600">
                            {FORMATO_MONEDA(
                                resumen.reembolsado
                            )}
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                            📊
                        </div>

                        <div>
                            <h2 className="font-black text-slate-900">
                                Distribución del costo
                            </h2>

                            <p className="text-sm text-slate-500">
                                Según el cobro de envío al cliente
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">
                            Envíos absorbidos
                        </span>

                        <span className="font-black text-pink-600">
                            {FORMATO_MONEDA(
                                resumen.absorbido
                            )}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-sm text-slate-600">
                            Envíos cobrados a clientes
                        </span>

                        <span className="font-black text-sky-600">
                            {FORMATO_MONEDA(
                                resumen.cobradoClientes
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* =====================================================
                LISTADO
            ====================================================== */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* CABECERA */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                Gastos PAKET
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                {expensesFiltrados.length} registro
                                {expensesFiltrados.length ===
                                1
                                    ? ""
                                    : "s"}
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                            {/* BUSCADOR */}
                            <div className="relative w-full md:w-[300px]">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔎
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        cambiarBusqueda(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Buscar por Nº de venta, cliente..."
                                    className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* FILTROS */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        cambiarFiltro(
                                            "all"
                                        )
                                    }
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                                        filter ===
                                        "all"
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    Todos
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        cambiarFiltro(
                                            "pending"
                                        )
                                    }
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                                        filter ===
                                        "pending"
                                            ? "bg-amber-500 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    Pendientes
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        cambiarFiltro(
                                            "reimbursed"
                                        )
                                    }
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                                        filter ===
                                        "reimbursed"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    Reembolsados
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    BARRA DE SELECCIÓN
                ================================================== */}

                {selectedExpenses.length >
                    0 && (
                    <div className="mx-5 mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 font-black text-slate-800">
                                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">
                                        ✓
                                    </span>

                                    {selectedExpenses.length}{" "}
                                    seleccionado
                                    {selectedExpenses.length ===
                                    1
                                        ? ""
                                        : "s"}
                                </div>

                                <div className="hidden sm:block h-6 w-px bg-blue-200" />

                                <div className="text-sm text-slate-600">
                                    Monto total:{" "}
                                    <span className="font-black text-slate-900">
                                        {FORMATO_MONEDA(
                                            montoSeleccionado
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={
                                        abrirReembolsoMasivo
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm transition"
                                >
                                    💳 Reembolsar seleccionados (
                                    {
                                        selectedExpenses.length
                                    }
                                    )
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        limpiarSeleccion
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-300 bg-white text-red-600 font-bold hover:bg-red-50 transition"
                                >
                                    ✕ Limpiar selección
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    LOADING
                ================================================== */}

                {loading ? (
                    <div className="p-10 text-center">
                        <div className="inline-flex items-center gap-3 text-slate-500">
                            <span className="animate-spin text-xl">
                                ◌
                            </span>

                            Cargando gastos PAKET...
                        </div>
                    </div>
                ) : expensesFiltrados.length ===
                  0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4">
                            📭
                        </div>

                        <h3 className="font-black text-slate-900">
                            No hay registros
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            No existen gastos PAKET
                            para los filtros
                            seleccionados.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* =================================================
                            TABLA
                        ================================================== */}

                        <div className="overflow-x-auto mt-5">
                            <table className="w-full min-w-[1180px]">
                                <thead>
                                    <tr className="bg-slate-50 border-y border-slate-200">
                                        {/* CHECKBOX */}
                                        <th className="w-14 px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    todosPendientesSeleccionados
                                                }
                                                onChange={
                                                    toggleSeleccionarTodos
                                                }
                                                disabled={
                                                    pendientesPagina.length ===
                                                    0
                                                }
                                                className="w-5 h-5 accent-emerald-600 cursor-pointer disabled:opacity-40"
                                                aria-label="Seleccionar todos los pendientes"
                                            />
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Nº Venta
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Cliente
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Fecha
                                        </th>

                                        <th className="text-right px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Monto PAKET
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Pagado por
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Estado
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Reembolso
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Medio
                                        </th>

                                        <th className="text-right px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {expensesPagina.map(
                                        (expense) => {
                                            const estado =
                                                ESTADO_REEMBOLSO[
                                                    expense
                                                        .reimbursement_status
                                                ] ||
                                                ESTADO_REEMBOLSO.pending;

                                            const pendiente =
                                                expense.reimbursement_status ===
                                                "pending";

                                            const seleccionado =
                                                selectedExpenses.includes(
                                                    expense.id
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        expense.id
                                                    }
                                                    className={`transition ${
                                                        seleccionado
                                                            ? "bg-blue-50/70"
                                                            : "hover:bg-slate-50/70"
                                                    }`}
                                                >
                                                    {/* CHECKBOX */}
                                                    <td className="px-4 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                seleccionado
                                                            }
                                                            onChange={() =>
                                                                toggleExpenseSelection(
                                                                    expense
                                                                )
                                                            }
                                                            disabled={
                                                                !pendiente
                                                            }
                                                            className="w-5 h-5 accent-emerald-600 cursor-pointer disabled:opacity-30"
                                                            aria-label={`Seleccionar venta ${
                                                                expense
                                                                    .order
                                                                    ?.numero_venta ||
                                                                ""
                                                            }`}
                                                        />
                                                    </td>

                                                    {/* VENTA */}
                                                    <td className="px-4 py-4">
                                                        <div className="font-black text-slate-900">
                                                            {expense
                                                                .order
                                                                ?.numero_venta
                                                                ? `#${expense.order.numero_venta}`
                                                                : "—"}
                                                        </div>

                                                        <div className="text-xs text-slate-400 mt-1">
                                                            {expense.carrier ||
                                                                "PAKET"}
                                                        </div>
                                                    </td>

                                                    {/* CLIENTE */}
                                                    <td className="px-4 py-4">
                                                        <div className="font-semibold text-slate-800 max-w-[220px] truncate">
                                                            {expense
                                                                .order
                                                                ?.nombre ||
                                                                "Sin cliente"}
                                                        </div>
                                                    </td>

                                                    {/* FECHA */}
                                                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                                                        {FORMATO_FECHA(
                                                            expense.created_at
                                                        )}
                                                    </td>

                                                    {/* MONTO */}
                                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                                        <span className="font-black text-slate-900">
                                                            {FORMATO_MONEDA(
                                                                expense.amount
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* PAGADO POR */}
                                                    <td className="px-4 py-4 text-sm text-slate-600">
                                                        {expense.paid_by ||
                                                            "—"}
                                                    </td>

                                                    {/* ESTADO */}
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${estado.className}`}
                                                        >
                                                            {estado.label}
                                                        </span>
                                                    </td>

                                                    {/* REEMBOLSO */}
                                                    <td className="px-4 py-4 text-sm">
                                                        {expense.reimbursed_at ? (
                                                            <div>
                                                                <p className="font-semibold text-slate-700 whitespace-nowrap">
                                                                    {FORMATO_FECHA(
                                                                        expense.reimbursed_at
                                                                    )}
                                                                </p>

                                                                {expense.notes && (
                                                                    <p
                                                                        title={
                                                                            expense.notes
                                                                        }
                                                                        className="text-xs text-slate-400 mt-1 max-w-[180px] truncate"
                                                                    >
                                                                        {
                                                                            expense.notes
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* MEDIO */}
                                                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                                                        {expense.reimbursement_payment_method ||
                                                            "—"}
                                                    </td>

                                                    {/* ACCIÓN */}
                                                    <td className="px-4 py-4 text-right">
                                                        {pendiente ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedExpense(
                                                                        {
                                                                            multiple: false,
                                                                            expenses: [
                                                                                expense,
                                                                            ],
                                                                        }
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-black transition shadow-sm whitespace-nowrap"
                                                            >
                                                                💳 Reembolsar
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm font-bold whitespace-nowrap">
                                                                ✓ Completado
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
                            FOOTER / PAGINACIÓN
                        ================================================== */}

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-5 border-t border-slate-200">
                            <p className="text-sm text-slate-500">
                                Mostrando{" "}
                                <span className="font-bold text-slate-700">
                                    {expensesFiltrados.length ===
                                    0
                                        ? 0
                                        : inicio + 1}
                                </span>{" "}
                                a{" "}
                                <span className="font-bold text-slate-700">
                                    {Math.min(
                                        fin,
                                        expensesFiltrados.length
                                    )}
                                </span>{" "}
                                de{" "}
                                <span className="font-bold text-slate-700">
                                    {
                                        expensesFiltrados.length
                                    }
                                }{" "}
                                registros
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* ANTERIOR */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        cambiarPagina(
                                            paginaActual -
                                                1
                                        )
                                    }
                                    disabled={
                                        paginaActual ===
                                        1
                                    }
                                    className="w-10 h-10 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ‹
                                </button>

                                {/* PÁGINAS */}
                                {paginas.map(
                                    (pagina) => (
                                        <button
                                            key={
                                                pagina
                                            }
                                            type="button"
                                            onClick={() =>
                                                cambiarPagina(
                                                    pagina
                                                )
                                            }
                                            className={`w-10 h-10 rounded-xl font-bold text-sm transition ${
                                                paginaActual ===
                                                pagina
                                                    ? "bg-slate-900 text-white"
                                                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {pagina}
                                        </button>
                                    )
                                )}

                                {/* SIGUIENTE */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        cambiarPagina(
                                            paginaActual +
                                                1
                                        )
                                    }
                                    disabled={
                                        paginaActual ===
                                        totalPaginas
                                    }
                                    className="w-10 h-10 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ›
                                </button>

                                {/* ITEMS POR PÁGINA */}
                                <select
                                    value={
                                        itemsPerPage
                                    }
                                    onChange={(event) =>
                                        cambiarItemsPorPagina(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="ml-2 h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="10">
                                        10 por página
                                    </option>

                                    <option value="20">
                                        20 por página
                                    </option>

                                    <option value="30">
                                        30 por página
                                    </option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* =====================================================
                NOTA OPERATIVA
            ====================================================== */}

            <div className="mt-6 rounded-2xl bg-sky-50 border border-sky-100 p-4">
                <div className="flex items-start gap-3">
                    <span className="text-xl">
                        ℹ️
                    </span>

                    <div className="text-sm text-sky-800">
                        <p className="font-bold">
                            Control PAKET
                        </p>

                        <p className="mt-1">
                            Los gastos registrados
                            representan el costo
                            pagado a PAKET. El estado
                            de reembolso se actualiza
                            únicamente mediante el
                            procedimiento seguro de
                            Supabase.
                        </p>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MODAL DE REEMBOLSO
            ====================================================== */}

            {selectedExpense && (
                <ReembolsoModal
                    expenses={
                        selectedExpense.expenses ||
                        []
                    }
                    onClose={() =>
                        setSelectedExpense(null)
                    }
                    onSuccess={
                        handleReembolsoSuccess
                    }
                />
            )}
        </div>
    );
}

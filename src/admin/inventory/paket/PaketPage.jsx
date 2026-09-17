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

    return fecha.toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
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
    expense,
    onClose,
    onSuccess,
}) {
    const [paymentMethod, setPaymentMethod] =
        useState("transferencia");

    const [notes, setNotes] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!expense?.id) {
            setError(
                "No se encontró el gasto PAKET seleccionado."
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

        try {
            await PaketService.marcarReembolso({
                id: expense.id,
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
                    onClose();
                }
            }}
        >

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            PAKET
                        </p>

                        <h2 className="text-xl font-black text-slate-900 mt-1">
                            Registrar reembolso
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >

                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">

                        <div className="flex items-center justify-between gap-4">

                            <div>
                                <p className="text-xs text-slate-500">
                                    Venta
                                </p>

                                <p className="font-black text-slate-900">
                                    {expense?.order?.numero_venta
                                        ? `#${expense.order.numero_venta}`
                                        : "Sin número"}
                                </p>
                            </div>

                            <div className="text-right">

                                <p className="text-xs text-slate-500">
                                    Monto PAKET
                                </p>

                                <p className="text-lg font-black text-slate-900">
                                    {FORMATO_MONEDA(
                                        expense?.amount
                                    )}
                                </p>

                            </div>

                        </div>

                        {expense?.order?.nombre && (
                            <p className="text-sm text-slate-500 mt-3">
                                Cliente:{" "}
                                <span className="font-semibold text-slate-700">
                                    {expense.order.nombre}
                                </span>
                            </p>
                        )}

                    </div>


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
                            placeholder="Ej.: Reembolso realizado desde cuenta Boutique Pet Love."
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <p className="text-xs text-slate-400 mt-1 text-right">
                            {notes.length}/500
                        </p>
                    </div>


                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}


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
                                ? "Registrando..."
                                : "Confirmar reembolso"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default function PaketPage() {

    const [expenses, setExpenses] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [filter, setFilter] =
        useState("all");

    const [selectedExpense, setSelectedExpense] =
        useState(null);


    const cargarGastos = useCallback(
        async ({
            initial = false,
        } = {}) => {

            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            try {
                const data =
                    await PaketService.getExpenses();

                setExpenses(data);
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


    const expensesFiltrados = useMemo(() => {

        if (filter === "pending") {
            return expenses.filter(
                (expense) =>
                    expense.reimbursement_status ===
                    "pending"
            );
        }

        if (filter === "reimbursed") {
            return expenses.filter(
                (expense) =>
                    expense.reimbursement_status ===
                    "reimbursed"
            );
        }

        return expenses;

    }, [expenses, filter]);


    const handleReembolsoSuccess = async () => {
        await cargarGastos();
    };


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
                        Control de despachos PAKET, costos y
                        reembolsos pagados inicialmente por la
                        empresa.
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
                ERROR GENERAL
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
                    value={
                        FORMATO_MONEDA(
                            resumen.costoTotal
                        )
                    }
                    description="Total pagado a PAKET"
                />

                <StatCard
                    icon="⏳"
                    title="Pendiente de reembolso"
                    value={
                        FORMATO_MONEDA(
                            resumen.pendienteReembolso
                        )
                    }
                    description="Pagos pendientes de recuperar"
                />

                <StatCard
                    icon="✅"
                    title="Reembolsado"
                    value={
                        FORMATO_MONEDA(
                            resumen.reembolsado
                        )
                    }
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

                <div className="p-6 border-b border-slate-200">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>

                            <h2 className="text-xl font-black text-slate-900">
                                Gastos PAKET
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                {expensesFiltrados.length} registro
                                {expensesFiltrados.length === 1
                                    ? ""
                                    : "s"}
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={() =>
                                    setFilter("all")
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                    filter === "all"
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                Todos
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setFilter("pending")
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                    filter === "pending"
                                        ? "bg-amber-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                Pendientes
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setFilter("reimbursed")
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                    filter === "reimbursed"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                Reembolsados
                            </button>

                        </div>

                    </div>

                </div>


                {loading ? (

                    <div className="p-10 text-center">

                        <div className="inline-flex items-center gap-3 text-slate-500">

                            <span className="animate-spin text-xl">
                                ◌
                            </span>

                            Cargando gastos PAKET...
                        </div>

                    </div>

                ) : expensesFiltrados.length === 0 ? (

                    <div className="p-12 text-center">

                        <div className="text-4xl mb-4">
                            📭
                        </div>

                        <h3 className="font-black text-slate-900">
                            No hay registros
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            No existen gastos PAKET para el
                            filtro seleccionado.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px]">

                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Venta
                                    </th>

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Cliente
                                    </th>

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Fecha
                                    </th>

                                    <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Monto PAKET
                                    </th>

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Pagado por
                                    </th>

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Estado
                                    </th>

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Reembolso
                                    </th>

                                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Medio
                                    </th>

                                    <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                        Acción
                                    </th>

                                </tr>
                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {expensesFiltrados.map(
                                    (expense) => {

                                        const estado =
                                            ESTADO_REEMBOLSO[
                                                expense.reimbursement_status
                                            ] ||
                                            ESTADO_REEMBOLSO.pending;

                                        const pendiente =
                                            expense.reimbursement_status ===
                                            "pending";

                                        return (
                                            <tr
                                                key={expense.id}
                                                className="hover:bg-slate-50/70 transition"
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="font-black text-slate-900">
                                                        {expense.order?.numero_venta
                                                            ? `#${expense.order.numero_venta}`
                                                            : "—"}
                                                    </div>

                                                    <div className="text-xs text-slate-400 mt-1">
                                                        {expense.carrier || "PAKET"}
                                                    </div>

                                                </td>


                                                <td className="px-6 py-4">

                                                    <div className="font-semibold text-slate-800">
                                                        {expense.order?.nombre ||
                                                            "Sin cliente"}
                                                    </div>

                                                </td>


                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {FORMATO_FECHA(
                                                        expense.created_at
                                                    )}
                                                </td>


                                                <td className="px-6 py-4 text-right">

                                                    <span className="font-black text-slate-900">
                                                        {FORMATO_MONEDA(
                                                            expense.amount
                                                        )}
                                                    </span>

                                                </td>


                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {expense.paid_by ||
                                                        "—"}
                                                </td>


                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${estado.className}`}
                                                    >
                                                        {estado.label}
                                                    </span>

                                                </td>


                                                <td className="px-6 py-4 text-sm">

                                                    {expense.reimbursed_at ? (
                                                        <div>

                                                            <p className="font-semibold text-slate-700">
                                                                {FORMATO_FECHA(
                                                                    expense.reimbursed_at
                                                                )}
                                                            </p>

                                                            {expense.notes && (
                                                                <p className="text-xs text-slate-400 mt-1 max-w-[220px] truncate">
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


                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {expense.reimbursement_payment_method ||
                                                        "—"}
                                                </td>


                                                <td className="px-6 py-4 text-right">

                                                    {pendiente ? (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedExpense(
                                                                    expense
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-sm"
                                                        >
                                                            💳 Reembolsar
                                                        </button>

                                                    ) : (

                                                        <span className="text-xs font-semibold text-emerald-600">
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
                            Los gastos registrados representan el
                            costo pagado a PAKET. El estado de
                            reembolso se actualiza únicamente
                            mediante el procedimiento seguro de
                            Supabase.
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                MODAL
            ====================================================== */}

            {selectedExpense && (
                <ReembolsoModal
                    expense={selectedExpense}
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

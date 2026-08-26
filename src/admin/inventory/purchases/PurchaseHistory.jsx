import { useEffect, useMemo, useState } from "react";
import { Eye, Package, RefreshCw } from "lucide-react";
import { supabase } from "../../../supabaseClient";
import PurchaseDetailModal from "./PurchaseDetailModal";

function formatPurchaseNumber(number) {
    if (number === null || number === undefined) {
        return "-";
    }

    return `COMP-${String(number).padStart(6, "0")}`;
}

function formatDate(date) {
    if (!date) return "-";

    const parts = String(date).split("-");

    if (parts.length !== 3) {
        return date;
    }

    const [year, month, day] = parts;

    return `${day}-${month}-${year}`;
}

function formatCurrency(value) {
    const number = Number(value || 0);

    return number.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    });
}

function getDocumentLabel(documentType) {
    switch (documentType) {
        case "factura_afecta":
            return "Factura afecta";

        case "factura_exenta":
            return "Factura exenta";

        case "boleta":
            return "Boleta";

        case "otro":
            return "Otro comprobante";

        default:
            return documentType || "-";
    }
}

export default function PurchaseHistory() {
    const [purchases, setPurchases] = useState([]);
    const [details, setDetails] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    async function loadPurchases() {
        try {
            setLoading(true);
            setError("");

            // -----------------------------------------
            // Cargar compras
            // -----------------------------------------

            const {
                data: purchaseData,
                error: purchaseError,
            } = await supabase
                .from("purchases")
                .select(`
                    id,
                    purchase_number,
                    supplier,
                    document_type,
                    invoice_number,
                    subtotal,
                    iva,
                    total,
                    purchase_date,
                    notes
                `)
                .order("purchase_number", {
                    ascending: false,
                });

            if (purchaseError) {
                throw purchaseError;
            }

            // -----------------------------------------
            // Cargar detalles de compras
            // -----------------------------------------

            const {
                data: detailData,
                error: detailError,
            } = await supabase
                .from("purchase_details")
                .select(`
                    id,
                    purchase_id,
                    product_id,
                    variant_id,
                    quantity,
                    unit_cost,
                    subtotal
                `);

            if (detailError) {
                throw detailError;
            }

            setPurchases(purchaseData || []);
            setDetails(detailData || []);
        } catch (err) {
            console.error(
                "Error cargando historial de compras:",
                err
            );

            setError(
                err?.message ||
                "No fue posible cargar el historial de compras."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPurchases();
    }, []);

    // -------------------------------------------------
    // Resumen de cada compra
    // -------------------------------------------------

    const purchaseRows = useMemo(() => {
        return purchases.map((purchase) => {
            const purchaseDetails = details.filter(
                (detail) =>
                    detail.purchase_id === purchase.id
            );

            const productIds = new Set(
                purchaseDetails
                    .map((detail) => detail.product_id)
                    .filter(Boolean)
            );

            const variantIds = new Set(
                purchaseDetails
                    .map((detail) => detail.variant_id)
                    .filter(Boolean)
            );

            const units = purchaseDetails.reduce(
                (total, detail) =>
                    total + Number(detail.quantity || 0),
                0
            );

            return {
                ...purchase,
                productCount: productIds.size,
                variantCount: variantIds.size,
                unitCount: units,
            };
        });
    }, [purchases, details]);

    // -------------------------------------------------
    // Totales del historial
    // -------------------------------------------------

    const totalPurchases = purchases.length;

    const totalUnits = purchaseRows.reduce(
        (total, purchase) =>
            total + purchase.unitCount,
        0
    );

    return (
        <>
            <section className="mt-8">
                <div className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    overflow-hidden
                ">
{/* ---------------------------------- */}
{/* ACCIONES */}
{/* ---------------------------------- */}

<div className="
    flex
    items-center
    justify-end
    gap-3
    px-5
    py-1
">

    <div className="
        flex
        items-center
        gap-2
        rounded-xl
        bg-pink-50
        px-3
        py-2
    ">

        <span className="
            text-sm
            font-bold
            text-pink-600
        ">
            {totalPurchases}
        </span>

        <span className="
            text-sm
            font-medium
            text-slate-500
        ">
            {totalPurchases === 1
                ? "compra"
                : "compras"}
        </span>

    </div>

    <button
        type="button"
        onClick={loadPurchases}
        disabled={loading}
        title="Actualizar historial"
        className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-500
            transition
            hover:border-pink-200
            hover:bg-pink-50
            hover:text-pink-600
            disabled:cursor-not-allowed
            disabled:opacity-50
        "
    >
        <RefreshCw
            size={17}
            className={
                loading
                    ? "animate-spin"
                    : ""
            }
        />
    </button>

</div>

                    {/* ---------------------------------- */}
                    {/* CONTENIDO */}
                    {/* ---------------------------------- */}

                    <div className="px-5 pb-5 pt-2">
                        {error && (
                            <div className="
                                mb-4
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-red-700
                            ">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="
                                flex
                                min-h-[180px]
                                items-center
                                justify-center
                                text-slate-500
                            ">
                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">
                                    <RefreshCw
                                        size={20}
                                        className="animate-spin"
                                    />
                                    Cargando historial...
                                </div>
                            </div>
                        ) : purchaseRows.length === 0 ? (
                            <div className="
                                flex
                                min-h-[180px]
                                flex-col
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-dashed
                                border-slate-300
                                bg-slate-50
                                text-center
                            ">
                                <Package
                                    size={32}
                                    className="
                                        mb-3
                                        text-slate-400
                                    "
                                />

                                <p className="
                                    font-semibold
                                    text-slate-600
                                ">
                                    No existen compras registradas.
                                </p>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-slate-400
                                ">
                                    Las compras guardadas aparecerán aquí.
                                </p>
                            </div>
                        ) : (
                            <>
{/* -------------------------------- */}
{/* TABLA */}
{/* -------------------------------- */}

<div className="w-full overflow-hidden">
<table className="
    w-full
    min-w-0
    table-fixed
    border-collapse
">
    <colgroup>
    <col className="w-[7%]" />
    <col className="w-[12%]" />
    <col className="w-[10%]" />
    <col className="w-[13%]" />
    <col className="w-[18%]" />
    <col className="w-[10%]" />
    <col className="w-[10%]" />
    <col className="w-[9%]" />
    <col className="w-[11%]" />
</colgroup>
        <thead>
            <tr className="
                border-b
                border-slate-200
                bg-slate-50/70
            ">
                <th className="
                    w-[70px]
                    px-3
                    py-3
                    text-center
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Ver
                </th>

                <th className="
                    px-3
                    py-3
                    text-left
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Compra
                </th>

                <th className="
                    px-3
                    py-3
                    text-left
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Fecha
                </th>

                <th className="
                    px-3
                    py-3
                    text-left
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Proveedor
                </th>

                <th className="
                    px-3
                    py-3
                    text-left
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Documento
                </th>

                <th className="
                    px-3
                    py-3
                    text-center
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Productos
                </th>

                <th className="
                    px-3
                    py-3
                    text-center
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Variantes
                </th>

                <th className="
                    px-3
                    py-3
                    text-center
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Unidades
                </th>

                <th className="
                    px-3
                    py-3
                    text-right
                    text-[11px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                ">
                    Total
                </th>
            </tr>
        </thead>

        <tbody>
            {purchaseRows.map((purchase) => (
                <tr
                    key={purchase.id}
                    className="
                        group
                        border-b
                        border-slate-100
                        transition
                        duration-150
                        hover:bg-pink-50/40
                    "
                >
                    {/* VER */}

                    <td className="
                        px-3
                        py-3
                        text-center
                    ">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedPurchase(purchase);
                                setDetailModalOpen(true);
                            }}
                            title="Ver detalle de compra"
                            className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-slate-400
                                shadow-sm
                                transition
                                hover:border-pink-200
                                hover:bg-pink-50
                                hover:text-pink-600
                                group-hover:border-pink-200
                            "
                        >
                            <Eye size={16} />
                        </button>
                    </td>

                    {/* COMPRA */}

                    <td className="
                        px-3
                        py-3
                    ">
                        <span className="
    block
    truncate
    text-[11px]
    font-black
    text-pink-600
">
                            {formatPurchaseNumber(
                                purchase.purchase_number
                            )}
                        </span>
                    </td>

                    {/* FECHA */}

                    <td className="
    px-2
    py-3
">
                        <span className="
    whitespace-nowrap
    text-[11px]
    font-medium
    text-slate-600
">
                            {formatDate(
                                purchase.purchase_date
                            )}
                        </span>
                    </td>

                    {/* PROVEEDOR */}

                    <td className="
                        max-w-[220px]
                        px-3
                        py-3
                    ">
                        <span className="
                            block
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                        ">
                            {purchase.supplier || "-"}
                        </span>
                    </td>

                    {/* DOCUMENTO */}

                    <td className="
                        px-3
                        py-3
                    ">
                        <div className="
                            flex
                            flex-col
                            gap-0.5
                        ">
                            <span className="
    block
    break-words
    text-[11px]
    font-semibold
    leading-tight
    text-slate-700
">
    {getDocumentLabel(
        purchase.document_type
    )}
</span>

                            {purchase.invoice_number && (
                                <span className="
                                    text-xs
                                    font-medium
                                    text-slate-400
                                ">
                                    Nº {purchase.invoice_number}
                                </span>
                            )}
                        </div>
                    </td>

                    {/* PRODUCTOS */}

                    <td className="
                        px-3
                        py-3
                        text-center
                    ">
                        <span className="
                            inline-flex
                            min-w-[34px]
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            px-2
                            py-1
                            text-xs
                            font-black
                            text-slate-700
                        ">
                            {purchase.productCount}
                        </span>
                    </td>

                    {/* VARIANTES */}

                    <td className="
                        px-3
                        py-3
                        text-center
                    ">
                        <span className="
                            inline-flex
                            min-w-[34px]
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            px-2
                            py-1
                            text-xs
                            font-black
                            text-slate-700
                        ">
                            {purchase.variantCount}
                        </span>
                    </td>

                    {/* UNIDADES */}

                    <td className="
                        px-3
                        py-3
                        text-center
                    ">
                        <span className="
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            {purchase.unitCount}
                        </span>
                    </td>

                    {/* TOTAL */}

                    <td className="
    whitespace-nowrap
    px-2
    py-3
    text-right
">
                        <span className="
    text-[11px]
    font-black
    text-slate-900
">
                            {formatCurrency(
                                purchase.total
                            )}
                        </span>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

                                {/* -------------------------------- */}
                                {/* PIE */}
                                {/* -------------------------------- */}

                                <div className="
                                    mt-4
                                    flex
                                    flex-col
                                    gap-2
                                    border-t
                                    border-slate-100
                                    pt-4
                                    text-sm
                                    text-slate-500
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                ">
                                    <span>
                                        {totalPurchases}{" "}
                                        {totalPurchases === 1
                                            ? "compra registrada"
                                            : "compras registradas"}
                                    </span>

                                    <span>
                                        {totalUnits.toLocaleString(
                                            "es-CL"
                                        )}{" "}
                                        unidades ingresadas
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <PurchaseDetailModal
                open={detailModalOpen}
                purchase={selectedPurchase}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedPurchase(null);
                }}
            />
        </>
    );
}

import { useEffect, useState } from "react";
import {
    X,
    Package,
    RefreshCw,
    CalendarDays,
    User,
    FileText,
    Hash,
} from "lucide-react";

import { supabase } from "../../../supabaseClient";

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

export default function PurchaseDetailModal({
    open,
    purchase,
    onClose,
}) {

    const [details, setDetails] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {

        if (!open || !purchase?.id) {
            setDetails([]);
            setError("");
            return;
        }

        loadDetails();

    }, [open, purchase?.id]);

    async function loadDetails() {

        try {

            setLoading(true);
            setError("");

            // -----------------------------------------
            // 1. Obtener detalles de la compra
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
                `)
                .eq("purchase_id", purchase.id)
                .order("id", {
                    ascending: true,
                });

            if (detailError) {
                throw detailError;
            }

            const rawDetails = detailData || [];

            // -----------------------------------------
            // 2. Obtener IDs de productos
            // -----------------------------------------

            const productIds = [
                ...new Set(
                    rawDetails
                        .map((item) => item.product_id)
                        .filter(Boolean)
                ),
            ];

            // -----------------------------------------
            // 3. Obtener IDs de variantes
            // -----------------------------------------

            const variantIds = [
                ...new Set(
                    rawDetails
                        .map((item) => item.variant_id)
                        .filter(Boolean)
                ),
            ];

            // -----------------------------------------
            // 4. Obtener productos
            // -----------------------------------------

            let products = [];

            if (productIds.length > 0) {

                const {
                    data,
                    error,
                } = await supabase
                    .from("products")
                    .select(`
                        id,
                        name
                    `)
                    .in("id", productIds);

                if (error) {
                    throw error;
                }

                products = data || [];
            }

            // -----------------------------------------
            // 5. Obtener variantes
            // -----------------------------------------

            let variants = [];

            if (variantIds.length > 0) {

                const {
                    data,
                    error,
                } = await supabase
                    .from("product_variants")
                    .select(`
                        id,
                        size
                    `)
                    .in("id", variantIds);

                if (error) {
                    throw error;
                }

                variants = data || [];
            }

            // -----------------------------------------
            // 6. Crear mapas
            // -----------------------------------------

            const productMap = new Map(
                products.map((product) => [
                    product.id,
                    product,
                ])
            );

            const variantMap = new Map(
                variants.map((variant) => [
                    variant.id,
                    variant,
                ])
            );

            // -----------------------------------------
            // 7. Combinar información
            // -----------------------------------------

            const completeDetails = rawDetails.map(
                (item) => {

                    const product =
                        productMap.get(item.product_id);

                    const variant =
                        variantMap.get(item.variant_id);

                    return {

                        ...item,

                        productName:
                            product?.name ||
                            "Producto",

                        size:
                            variant?.size ||
                            "-",

                    };

                }
            );

            setDetails(completeDetails);

        } catch (err) {

            console.error(
                "Error cargando detalle de compra:",
                err
            );

            setError(
                err?.message ||
                "No fue posible cargar el detalle de la compra."
            );

        } finally {

            setLoading(false);

        }

    }

    if (!open || !purchase) {
        return null;
    }

    const totalUnits = details.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    return (

        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/50
                p-4
            "
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    onClose?.();
                }

            }}
        >

            <div
                className="
                    flex
                    max-h-[90vh]
                    w-full
                    max-w-6xl
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

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

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-pink-50
                                text-pink-600
                            ">

                                <Package size={22} />

                            </div>

                            <div>

                                <h2 className="
                                    text-2xl
                                    font-black
                                    text-slate-900
                                ">

                                    Detalle de compra

                                </h2>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">

                                    {formatPurchaseNumber(
                                        purchase.purchase_number
                                    )}

                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                        aria-label="Cerrar"
                    >

                        <X size={22} />

                    </button>

                </div>

                {/* ================================= */}
                {/* INFORMACIÓN GENERAL */}
                {/* ================================= */}

                <div className="
                    grid
                    grid-cols-1
                    gap-3
                    border-b
                    border-slate-200
                    bg-slate-50
                    px-6
                    py-5
                    md:grid-cols-4
                ">

                    <div className="
                        rounded-xl
                        bg-white
                        p-4
                        shadow-sm
                    ">

                        <div className="
                            mb-1
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            text-slate-500
                        ">

                            <Hash size={14} />

                            Compra

                        </div>

                        <div className="
                            font-black
                            text-pink-600
                        ">

                            {formatPurchaseNumber(
                                purchase.purchase_number
                            )}

                        </div>

                    </div>

                    <div className="
                        rounded-xl
                        bg-white
                        p-4
                        shadow-sm
                    ">

                        <div className="
                            mb-1
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            text-slate-500
                        ">

                            <CalendarDays size={14} />

                            Fecha

                        </div>

                        <div className="
                            font-bold
                            text-slate-800
                        ">

                            {formatDate(
                                purchase.purchase_date
                            )}

                        </div>

                    </div>

                    <div className="
                        rounded-xl
                        bg-white
                        p-4
                        shadow-sm
                    ">

                        <div className="
                            mb-1
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            text-slate-500
                        ">

                            <User size={14} />

                            Proveedor

                        </div>

                        <div className="
                            font-bold
                            text-slate-800
                        ">

                            {purchase.supplier || "-"}

                        </div>

                    </div>

                    <div className="
                        rounded-xl
                        bg-white
                        p-4
                        shadow-sm
                    ">

                        <div className="
                            mb-1
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            text-slate-500
                        ">

                            <FileText size={14} />

                            Documento

                        </div>

                        <div className="
                            font-bold
                            text-slate-800
                        ">

                            {getDocumentLabel(
                                purchase.document_type
                            )}

                        </div>

                        {purchase.invoice_number && (

                            <div className="
                                text-xs
                                text-slate-500
                            ">

                                Nº {purchase.invoice_number}

                            </div>

                        )}

                    </div>

                </div>

                {/* ================================= */}
                {/* CONTENIDO */}
                {/* ================================= */}

                <div className="
                    flex-1
                    overflow-y-auto
                    p-6
                ">

                    {loading ? (

                        <div className="
                            flex
                            min-h-[250px]
                            items-center
                            justify-center
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                                text-slate-500
                            ">

                                <RefreshCw
                                    size={20}
                                    className="animate-spin"
                                />

                                Cargando detalle...

                            </div>

                        </div>

                    ) : error ? (

                        <div className="
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-4
                            text-sm
                            font-medium
                            text-red-700
                        ">

                            {error}

                        </div>

                    ) : details.length === 0 ? (

                        <div className="
                            flex
                            min-h-[250px]
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
                                size={34}
                                className="
                                    mb-3
                                    text-slate-400
                                "
                            />

                            <p className="
                                font-semibold
                                text-slate-600
                            ">

                                Esta compra no tiene detalles registrados.

                            </p>

                        </div>

                    ) : (

                        <div className="
                            overflow-x-auto
                            rounded-2xl
                            border
                            border-slate-200
                        ">
                            <div className="max-h-[360px] overflow-y-auto">

                            <table className="
                                w-full
                                min-w-[750px]
                                border-collapse
                            ">

                                <thead className="sticky top-0 z-10 bg-slate-50">

                                    <tr className="
                                        bg-slate-50
                                        text-left
                                    ">

                                        <th className="
                                            px-4
                                            py-4
                                            text-xs
                                            font-black
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        ">

                                            Producto

                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-center
                                            text-xs
                                            font-black
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        ">

                                            Talla

                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-center
                                            text-xs
                                            font-black
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        ">

                                            Cantidad

                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-right
                                            text-xs
                                            font-black
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        ">

                                            Costo unitario

                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-right
                                            text-xs
                                            font-black
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        ">

                                            Subtotal

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {details.map(
                                        (item) => (

                                            <tr
                                                key={item.id}
                                                className="
                                                    border-t
                                                    border-slate-100
                                                "
                                            >

                                                <td className="
                                                    px-4
                                                    py-4
                                                ">

                                                    <div className="
                                                        font-bold
                                                        text-slate-800
                                                    ">

                                                        {
                                                            item.productName
                                                        }

                                                    </div>

                                                </td>

                                                <td className="
                                                    px-4
                                                    py-4
                                                    text-center
                                                ">

                                                    <span className="
                                                        inline-flex
                                                        rounded-full
                                                        bg-pink-50
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-bold
                                                        text-pink-600
                                                    ">

                                                        {item.size === null ||
                                                        item.size === undefined ||
                                                        item.size === ""
                                                            ? "-"
                                                            : `${item.size}`}

                                                    </span>

                                                </td>

                                                <td className="
                                                    px-4
                                                    py-4
                                                    text-center
                                                    font-bold
                                                    text-slate-800
                                                ">

                                                    {Number(
                                                        item.quantity || 0
                                                    )}

                                                </td>

                                                <td className="
                                                    px-4
                                                    py-4
                                                    text-right
                                                    font-medium
                                                    text-slate-700
                                                ">

                                                    {formatCurrency(
                                                        item.unit_cost
                                                    )}

                                                </td>

                                                <td className="
                                                    px-4
                                                    py-4
                                                    text-right
                                                    font-black
                                                    text-slate-900
                                                ">

                                                    {formatCurrency(
                                                        item.subtotal
                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                            </div>

                        </div>

                    )}

                </div>

                {/* ================================= */}
                {/* FOOTER */}
                {/* ================================= */}

                <div className="
                    border-t
                    border-slate-200
                    bg-white
                    px-6
                    py-5
                ">

                    <div className="
                        flex
                        flex-col
                        gap-5
                        md:flex-row
                        md:items-end
                        md:justify-between
                    ">

                        <div className="
                            text-sm
                            text-slate-500
                        ">

                            <div>

                                <span className="font-semibold">
                                    Productos:
                                </span>{" "}

                                {details.length}

                            </div>

                            <div>

                                <span className="font-semibold">
                                    Unidades:
                                </span>{" "}

                                {totalUnits}

                            </div>

                        </div>

                        <div className="
                            min-w-[280px]
                            space-y-2
                        ">

                            <div className="
                                flex
                                justify-between
                                text-sm
                                text-slate-500
                            ">

                                <span>
                                    Subtotal
                                </span>

                                <span className="
                                    font-semibold
                                    text-slate-800
                                ">

                                    {formatCurrency(
                                        purchase.subtotal
                                    )}

                                </span>

                            </div>

                            <div className="
                                flex
                                justify-between
                                text-sm
                                text-slate-500
                            ">

                                <span>
                                    IVA
                                </span>

                                <span className="
                                    font-semibold
                                    text-slate-800
                                ">

                                    {formatCurrency(
                                        purchase.iva
                                    )}

                                </span>

                            </div>

                            <div className="
                                border-t
                                border-slate-200
                                pt-3
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                ">

                                    <span className="
                                        text-lg
                                        font-black
                                        text-slate-900
                                    ">

                                        TOTAL

                                    </span>

                                    <span className="
                                        text-2xl
                                        font-black
                                        text-pink-600
                                    ">

                                        {formatCurrency(
                                            purchase.total
                                        )}

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

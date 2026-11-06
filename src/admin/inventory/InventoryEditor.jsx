
const EQUIVALENCIAS = [
    "2XS", "XS", "S", "M", "L", "XL",
    "2XL", "3XL", "4XL", "5XL",
    "6XL", "7XL", "8XL"
];

function mostrarTalla(valor) {
    const talla = String(valor ?? "").trim();
    const normalizada = talla
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/^TALLA/, "");

    if (["UNICA", "ÚNICA", "UNICO", "ÚNICO", "TU"].includes(normalizada)) {
        return "Única";
    }

    const numero = normalizada.match(/^T?(\d{1,2})$/);

    if (numero) {
        const n = Number(numero[1]);

        if (n >= 0 && n <= 12) {
            return `T${n} / ${EQUIVALENCIAS[n]}`;
        }
    }

    const indice = EQUIVALENCIAS.indexOf(normalizada);

    if (indice >= 0) {
        return `T${indice} / ${EQUIVALENCIAS[indice]}`;
    }

    return talla;
}

const formatoPeso = valor =>
    new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(Number(valor || 0));

export default function InventoryEditor({ item, onClose }) {
    if (!item) return null;

    const stock = Number(item.stock || 0);
    const precio = Number(item.sale_price || 0);

    const estadoColor =
        item.status === "OK"
            ? "bg-green-100 text-green-700"
            : item.status === "CRITICO"
                ? "bg-orange-100 text-orange-700"
                : "bg-red-100 text-red-700";

    return (
        <div className="p-5 sm:p-6">
            {/* ENCABEZADO */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        Detalle de variante
                    </h2>
                    <p className="text-xs text-slate-500">
                        Consulta de inventario
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar detalle"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl hover:bg-slate-200"
                >
                    ×
                </button>
            </div>

            {/* PRODUCTO */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                <img
                    src={item.image || "/placeholder.png"}
                    alt={item.product_name}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover shadow-sm sm:h-28 sm:w-28"
                />

                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black leading-tight text-slate-900">
                        {item.product_name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {String(item.category || "").replace(" - ", " · ")}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">
                            {mostrarTalla(item.size)}
                        </span>

                        <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${estadoColor}`}>
                            {item.status || "Sin estado"}
                        </span>
                    </div>
                </div>
            </div>

            {/* INFORMACIÓN */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                        Stock disponible
                    </p>

                    <p className={`mt-2 text-2xl font-black ${
                        stock === 0
                            ? "text-red-600"
                            : stock <= 3
                                ? "text-orange-600"
                                : "text-green-700"
                    }`}>
                        {stock}
                        <span className="ml-1 text-xs font-normal text-slate-500">
                            unidades
                        </span>
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                        Precio de venta
                    </p>

                    <p className="mt-2 text-xl font-black text-slate-900">
                        {formatoPeso(precio)}
                    </p>
                </div>
            </div>

            {/* IDENTIFICACIÓN */}
            <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Identificación
                </p>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-slate-500">
                            Variante
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                            {mostrarTalla(item.size)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            ID de variante
                        </p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                            {item.variant_id ?? "No disponible"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ACCIONES */}
            <div className="mt-5 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition hover:bg-slate-700"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}

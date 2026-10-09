
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export default function ProductSearch({
    products = [],
    value,
    onSelect,
    compact = false
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selected = products.find(
        (p) => String(p.id) === String(value)
    );

    useEffect(() => {
        if (selected) {
            setQuery(selected.name);
        } else if (!value) {
            setQuery("");
        }
    }, [selected, value]);

    useEffect(() => {
        function handleClick(e) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        const results = products.filter((product) =>
            product.name.toLowerCase().includes(term)
        );

        return term ? results : results.slice(0, 20);
    }, [query, products]);

    return (
        <div ref={wrapperRef} className="relative">
            <div className="flex h-12 items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm focus-within:border-pink-400">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                    type="text"
                    value={query}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        if (value) onSelect(null);
                    }}
                    placeholder="Buscar producto..."
                    className="ml-3 min-w-0 flex-1 outline-none"
                />
            </div>

            {open && (
                <div
                    className={`absolute left-0 right-0 z-[120] mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl ${
                        compact
                            ? "max-h-64 overflow-y-auto"
                            : "max-h-96 overflow-y-auto"
                    }`}
                >
                    {filtered.length === 0 ? (
                        <div className="p-5 text-center text-sm text-slate-500">
                            No se encontraron productos.
                        </div>
                    ) : (
                        filtered.map((product) => {
                            const image =
                                product.product_images?.[0]?.url;

                            return (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(product);
                                        setQuery(product.name);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 text-left transition hover:bg-pink-50 ${
                                        compact ? "px-3 py-2" : "p-4"
                                    }`}
                                >
                                    <img
                                        src={image || "/placeholder-product.png"}
                                        alt=""
                                        className={`shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover ${
                                            compact ? "h-10 w-10" : "h-14 w-14"
                                        }`}
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold text-slate-800">
                                            {product.name}
                                        </span>
                                    </span>

                                    <span className="shrink-0 text-xs font-semibold text-pink-600">
                                        Seleccionar
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

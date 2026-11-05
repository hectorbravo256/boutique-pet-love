import { useRef } from "react";
import PurchaseItemCard from "./PurchaseItemCard";

export default function PurchaseItemsTable({
    details,
    setDetails,
    onAddProduct,
    codigoCompra,
    setCodigoCompra,
    procesarEscaneoCompra,
    errorEscaner,
    mensajeEscaner,
    escaneando
}) {
    const inputEscanerRef = useRef(null);

    //---------------------------------------
    // Actualizar cantidad
    //---------------------------------------

    function updateQuantity(index, quantity) {

        const newDetails = [...details];

        newDetails[index].quantity = quantity;

        newDetails[index].subtotal =
            quantity *
            newDetails[index].unit_cost;

        setDetails(newDetails);

    }

    //---------------------------------------
    // Actualizar costo
    //---------------------------------------

    function updateCost(index, cost) {

        const newDetails = [...details];

        newDetails[index].unit_cost = cost;

        newDetails[index].subtotal =
            cost *
            newDetails[index].quantity;

        setDetails(newDetails);

    }

    //---------------------------------------
    // Eliminar producto
    //---------------------------------------

    function removeItem(index) {

        const newDetails = [...details];

        newDetails.splice(index, 1);

        setDetails(newDetails);

    }

    //---------------------------------------
    // RENDER
    //---------------------------------------

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* ENCABEZADO DE PRODUCTOS */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
            <div>
                <h2 className="text-lg font-semibold text-slate-800">
                    2. Agregar productos
                </h2>
        
                <p className="mt-1 text-sm text-slate-500">
                    Agrega y revisa los productos que forman parte de esta compra.
                </p>
            </div>
        
            <button
                type="button"
                onClick={onAddProduct}
                className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    bg-pink-500
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-pink-600
                "
            >
                + Agregar producto
            </button>

                {/* CONTADOR */}

                <div
                    className="
                        flex
                        min-w-[100px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-pink-50
                        px-4
                        py-3
                        text-center
                    "
                >

                    <span className="text-lg">
                        📦
                    </span>

                    <div>
                        <div className="text-xs font-medium text-slate-500">
                            Productos
                        </div>

                        <div className="text-xl font-black text-pink-600">
                            {details.length}
                        </div>
                    </div>

                </div>

            </div>
            
            
{/* LECTOR DE CÓDIGOS DE BARRAS */}
<div className="mb-6 border-t border-slate-200 pt-5">
    <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-800">
            Escanear código de barras
        </h3>

        <p className="mt-1 text-xs text-slate-500">
            Escanea una etiqueta para agregar el producto a la compra.
            Se utilizará su último costo de adquisición disponible.
        </p>
    </div>

    <form
        onSubmit={async (e) => {
            e.preventDefault();

            await procesarEscaneoCompra(codigoCompra);

            inputEscanerRef.current?.focus();
        }}
        className="flex flex-wrap gap-3"
    >
        <input
            ref={inputEscanerRef}
            type="text"
            value={codigoCompra}
            onChange={(e) => setCodigoCompra(e.target.value)}
            placeholder="Escanea o escribe BPL-00000001"
            autoComplete="off"
            disabled={escaneando}
            className="
                min-w-0 flex-1 rounded-xl
                border border-slate-300
                px-4 py-3
                focus:border-pink-500
                focus:outline-none
                disabled:bg-slate-100
            "
        />

        <button
            type="submit"
            disabled={escaneando || !codigoCompra.trim()}
            className="
                rounded-xl bg-pink-600
                px-5 py-3 font-bold text-white
                hover:bg-pink-700
                disabled:opacity-50
            "
        >
            {escaneando ? "Buscando..." : "Agregar"}
        </button>
    </form>

    {errorEscaner && (
        <div
            role="alert"
            className="
                mt-3 rounded-xl border border-red-200
                bg-red-50 px-4 py-3
                text-sm font-semibold text-red-700
            "
        >
            ⚠️ {errorEscaner}
        </div>
    )}

    {mensajeEscaner && !errorEscaner && (
        <p className="mt-3 text-sm font-semibold text-green-700">
            ✓ {mensajeEscaner}
        </p>
    )}
</div>

            {/* SIN PRODUCTOS */}

            {details.length === 0 && (

                <div
                    className="
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-300
                        bg-slate-50
                        px-6
                        py-16
                        text-center
                    "
                >

                    <div className="mb-4 text-5xl">
                        📦
                    </div>

                    <h3 className="text-xl font-bold text-slate-700">
                        No hay productos agregados
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Presiona "Agregar producto" para comenzar la compra.
                    </p>

                </div>

            )}


            {/* LISTADO DE PRODUCTOS */}

            {details.length > 0 && (

                <div className="space-y-4">

                    {details.map((item, index) => (

                        <PurchaseItemCard
                            key={`${item.variant_id}-${index}`}
                            item={item}
                            index={index}
                            updateQuantity={updateQuantity}
                            updateCost={updateCost}
                            removeItem={removeItem}
                        />

                    ))}

                </div>

            )}

        </div>
    );
}

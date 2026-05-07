import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Productos() {

  const [productosFull, setProductosFull] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [toast, setToast] = useState("");
  const [orden, setOrden] = useState({ campo: "name", direccion: "asc" });
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const recargarProductos = async () => {
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .order("name", { ascending: true });

    setProductosFull(
  Array.isArray(data) ? data : []
);
  };

  const ordenarProductos = (lista) => {
    if (!Array.isArray(lista)) return [];
  return [...lista].sort((a, b) => {
    let valA, valB;

    if (orden.campo === "name") {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    }

    if (orden.campo === "category") {
      valA = (a.category || "").toLowerCase();
      valB = (b.category || "").toLowerCase();
    }

    if (orden.campo === "price") {
      valA = a.product_variants?.[0]?.price || 0;
      valB = b.product_variants?.[0]?.price || 0;
    }

    if (valA < valB) return orden.direccion === "asc" ? -1 : 1;
    if (valA > valB) return orden.direccion === "asc" ? 1 : -1;
    return 0;
  });
};

  useEffect(() => {
    recargarProductos();
  }, []);

  return (
    <div style={{ padding: 20 }}>

      <h1>🛒 Editor de Productos</h1>

      {/* 🔍 BUSCADOR */}
      <input
        placeholder="🔍 Buscar producto..."
        value={searchProduct}
        onChange={(e) => setSearchProduct(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ddd"
        }}
      />

      <select
  value={filtroCategoria}
  onChange={(e) => setFiltroCategoria(e.target.value)}
  style={{
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #ddd"
  }}
>
  <option value="">Todas las categorías</option>

  {[
  ...new Set(
    (Array.isArray(productosFull)
      ? productosFull
      : []
    ).map(p => p.category)
  )
].map(cat => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>

{/* 📦 LISTADO TABLA PRO */}
<table style={{
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: 10,
  overflow: "hidden"
}}>
  <thead style={{ background: "#f3f4f6" }}>
    <tr>
      <th style={{ padding: 12 }}>
  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <span style={{ fontSize: 12, fontWeight: "bold" }}>
      Activar Descuento
    </span>

    <span style={{ fontSize: 12, fontWeight: "bold" }}>
      Borrar
    </span>
  </div>
</th>

<th
  style={{ padding: 12, cursor: "pointer" }}
  onClick={() =>
    setOrden(prev => ({
      campo: "name",
      direccion: prev.direccion === "asc" ? "desc" : "asc"
    }))
  }
>
  Producto ⬍
</th>

<th
  style={{ padding: 12, cursor: "pointer" }}
  onClick={() =>
    setOrden(prev => ({
      campo: "category",
      direccion: prev.direccion === "asc" ? "desc" : "asc"
    }))
  }
>
  Categoría ⬍
</th>

<th style={{ padding: 12 }}>Talla</th>

<th
  style={{ padding: 12, cursor: "pointer" }}
  onClick={() =>
    setOrden(prev => ({
      campo: "price",
      direccion: prev.direccion === "asc" ? "desc" : "asc"
    }))
  }
>
  Precio ⬍
</th>

<th style={{ padding: 12 }}>Acciones</th>
    </tr>
  </thead>

  <tbody>
    {ordenarProductos(
  productosFull
    ?.filter(p =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase())
    )
    .filter(p =>
      filtroCategoria ? p.category === filtroCategoria : true
    )
).map((p) => {

        // 🔥 ordenar tallas
        const variantesOrdenadas = [
  ...(Array.isArray(p.product_variants)
    ? p.product_variants
    : [])
].sort((a, b) => {
          const numA = parseInt(a.size.replace(/\D/g, ""));
          const numB = parseInt(b.size.replace(/\D/g, ""));
          return numA - numB;
        });

        const tallaDefault = variantesOrdenadas[0];

        return (
  <FilaProducto
    key={p.id}
    p={p}
    variantesOrdenadas={variantesOrdenadas}
    tallaDefault={tallaDefault}
    setProductosFull={setProductosFull}
  />
);
      })}
  </tbody>
</table>

      {/* 🔔 TOAST */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#111",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 10
        }}>
          {toast}
        </div>
      )}

    </div>
  );
}
function FilaProducto({ p, variantesOrdenadas, tallaDefault, setProductosFull }) {

  const [tallaSeleccionada, setTallaSeleccionada] = useState(tallaDefault);
  const [precioTemporal, setPrecioTemporal] = useState(tallaDefault?.price || "");
  const [estadoGuardado, setEstadoGuardado] =
  useState("idle");

  return (
    <tr
      style={{
        borderBottom: "1px solid #eee",
        height: 60,
        transition: "0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
      onMouseLeave={(e) => e.currentTarget.style.background = "white"}
    >

      {/* ACTIVO + ELIMINAR */}
<td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

    {/* 🔹 FILA 1: CONTROLES PRINCIPALES */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

      {/* ✅ ACTIVO */}
      <input
        type="checkbox"
        checked={p.active}
        onChange={async (e) => {
          const nuevo = e.target.checked;

          setProductosFull(prev =>
            prev.map(prod =>
              prod.id === p.id ? { ...prod, active: nuevo } : prod
            )
          );

          await supabase
            .from("products")
            .update({ active: nuevo })
            .eq("id", p.id);
        }}
      />

      {/* 🔥 ACTIVAR DESCUENTO */}
      <label style={{
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  fontWeight: "bold"
}}>
      <input
        type="checkbox"
        checked={p.discount_active || false}
        onChange={async (e) => {
          const activo = e.target.checked;

setProductosFull(prev =>
  prev.map(prod =>
    prod.id === p.id
      ? {
          ...prod,
          discount_active: activo,
          discount_percent: activo ? prod.discount_percent : 0,
          discount_start: activo ? prod.discount_start : null,
          discount_end: activo ? prod.discount_end : null
        }
      : prod
  )
);

await supabase
  .from("products")
  .update({
       discount_active: activo,
    discount_percent: activo ? (p.discount_percent || 0) : 0,
    discount_start: activo ? p.discount_start : null,
    discount_end: activo ? p.discount_end : null
  })
  .eq("id", p.id);
        }}
      />
</label>

      {/* 💰 % DESCUENTO */}
{p.discount_active && (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

    <input
      type="number"
      placeholder="%"
      value={p.discount_percent ?? ""}
      onChange={(e) => {
  const val = parseInt(e.target.value) || 0;

  setProductosFull(prev =>
    prev.map(prod =>
      prod.id === p.id
        ? { ...prod, discount_percent: val }
        : prod
    )
  );
}}
onBlur={async (e) => {
  const val = parseInt(e.target.value) || 0;

  await supabase
    .from("products")
    .update({ discount_percent: val })
    .eq("id", p.id);
}}
      style={{
        width: 60,
        padding: 4,
        borderRadius: 6,
        border: "1px solid #ddd"
      }}
    />

    {/* 🔥 PORCENTAJE VISUAL */}
    <span style={{
      fontSize: 12,
      fontWeight: "bold",
      color: "#ec4899"
    }}>
      {p.discount_percent ?? 0}%
    </span>

  </div>
)}

      
      {/* 🗑 ELIMINAR PRODUCTO PREMIUM */}
<button
  onClick={async () => {
    if (!confirm("¿Eliminar producto completo?")) return;

    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", p.id);

    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", p.id);

    await supabase
      .from("products")
      .delete()
      .eq("id", p.id);

    setProductosFull(prev =>
      prev.filter(prod => prod.id !== p.id)
    );
  }}

  style={{
    width: 38,
    height: 38,

    borderRadius: 14,

    border: "1px solid rgba(239,68,68,0.15)",

    background:
      "linear-gradient(135deg, #fff5f5, #ffe4e6)",

    color: "#ef4444",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",

    transition: "all .25s ease",

    boxShadow:
      "0 4px 15px rgba(239,68,68,0.08)"
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px) scale(1.05)";

    e.currentTarget.style.boxShadow =
      "0 10px 25px rgba(239,68,68,0.20)";

    e.currentTarget.style.background =
      "linear-gradient(135deg, #ef4444, #ec4899)";

    e.currentTarget.style.color = "#fff";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px) scale(1)";

    e.currentTarget.style.boxShadow =
      "0 4px 15px rgba(239,68,68,0.08)";

    e.currentTarget.style.background =
      "linear-gradient(135deg, #fff5f5, #ffe4e6)";

    e.currentTarget.style.color = "#ef4444";
  }}
>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.3}
    stroke="currentColor"
    style={{
      width: 17,
      height: 17
    }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>

</button>

    </div>

    {/* 🔹 FILA 2: FECHAS (SOLO SI HAY DESCUENTO Y %) */}
{p.discount_active && p.discount_percent > 0 && (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

    <small style={{ fontSize: 10, color: "#666" }}>
      Inicio / Fin
    </small>

    <div style={{ display: "flex", gap: 6 }}>

      {/* ⏱ FECHA INICIO */}
      <input
        type="datetime-local"
        value={p.discount_start ? p.discount_start.slice(0, 16) : ""}
        onChange={async (e) => {
          const val = e.target.value;

          setProductosFull(prev =>
            prev.map(prod =>
              prod.id === p.id
                ? { ...prod, discount_start: val }
                : prod
            )
          );

          await supabase
            .from("products")
            .update({ discount_start: val })
            .eq("id", p.id);
        }}
        style={{
          padding: 4,
          borderRadius: 6,
          border: "1px solid #ddd"
        }}
      />

      {/* ⏱ FECHA FIN */}
      <input
        type="datetime-local"
        value={p.discount_end ? p.discount_end.slice(0, 16) : ""}
        onChange={async (e) => {
          const val = e.target.value;

          setProductosFull(prev =>
            prev.map(prod =>
              prod.id === p.id
                ? { ...prod, discount_end: val }
                : prod
            )
          );

          await supabase
            .from("products")
            .update({ discount_end: val })
            .eq("id", p.id);
        }}
        style={{
          padding: 4,
          borderRadius: 6,
          border: "1px solid #ddd"
        }}
      />

    </div>

    {/* 🔥 ESTADO DESCUENTO */}
    <small style={{
      color: "#ec4899",
      fontWeight: "bold"
    }}>
      {(() => {
        const ahora = new Date();
        const inicio = p.discount_start ? new Date(p.discount_start) : null;
        const fin = p.discount_end ? new Date(p.discount_end) : null;

        const activo =
          (!inicio || ahora >= inicio) &&
          (!fin || ahora <= fin);

        return activo ? "🔥 Activo ahora" : "⏳ Programado";
      })()}
    </small>

  </div>
)}

  </div>
</td>

      {/* PRODUCTO */}
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={p.product_images?.[0]?.url || "/placeholder.png"}
            style={{ width: 40, height: 40, borderRadius: 6 }}
          />
          <span style={{ fontWeight: "bold" }}>{p.name}</span>
        </div>
      </td>

      {/* CATEGORÍA */}
      <td style={{ padding: "10px 12px" }}>
        {p.category}
      </td>

      {/* TALLA */}
      <td style={{ padding: "10px 12px" }}>
        <select
          value={tallaSeleccionada?.id}
          onChange={(e) => {
            const v = variantesOrdenadas.find(
              x => x.id === parseInt(e.target.value)
            );
            setTallaSeleccionada(v);
            setPrecioTemporal(v?.price || "");
          }}
        >
          {variantesOrdenadas.map(v => (
            <option key={v.id} value={v.id}>
              {v.size}
            </option>
          ))}
        </select>
      </td>

      {/* PRECIO */}
      <td style={{ padding: "10px 12px" }}>
        <input
  type="number"
  value={precioTemporal}

  onChange={(e) => {
    setPrecioTemporal(e.target.value);
  }}

    onFocus={(e) => {
    e.target.style.border =
      "1px solid #ec4899";

    e.target.style.boxShadow =
      "0 0 0 4px rgba(236,72,153,0.12)";
  }}

  onBlurCapture={(e) => {
    e.target.style.border =
      "1px solid #f1f5f9";

    e.target.style.boxShadow =
      "0 2px 10px rgba(0,0,0,0.04)";
  }}
          
  onBlur={async () => {

    const nuevo = parseInt(precioTemporal);

    if (isNaN(nuevo)) return;

    setProductosFull(prev =>
      prev.map(prod =>
        prod.id === p.id
          ? {
              ...prod,
              product_variants:
                prod.product_variants.map(v =>
                  v.id === tallaSeleccionada.id
                    ? { ...v, price: nuevo }
                    : v
                )
            }
          : prod
      )
    );

setEstadoGuardado("saving");

await supabase
  .from("product_variants")
  .update({ price: nuevo })
  .eq("id", tallaSeleccionada.id);

setEstadoGuardado("saved");

setTimeout(() => {
  setEstadoGuardado("idle");
}, 1800);

  }}

style={{
  width: 100,

  padding: "10px 12px",

  borderRadius: 14,

  border: "1px solid #f1f5f9",

  background: "#fff",

  fontWeight: "700",
  fontSize: 15,

  outline: "none",

  transition: "all .25s ease",

  boxShadow:
    "0 2px 10px rgba(0,0,0,0.04)"
}}
/>

<div
  style={{
    position: "relative",
    height: 20,
    marginTop: 6
  }}
>

  {/* ⏳ GUARDANDO */}
  <span
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      opacity:
        estadoGuardado === "saving"
          ? 1
          : 0,

      transform:
        estadoGuardado === "saving"
          ? "translateY(0)"
          : "translateY(4px)",

      transition: "all .35s ease",

      color: "#f59e0b",
      fontSize: 12,
      fontWeight: "600"
    }}
  >
    ⏳ Guardando...
  </span>

  {/* ✅ GUARDADO */}
  <span
    style={{
      position: "absolute",
      left: 0,
      top: 0,

      opacity:
        estadoGuardado === "saved"
          ? 1
          : 0,

      transform:
        estadoGuardado === "saved"
          ? "translateY(0)"
          : "translateY(4px)",

      transition: "all .35s ease",

      color: "#22c55e",
      fontSize: 12,
      fontWeight: "700"
    }}
  >
    ✓ Guardado
  </span>

</div>
        
      </td>

      {/* ACCIONES */}
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 6 }}>

          <button
            onClick={async () => {
              if (!confirm("¿Eliminar talla?")) return;

              await supabase
                .from("product_variants")
                .delete()
                .eq("id", tallaSeleccionada.id);

              setProductosFull(prev =>
                prev.map(prod =>
                  prod.id === p.id
                    ? {
                        ...prod,
                        product_variants: prod.product_variants.filter(
                          v => v.id !== tallaSeleccionada.id
                        )
                      }
                    : prod
                )
              );
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>

          <button
            onClick={async () => {
              const size = prompt("Nueva talla");
              const price = prompt("Precio");

              if (!size || !price) return;

              const { data } = await supabase
                .from("product_variants")
                .insert([{
                  product_id: p.id,
                  size,
                  price: parseInt(price)
                }])
                .select()
                .single();

              setProductosFull(prev =>
                prev.map(prod =>
                  prod.id === p.id
                    ? {
                        ...prod,
                        product_variants: [...prod.product_variants, data]
                      }
                    : prod
                )
              );
            }}
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            ➕
          </button>

        </div>
      </td>

    </tr>
  );
}

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

    setProductosFull(data || []);
  };

  const ordenarProductos = (lista) => {
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

  {[...new Set(productosFull.map(p => p.category))].map(cat => (
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
      <th style={{ padding: 12 }}></th>

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
        const variantesOrdenadas = [...p.product_variants].sort((a, b) => {
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

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

          <button
            onClick={async () => {
              if (!confirm("¿Eliminar producto completo?")) return;

              await supabase.from("product_variants").delete().eq("product_id", p.id);
              await supabase.from("product_images").delete().eq("product_id", p.id);
              await supabase.from("products").delete().eq("id", p.id);

              setProductosFull(prev =>
                prev.filter(prod => prod.id !== p.id)
              );
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 6px",
              cursor: "pointer"
            }}
          >
            🗑
          </button>

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
          value={tallaSeleccionada?.price || ""}
          onChange={async (e) => {
            const nuevo = parseInt(e.target.value);

            setProductosFull(prev =>
              prev.map(prod =>
                prod.id === p.id
                  ? {
                      ...prod,
                      product_variants: prod.product_variants.map(v =>
                        v.id === tallaSeleccionada.id
                          ? { ...v, price: nuevo }
                          : v
                      )
                    }
                  : prod
              )
            );

            await supabase
              .from("product_variants")
              .update({ price: nuevo })
              .eq("id", tallaSeleccionada.id);
          }}
          style={{
            width: 80,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #ddd"
          }}
        />
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

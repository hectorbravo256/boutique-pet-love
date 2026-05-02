import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Productos() {

  const [productosFull, setProductosFull] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [toast, setToast] = useState("");

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
      <th style={{ padding: 12, textAlign: "left", fontWeight: "600" }}>Producto</th>
      <th style={{ padding: 12 }}>Categoría</th>
      <th style={{ padding: 12 }}>Talla</th>
      <th style={{ padding: 12 }}>Precio</th>
      <th style={{ padding: 12 }}>Acciones</th>
    </tr>
  </thead>

  <tbody>
    {productosFull
      ?.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase())
      )
      .map((p) => {

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

      {/* ACTIVO */}
<td>
  <label style={{ cursor: "pointer" }}>
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
      style={{
        transform: "scale(1.2)",
        cursor: "pointer"
      }}
    />
  </label>
</td>

      {/* PRODUCTO */}
      <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={p.product_images?.[0]?.url || "/placeholder.png"}
          style={{ width: 40, height: 40, borderRadius: 6 }}
        />
        <span style={{ fontWeight: "bold" }}>{p.name}</span>
      </td>

      {/* CATEGORÍA */}
      <td>{p.category}</td>

      {/* SELECT TALLA */}
      <td>
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
      <td>
        <input
          type="number"
          value={tallaSeleccionada?.price || ""}
          style={{
          width: 80,
          padding: 6,
          borderRadius: 6,
          border: "1px solid #ddd"
        }}
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
          style={{ width: 80 }}
        />
      </td>

      {/* ACCIONES */}
      <td>
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
            padding: "4px 8px"
          }}
        >
          ✕
        </button>
      </td>

    </tr>
  );
}

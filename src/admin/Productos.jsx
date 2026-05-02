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

      {/* 📦 LISTADO */}
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20
}}>
  {productosFull
    ?.filter(p =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase())
    )
    .map((p) => {

      // 🔥 ORDENAR TALLAS (AQUÍ VA LA MAGIA)
      const variantesOrdenadas = [...p.product_variants].sort((a, b) => {
        const numA = parseInt(a.size.replace(/\D/g, ""));
        const numB = parseInt(b.size.replace(/\D/g, ""));
        return numA - numB;
      });

      return (

        <div key={p.id} style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 15,
          marginBottom: 0,
          background: "#fff"
        }}>

          {/* 🖼 IMAGEN */}
          <img
            src={p.product_images?.[0]?.url || "/placeholder.png"}
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 10,
              marginBottom: 10
            }}
          />

          {/* 📝 NOMBRE */}
          <input
            value={p.name}
            onChange={(e) => {
              const value = e.target.value;

              setProductosFull(prev =>
                prev.map(prod =>
                  prod.id === p.id ? { ...prod, name: value } : prod
                )
              );
            }}
            onBlur={async (e) => {
              await supabase
                .from("products")
                .update({ name: e.target.value })
                .eq("id", p.id);

              showToast("✅ Nombre actualizado");
            }}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              fontWeight: "bold"
            }}
          />

          {/* 🏷 CATEGORÍA */}
          <input
            value={p.category || ""}
            placeholder="Categoría"
            onChange={(e) => {
              const value = e.target.value;

              setProductosFull(prev =>
                prev.map(prod =>
                  prod.id === p.id ? { ...prod, category: value } : prod
                )
              );
            }}
            onBlur={async (e) => {
              await supabase
                .from("products")
                .update({ category: e.target.value })
                .eq("id", p.id);

              showToast("🏷 Categoría actualizada");
            }}
            style={{
              width: "100%",
              marginBottom: 10,
              padding: 6
            }}
          />

          {/* 🔘 ACTIVO */}
          <label style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={p.active}
              onChange={async (e) => {
                const nuevoEstado = e.target.checked;

                setProductosFull(prev =>
                  prev.map(prod =>
                    prod.id === p.id
                      ? { ...prod, active: nuevoEstado }
                      : prod
                  )
                );

                await supabase
                  .from("products")
                  .update({ active: nuevoEstado })
                  .eq("id", p.id);
              }}
            />
            Activo
          </label>

          {/* 🗑 ELIMINAR */}
          <button
            onClick={async () => {
              if (!confirm("¿Eliminar producto?")) return;

              setProductosFull(prev =>
                prev.filter(prod => prod.id !== p.id)
              );

              await supabase.from("product_variants").delete().eq("product_id", p.id);
              await supabase.from("product_images").delete().eq("product_id", p.id);
              await supabase.from("products").delete().eq("id", p.id);

              showToast("🗑 Producto eliminado");
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 6,
              border: "none",
              marginBottom: 10,
              cursor: "pointer"
            }}
          >
            Eliminar
          </button>

          {/* 📏 VARIANTES */}
          <div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 10
}}>
  {variantesOrdenadas.map((v) => (
    <div key={v.id} style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      background: "#f3f4f6",
      padding: "4px 6px",
      borderRadius: 6,
      fontSize: 12
    }}>

      <span style={{ fontWeight: "bold" }}>{v.size}</span>

      <input
        type="number"
        defaultValue={v.price}
        style={{ width: 60, fontSize: 12 }}
        onChange={async (e) => {
          const nuevo = parseInt(e.target.value);

          setProductosFull(prev =>
            prev.map(prod =>
              prod.id === p.id
                ? {
                    ...prod,
                    product_variants: prod.product_variants.map(varr =>
                      varr.id === v.id
                        ? { ...varr, price: nuevo }
                        : varr
                    )
                  }
                : prod
            )
          );

          await supabase
            .from("product_variants")
            .update({ price: nuevo })
            .eq("id", v.id);
        }}
      />

      <button
        onClick={async () => {
          if (!confirm("¿Eliminar talla?")) return;

          setProductosFull(prev =>
            prev.map(prod =>
              prod.id === p.id
                ? {
                    ...prod,
                    product_variants: prod.product_variants.filter(vv => vv.id !== v.id)
                  }
                : prod
            )
          );

          await supabase
            .from("product_variants")
            .delete()
            .eq("id", v.id);

          showToast("🗑 Talla eliminada");
        }}
        style={{
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        ✕
      </button>

    </div>
  ))}
</div>

          {/* ➕ AGREGAR TALLA */}
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Nueva talla"
              id={`size-${p.id}`}
              style={{ marginRight: 5 }}
            />
            <input
              type="number"
              placeholder="Precio"
              id={`price-${p.id}`}
              style={{ marginRight: 5, width: 90 }}
            />

            <button
              onClick={async () => {
                const size = document.getElementById(`size-${p.id}`).value;
                const price = document.getElementById(`price-${p.id}`).value;

                if (!size || !price) {
                  showToast("⚠️ Completa datos");
                  return;
                }

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

                showToast("✅ Talla agregada");
              }}
            >
              ➕
            </button>
          </div>

                </div>
      );
    })}
</div>

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

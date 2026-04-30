import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Admin() {
  
  const [orders, setOrders] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [stockTemp, setStockTemp] = useState({});
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [productosFull, setProductosFull] = useState([]);
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
const [newProduct, setNewProduct] = useState({
  name: "",
  category: "",
  image: "",
  variants: [
    { size: "Talla 1", price: "" }
  ]
});
  const [searchProduct, setSearchProduct] = useState("");
  const [toast, setToast] = useState("");

useEffect(() => {
  const cargarProductos = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name");

    const map = {};
    data?.forEach((p) => {
      map[p.id] = p.name;
    });

    setProductos(map);
  };

  cargarProductos();
}, []);

useEffect(() => {
  const timeout = setTimeout(() => {
    setBusquedaDebounce(busqueda);
  }, 300);

  return () => clearTimeout(timeout);
}, [busqueda]);

  useEffect(() => {
    fetch("/.netlify/functions/get-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

useEffect(() => {
  const cargarStock = async () => {
    const { data } = await supabase
      .from("product_stock")
      .select("*");

    setStock(data || []);
  };

  cargarStock();
}, []);

useEffect(() => {
  recargarProductos();
}, []);

const cambiarEstado = async (id) => {

  console.log("CLICK ENVIADO:", id);

	const showToast = (msg) => {
  setToast(msg);
  setTimeout(() => setToast(""), 2500);
};


  // 🔍 1. Obtener pedido
  const resPedido = await fetch("/.netlify/functions/get-orders");
  const pedidos = await resPedido.json();

  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) {
    alert("Pedido no encontrado");
    return;
  }

  // 🛑 evitar doble descuento
  if (pedido.estado === "enviado") {
    alert("Ya fue enviado");
    return;
  }

  // 🔥 2. DESCONTAR STOCK
  for (const item of pedido.items) {

    console.log("ITEM:", item);

    const { error } = await supabase.rpc("descontar_stock", {
      p_id: item.product_id || item.id, // 🔥 IMPORTANTE
      p_size: item.size,
      cantidad: item.qty || 1,
    });

    if (error) {
      console.log("❌ ERROR STOCK:", error);
    } else {
      console.log("✅ STOCK DESCONTADO");
    }
  }

  // 📦 3. Cambiar estado
  await fetch("/.netlify/functions/update-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      estado: "enviado",
    }),
  });

  // 🔄 4. Refrescar lista
  const res = await fetch("/.netlify/functions/get-orders");
  const data = await res.json();
  setOrders(data);
};

const actualizarStock = async (id, nuevoStock) => {
  const { error } = await supabase
    .from("product_stock")
    .update({ stock: nuevoStock })
    .eq("id", id);

  if (error) {
    console.log("❌ ERROR:", error);
    return;
  }

  // actualizar local
  setStock((prev) =>
    prev.map((s) =>
      s.id === id ? { ...s, stock: nuevoStock } : s
    )
  );

  // limpiar temp
  setStockTemp((prev) => {
    const nuevo = { ...prev };
    delete nuevo[id];
    return nuevo;
  });
};

	const crearProducto = async () => {
  if (!newProduct.name || newProduct.variants.length === 0) {
  showToast("⚠️ Completa el nombre y al menos una talla");
  return;
}

  // 1. Crear producto
  const { data: prod, error: errProd } = await supabase
    .from("products")
    .insert([{
      name: newProduct.name,
      category: newProduct.category,
      active: true
    }])
    .select()
    .single();

  if (errProd) {
    showToast("❌ Error creando producto");
    return;
  }

  // 2. Crear variante (talla + precio)
const variantsToInsert = newProduct.variants
  .filter(v => v.size && v.price)
  .map(v => ({
    product_id: prod.id,
    size: v.size,
    price: parseInt(v.price)
  }));

if (variantsToInsert.length === 0) {
  showToast("⚠️ Debes ingresar al menos una talla con precio");
  return;
}

const { error: errVar } = await supabase
  .from("product_variants")
  .insert(variantsToInsert);

if (errVar) {
  showToast("❌ Error creando tallas");
  return;
}

  if (errVar) {
    showToast("❌ Error creando variante");
    return;
  }

  // 3. Imagen (opcional)
  if (newProduct.image) {
    await supabase
      .from("product_images")
      .insert([{
        product_id: prod.id,
        url: newProduct.image
      }]);
  }
 
// 🔥 4. TRAER PRODUCTO COMPLETO
const { data: productoCompleto } = await supabase
  .from("products")
  .select(`
    *,
    product_variants (*),
    product_images (*)
  `)
  .eq("id", prod.id)
  .single();

		  if (errFetch || !productoCompleto) {
    showToast("⚠️ Creado, pero no se pudo actualizar la vista");
    return;
  }

 // 🔥 5. ACTUALIZAR UI INMEDIATO
setProductosFull(prev =>
  [...prev, productoCompleto].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
);

  // 6. Limpiar formulario
setNewProduct({
  name: "",
  category: "",
  image: "",
  variants: [{ size: "Talla 1", price: "" }]
});
		showToast("✅ Producto creado");
};

const totalVentas = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
const totalPedidos = orders.length;
const pendientes = orders.filter(o => o.estado === "pendiente").length;
const enviados = orders.filter(o => o.estado === "enviado").length;



const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const dataGrafico = useMemo(() => {
  const ventasPorDia = {};

  orders.forEach((o) => {
    const fecha = o.created_at
  ? new Date(o.created_at).toLocaleDateString("es-CL")
  : "Sin fecha";

    if (!ventasPorDia[fecha]) {
      ventasPorDia[fecha] = 0;
    }

    ventasPorDia[fecha] += Number(o.total || 0);
  });

  const data = Object.keys(ventasPorDia).map((fecha) => ({
    fecha,
    total: ventasPorDia[fecha],
  }));

data.sort((a, b) => {
  if (a.fecha === "Sin fecha") return 1;
  if (b.fecha === "Sin fecha") return -1;

  const [d1, m1, y1] = a.fecha.split("/");
  const [d2, m2, y2] = b.fecha.split("/");

  return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
});

  return data;
}, [orders]);

const btnFiltro = (activo) => ({
  padding: "10px 16px",
  marginRight: 10,
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s ease",

  background: activo ? "#ec4899" : "#f3f4f6",
  color: activo ? "white" : "#333",
boxShadow: activo ? "0 4px 10px rgba(236,72,153,0.3)" : "none"

});

const pedidosOrdenados = [...orders].sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
);


const resaltar = (texto) => {
  if (!busquedaDebounce) return texto;

  const partes = texto.split(
    new RegExp(`(${busquedaDebounce})`, "gi")
  );

  return partes.map((parte, i) =>
    parte.toLowerCase() === busquedaDebounce.toLowerCase() ? (
      <span key={i} style={{ background: "#fde68a" }}>
        {parte}
      </span>
    ) : (
      parte
    )
  );
};

const stockOrdenado = [...stock].sort((a, b) =>
  (productos[a.product_id] || "").localeCompare(productos[b.product_id] || "") ||
  a.size.localeCompare(b.size, undefined, { numeric: true })
);




const stockFiltrado = stockOrdenado.filter((item) =>
  (productos[item.product_id] || "")
    .toLowerCase()
    .includes(search.toLowerCase())
);

const hoverAnim = {
  onMouseEnter: (e, shadow) => {
    e.currentTarget.style.transform = "scale(1.08)";
    e.currentTarget.style.boxShadow = shadow;
  },
  onMouseLeave: (e, shadow) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = shadow;
  },
  onMouseDown: (e) => {
    e.currentTarget.style.transform = "scale(0.95)";
  },
  onMouseUp: (e, shadow) => {
    e.currentTarget.style.transform = "scale(1.08)";
    e.currentTarget.style.boxShadow = shadow;
  }
};


  return (
    <div style={{ padding: 40 }}>
      <h1 style={{
  fontSize: "34px",
  fontWeight: "900",
  marginBottom: "25px",
  background: "linear-gradient(90deg, #ec4899, #f97316)",
  WebkitBackgroundClip: "text",
  color: "transparent"
}}>
  📦 Panel de pedidos
</h1>

{/* 📦 PANEL STOCK */}

<div style={{
  marginBottom: 30,
  padding: 20,
  background: "#fafafa",
  borderRadius: 12
}}>
<h2>📦 Gestión de Stock</h2>


<input
  type="text"
  placeholder="🔍 Buscar producto..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
  width: "100%",
  padding: 10,
  marginBottom: 15,
  borderRadius: 8,
  border: "1px solid #ddd",
  textAlign: "center",
  fontSize: 18,
  fontWeight: "bold"
}}
/>

<button
  disabled={loading}
  onClick={async () => {
 	try {
	setLoading(true);

    const updates = Object.entries(stockTemp).map(([id, stock]) => ({
      id: Number(id),
      stock,
    }));

    if (!updates.length) {
      console.log("Sin cambios");
      return;
    }

    const results = await Promise.all(
  updates.map((u) =>
    supabase
      .from("product_stock")
      .update({ stock: u.stock })
      .eq("id", u.id)
  )
);

// validar errores
const hasError = results.some((r) => r.error);

if (hasError) {
  console.log("❌ Error al guardar");
  return;
}

    setStock((prev) =>
      prev.map((item) => {
        const nuevo = updates.find((u) => u.id === item.id);
        return nuevo ? { ...item, stock: nuevo.stock } : item;
      })
    );

    setStockTemp({});
    alert("✅ Stock actualizado");

} catch (err) {
    console.log("❌ ERROR GENERAL:", err);
  } finally {
    setLoading(false);
  }

  }}
  style={{
    marginBottom: 15,
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: loading ? 0.6 : 1
  }}
>
  {loading ? "⏳ Guardando..." : "💾 Guardar todos los cambios"}
</button>

{Object.keys(stockTemp).length > 0 && (
 <p style={{
  color: Object.keys(stockTemp).length > 5 ? "red" : "#f59e0b",
  fontWeight: "bold",
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "#fff",
  padding: "8px",
  borderRadius: "6px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>
  ⚠️ Cambios sin guardar ({Object.keys(stockTemp).length})
</p>
)}


<table style={{
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 15
}}>
  <thead>
    <tr style={{ background: "#fce7f3" }}>
      <th style={{ padding: 10, textAlign: "left" }}>Producto</th>
      <th style={{ padding: 10, textAlign: "left" }}>Talla</th>
      <th style={{ padding: 10 }}>Stock</th>
      <th style={{ padding: 10 }}>Acciones</th>
    </tr>
  </thead>

<tbody>
  {stockFiltrado.map((item) => (
    <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>

      {/* PRODUCTO */}
      <td style={{ padding: 10 }}>
        {productos[item.product_id] || "Producto"}
      </td>

      {/* TALLA */}
      <td style={{ padding: 10 }}>
        {item.size}
      </td>

      {/* STOCK */}
     <td style={{
  padding: 10,
  textAlign: "center"
}}>
        <div style={{ display: "flex",
			justifyContent: "center",
			alignItems: "center",
			gap: 6 }}>

          {stockTemp[item.id] !== undefined && (
            <span style={{ color: "#f59e0b", fontSize: 12 }}>
              ✏️
            </span>
          )}

          <input
  type="number"
  min="0"
            value={stockTemp[item.id] ?? item.stock}
            onChange={(e) =>
              setStockTemp((prev) => ({
                ...prev,
                [item.id]: Math.max(parseInt(e.target.value) || 0, 0),
              }))
            }
            style={{
              width: 60,
              padding: 6,
	      fontSize: 16,
	      fontWeight: "bold",
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />
        </div>
      </td>

      {/* ACCIONES */}
      <td style={{
  padding: 10,
  textAlign: "center"
}}>

  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  }}>

    {/* BOTÓN + */}
    <button
  onClick={() =>
    actualizarStock(
      item.id,
      (stockTemp[item.id] ?? item.stock) + 1
    )
  }
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(34,197,94,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
    transition: "all 0.2s ease"
  }}
>
  +
</button>

    {/* BOTÓN - */}
    <button
  onClick={() =>
    actualizarStock(
      item.id,
      Math.max((stockTemp[item.id] ?? item.stock) - 1, 0)
    )
  }
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(239,68,68,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(239,68,68,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(239,68,68,0.4)")
  }
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
    transition: "all 0.2s ease"
  }}
>
  −
</button>

    {/* BOTÓN GUARDAR */}
    <button
  onClick={() =>
    actualizarStock(
      item.id,
      stockTemp[item.id] ?? item.stock
    )
  }
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(59,130,246,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(59,130,246,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(59,130,246,0.4)")
  }
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
    transition: "all 0.2s ease"
  }}
>
  💾
</button>

  </div>

</td>

    </tr>
  ))}
</tbody>

</table>

</div>

<input
  placeholder="🔍 Buscar producto..."
  value={searchProduct}
  onChange={(e) => setSearchProduct(e.target.value)}
  style={{
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #ddd"
  }}
/>		
		
<div style={{
  marginTop: 40,
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
}}>

	<div style={{
  marginBottom: 20,
  padding: 15,
  background: "#f9fafb",
  borderRadius: 12,
  border: "1px solid #eee"
}}>
  <h3 style={{ marginBottom: 10 }}>➕ Crear nuevo producto</h3>

  <input
    placeholder="Nombre"
    value={newProduct.name}
    onChange={(e) =>
      setNewProduct({ ...newProduct, name: e.target.value })
    }
    style={{ width: "100%", marginBottom: 8, padding: 6 }}
  />

  <input
    placeholder="Categoría"
    value={newProduct.category}
    onChange={(e) =>
      setNewProduct({ ...newProduct, category: e.target.value })
    }
    style={{ width: "100%", marginBottom: 8, padding: 6 }}
  />

  {newProduct.variants.map((v, index) => (
  <div key={index} style={{
    display: "flex",
    gap: 8,
    marginBottom: 6
  }}>

    {/* TALLA */}
    <input
      placeholder="Talla"
      value={v.size}
      onChange={(e) => {
        const updated = [...newProduct.variants];
        updated[index].size = e.target.value;
        setNewProduct({ ...newProduct, variants: updated });
      }}
      style={{ padding: 6 }}
    />

    {/* PRECIO */}
    <input
      type="number"
      placeholder="Precio"
      value={v.price}
      onChange={(e) => {
        const updated = [...newProduct.variants];
        updated[index].price = e.target.value;
        setNewProduct({ ...newProduct, variants: updated });
      }}
      style={{ padding: 6, width: 100 }}
    />

    {/* ELIMINAR FILA */}
    <button
      onClick={() => {
        const updated = newProduct.variants.filter((_, i) => i !== index);
        setNewProduct({ ...newProduct, variants: updated });
      }}
      style={{
        background: "#ef4444",
        color: "#fff",
        border: "none",
        padding: "4px 8px",
        borderRadius: 6,
        cursor: "pointer"
      }}
    >
      ✕
    </button>

  </div>
))}

{/* BOTÓN AGREGAR TALLA */}
<button
  onClick={() => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { size: "", price: "" }]
    });
  }}
  style={{
    background: "#3b82f6",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    marginTop: 5,
    cursor: "pointer"
  }}
>
  ➕ Agregar talla
</button>

		<button
  onClick={() => {
    const tallas = [];

    for (let i = 0; i <= 12; i++) {
      tallas.push({
        size: `Talla ${i}`,
        price: ""
      });
    }

    setNewProduct({
      ...newProduct,
      variants: tallas
    });
  }}
  style={{
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    marginTop: 10,
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  ⚡ Generar tallas 0–12
</button>
		
  <input
    placeholder="URL Imagen (opcional)"
    value={newProduct.image}
    onChange={(e) =>
      setNewProduct({ ...newProduct, image: e.target.value })
    }
    style={{ width: "100%", marginBottom: 10, padding: 6 }}
  />

  <button
    onClick={crearProducto}
    style={{
      background: "#22c55e",
      color: "#fff",
      padding: "8px 14px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    Crear producto
  </button>
</div>
	

  <h2 style={{
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  }}>
    🛒 Editor de Productos
  </h2>

  <div style={{
    display: "grid",
    gap: 15
  }}>

    {productosFull
  ?.filter(p =>
  p.name.toLowerCase().trim().includes(searchProduct.toLowerCase().trim())
)
  .map((p) => (
      <div key={p.id} style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 15,
        background: "#fafafa"
      }}>

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
        {/* NOMBRE */}
        <input
  defaultValue={p.name}
  onBlur={async (e) => {
    const { error } = await supabase
      .from("products")
      .update({ name: e.target.value })
      .eq("id", p.id);

    if (!error) showToast("✏️ Nombre actualizado");
  }}
  style={{
    fontSize: 16,
    fontWeight: "bold",
    padding: 6,
    width: "100%",
    marginBottom: 8
  }}
/>

		  <input
  defaultValue={p.category || ""}
  placeholder="Categoría"
  onBlur={async (e) => {
    const { error } = await supabase
      .from("products")
      .update({ category: e.target.value })
      .eq("id", p.id);

    if (!error) showToast("🏷 Categoría actualizada");
  }}
  style={{
    padding: 6,
    width: "100%",
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc"
  }}
/>
		  
        {/* ACTIVO */}
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          fontWeight: "bold"
        }}>
          <input
            type="checkbox"
            checked={p.active}
onChange={async (e) => {
  const nuevoEstado = e.target.checked;

  // 🔥 UI inmediata
  setProductosFull(prev =>
    prev.map(prod =>
      prod.id === p.id
        ? { ...prod, active: nuevoEstado }
        : prod
    )
  );

  // 🔥 guardar en BD
  const { error } = await supabase
    .from("products")
    .update({ active: nuevoEstado })
    .eq("id", p.id);

  if (error) showToast("❌ Error");
}}
          />
          Activo
        </label>

		  <button
onClick={async () => {
  if (!confirm("¿Eliminar producto?")) return;

  // 🔥 eliminar UI primero
  setProductosFull(prev =>
    prev.filter(prod => prod.id !== p.id)
  );

  await supabase.from("product_variants").delete().eq("product_id", p.id);
  await supabase.from("product_images").delete().eq("product_id", p.id);
  await supabase.from("products").delete().eq("id", p.id);

  showToast("🗑 Producto eliminado");
}}
  style={{
    background: "linear-gradient(135deg, #ef4444, #b91c1c)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(239,68,68,0.3)",
    transition: "all 0.2s"
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
>
  🗑 Eliminar
</button>
		  
        {/* VARIANTES */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12
        }}>

          {[...p.product_variants]
  .sort((a, b) => {
    const numA = parseInt(a.size.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.size.match(/\d+/)?.[0] || 0);
    return numA - numB;
  })
  .map((v) => (
  <div key={v.id} style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  }}>

    <span style={{ minWidth: 80 }}>{v.size}</span>

    <input
      type="number"
      defaultValue={v.price}
onChange={async (e) => {
  const nuevo = parseInt(e.target.value);

  // 🔥 UI inmediata
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
      style={{ width: 90, padding: 5 }}
    />

    {/* 🔥 BOTÓN ELIMINAR TALLA */}
    <button
onClick={async () => {
  if (!confirm("¿Eliminar talla?")) return;

  // 🔥 eliminar UI inmediato
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
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    width: 34,
    height: 34,
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "all 0.2s"
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
>
  ✕
</button>
  </div>
))}

			<div style={{ marginTop: 10 }}>
  <input
    placeholder="Nueva talla (ej: Talla 5)"
    id={`size-${p.id}`}
    style={{ padding: 5, marginRight: 5 }}
  />

  <input
    type="number"
    placeholder="Precio"
    id={`price-${p.id}`}
    style={{ padding: 5, marginRight: 5, width: 90 }}
  />

  <button
onClick={async () => {
  const size = document.getElementById(`size-${p.id}`).value;
  const price = document.getElementById(`price-${p.id}`).value;

  if (!size || !price) {
    showToast("⚠️ Completa datos");
    return;
  }

  const { data, error } = await supabase
    .from("product_variants")
    .insert([{
      product_id: p.id,
      size,
      price: parseInt(price)
    }])
    .select()
    .single();

  if (error) {
    showToast("❌ Error");
    return;
  }

  // 🔥 agregar al estado sin recargar
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
      style={{
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 4px 10px rgba(59,130,246,0.3)",
    transition: "all 0.2s"
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
>
  ➕ Agregar
</button>
</div>

        </div>

      </div>
    ))}

  </div>
</div>
  

<div style={{
  position: "absolute",
  top: 40,
  right: 200,
  background: "#fff",
  padding: 10,
  borderRadius: 10,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
}}>
  <p style={{ fontWeight: "bold", marginBottom: 5 }}>
    🔑 Cambiar contraseña
  </p>

  <input
    type="password"
    placeholder="Nueva contraseña"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    style={{
      padding: 6,
      borderRadius: 6,
      border: "1px solid #ccc",
      marginRight: 5
    }}
  />

  <button
    onClick={async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        alert("❌ " + error.message);
      } else {
        alert("✅ Contraseña actualizada");
        setNewPassword("");
      }
    }}
    style={{
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "6px 10px",
      borderRadius: 6,
      cursor: "pointer"
    }}
  >
    Guardar
  </button>
</div>

<button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }}
  style={{
    position: "absolute",
    top: 40,
    right: 40,

    background: "linear-gradient(135deg, #ec4899, #db2777)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(236,72,153,0.4)",
    transition: "all 0.2s ease"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🚪 Cerrar sesión
</button>

<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 15,
  marginBottom: 30
}}>


  <div style={card}>
    <p>💰 Ventas</p>
    <h2>${totalVentas.toLocaleString("es-CL")}</h2>
  </div>

  <div style={card}>
    <p>📦 Pedidos</p>
    <h2>{totalPedidos}</h2>
  </div>

  <div style={card}>
    <p>⏳ Pendientes</p>
    <h2>{pendientes}</h2>
  </div>

  <div style={card}>
    <p>✅ Enviados</p>
    <h2>{enviados}</h2>
  </div>

</div>

{/* 📈 GRÁFICO DE VENTAS */}
<div style={{
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  marginBottom: 30
}}>
  <h3>📈 Ventas por día</h3>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={dataGrafico}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="fecha" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" stroke="#ec4899" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
</div>


{/* 🔍 BUSCADOR */}
<input
  placeholder="🔍 Buscar cliente, correo, RUT o comuna..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none"
  }}
/>



<div style={{ marginBottom: 20 }}>


  <button
    onClick={() => setFiltro("todos")}
    style={btnFiltro(filtro === "todos")}
    onMouseEnter={(e) => {
      if (filtro !== "todos") e.currentTarget.style.background = "#e5e7eb";
    }}
    onMouseLeave={(e) => {
      if (filtro !== "todos") e.currentTarget.style.background = "#f3f4f6";
    }}
  >
    Todos ({totalPedidos})
  </button>

  <button
    onClick={() => setFiltro("pendiente")}
    style={btnFiltro(filtro === "pendiente")}
    onMouseEnter={(e) => {
      if (filtro !== "pendiente") e.currentTarget.style.background = "#fde2f3";
    }}
    onMouseLeave={(e) => {
      if (filtro !== "pendiente") e.currentTarget.style.background = "#f3f4f6";
    }}
  >
    Pendientes ({pendientes})
  </button>

  <button
    onClick={() => setFiltro("enviado")}
    style={btnFiltro(filtro === "enviado")}
    onMouseEnter={(e) => {
      if (filtro !== "enviado") e.currentTarget.style.background = "#dcfce7";
    }}
    onMouseLeave={(e) => {
      if (filtro !== "enviado") e.currentTarget.style.background = "#f3f4f6";
    }}
  >
    Enviados ({enviados})
  </button>

</div>

      {pedidosOrdenados
  .filter((o) => {
    if (filtro === "todos") return true;
    return o.estado === filtro;
  }).map((o) => (
        <div key={o.id} style={{
          background: "#fff",
          padding: 15,
          marginBottom: 15,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
	  <p><strong>Producto:</strong> {o.items?.[0]?.name}</p>
          <p><strong>Nombre:</strong> {resaltar(o.nombre)}</p>
	  <p><strong>RUT:</strong> {resaltar(o.rut)}</p>
          <p><strong>Correo:</strong> {resaltar(o.correo)}</p>
	  <p><strong>Teléfono:</strong> {resaltar(o.telefono)}</p>
          <p><strong>Dirección:</strong> {resaltar(o.direccion)}</p>
	  <p><strong>Comuna:</strong> {resaltar(o.comuna)}</p>
	  <p><strong>Región:</strong> {resaltar(o.region)}</p>

	  <p>
  	   <strong>Observación:</strong>{" "}
  	   {o.observacion ? o.observacion : "Sin observaciones"}
	 </p>

         <h4>Productos:</h4>

		{o.items?.length ? (
 		 o.items.map((i, idx) => (
  		  <p key={idx}>
    		  {i.name} x{i.qty || 1}
    		</p>
  		))
		) : (
 		 <p>Sin productos</p>
		)}

          <p><strong>Total:</strong> ${Number(o.total).toLocaleString("es-CL")}</p>

          <p style={{
  color: o.estado === "pendiente" ? "orange" : "green",
  fontWeight: "bold"
}}>
  Estado: {o.estado || "pendiente"}
</p>

{(o.estado || "pendiente") === "pendiente" && (
  <button
  onClick={() => cambiarEstado(o.id)}
  {...hoverAnim}
  onMouseEnter={(e) =>
    hoverAnim.onMouseEnter(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  onMouseLeave={(e) =>
    hoverAnim.onMouseLeave(e, "0 4px 12px rgba(34,197,94,0.3)")
  }
  onMouseUp={(e) =>
    hoverAnim.onMouseUp(e, "0 8px 20px rgba(34,197,94,0.4)")
  }
  style={{
    marginTop: 10,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
    transition: "all 0.2s ease"
  }}
>
  📦 Marcar como enviado
</button>
)}
        </div>
      ))}

		{toast && (
  <div style={{
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "#111",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  }}>
    {toast}
  </div>
)}
		
    </div>
  );
}

import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CrearProducto() {

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    image: "",
    variants: [{ size: "Talla 1", price: "" }]
  });

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // 🔥 crear producto completo
  const crearProducto = async () => {

    if (!newProduct.name || newProduct.variants.length === 0) {
      showToast("⚠️ Completa el nombre y al menos una talla");
      return;
    }

    // 1. producto
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

    // 2. variantes
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

    // 3. imagen
    if (newProduct.image) {
      await supabase
        .from("product_images")
        .insert([{
          product_id: prod.id,
          url: newProduct.image
        }]);
    }

    showToast("✅ Producto creado");

    // 🔄 reset completo
    setNewProduct({
      name: "",
      category: "",
      image: "",
      variants: [{ size: "Talla 1", price: "" }]
    });

    // 🎯 foco automático
    setTimeout(() => {
      document.querySelector('input[placeholder="Nombre"]')?.focus();
    }, 0);
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: "auto",
      background: "#fff",
      padding: 20,
      borderRadius: 16,
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
    }}>

      <h2>➕ Crear nuevo producto</h2>

      {/* 📝 NOMBRE */}
      <input
        placeholder="Nombre"
        value={newProduct.name}
        onChange={(e) =>
          setNewProduct(prev => ({
            ...prev,
            name: e.target.value
          }))
        }
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />

      {/* 🏷 CATEGORÍA */}
      <input
        placeholder="Categoría"
        value={newProduct.category}
        onChange={(e) =>
          setNewProduct(prev => ({
            ...prev,
            category: e.target.value
          }))
        }
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />

      {/* 📏 VARIANTES */}
      {newProduct.variants.map((v, index) => (
        <div key={index} style={{
          display: "flex",
          gap: 8,
          marginBottom: 6
        }}>

          {/* talla */}
          <input
            placeholder="Talla"
            value={v.size}
            onChange={(e) => {
              const updated = [...newProduct.variants];
              updated[index].size = e.target.value;

              setNewProduct(prev => ({
                ...prev,
                variants: updated
              }));
            }}
          />

          {/* precio */}
          <input
            type="number"
            placeholder="Precio"
            value={v.price}
            onChange={(e) => {
              const updated = [...newProduct.variants];
              updated[index].price = e.target.value;

              setNewProduct(prev => ({
                ...prev,
                variants: updated
              }));
            }}
            style={{ width: 100 }}
          />

          {/* eliminar */}
          <button
            onClick={() => {
              setNewProduct(prev => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index)
              }));
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              borderRadius: 6
            }}
          >
            ✕
          </button>

        </div>
      ))}

      {/* ➕ agregar talla */}
      <button
        onClick={() => {
          setNewProduct(prev => ({
            ...prev,
            variants: [...prev.variants, { size: "", price: "" }]
          }));
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

      {/* ⚡ generar tallas */}
      <button
        onClick={() => {
          const tallas = [];
          for (let i = 0; i <= 12; i++) {
            tallas.push({
              size: `Talla ${i}`,
              price: ""
            });
          }

          setNewProduct(prev => ({
            ...prev,
            variants: tallas
          }));
        }}
        style={{
          background: "#10b981",
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

      {/* 🖼 IMAGEN */}
      <input
        placeholder="URL Imagen (opcional)"
        value={newProduct.image}
        onChange={(e) =>
          setNewProduct(prev => ({
            ...prev,
            image: e.target.value
          }))
        }
        style={{ width: "100%", marginTop: 10, padding: 8 }}
      />

      {/* 🚀 CREAR */}
      <button
        onClick={crearProducto}
        style={{
          width: "100%",
          marginTop: 15,
          background: "#22c55e",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Crear producto
      </button>

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

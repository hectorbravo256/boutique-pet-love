import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CrearProducto() {
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    variants: [{ size: "", price: "" }]
  });

  const crearProducto = async () => {
    const { data: prod } = await supabase
      .from("products")
      .insert([{ name: newProduct.name, category: newProduct.category }])
      .select()
      .single();

    await supabase.from("product_variants").insert(
      newProduct.variants.map(v => ({
        product_id: prod.id,
        size: v.size,
        price: parseInt(v.price)
      }))
    );

    alert("Producto creado");
  };

  return (
    <div>
      <h1>➕ Crear Producto</h1>

      <input
        placeholder="Nombre"
        onChange={(e) =>
          setNewProduct(prev => ({ ...prev, name: e.target.value }))
        }
      />

      <button onClick={crearProducto}>Crear</button>
    </div>
  );
}

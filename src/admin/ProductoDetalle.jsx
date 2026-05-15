import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import {
  CSS
} from "@dnd-kit/utilities";


function SortableImage({
  img,
  index,
  eliminarImagen
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: img.id
  });

  const style = {
    transform:
      CSS.Transform.toString(transform),

    transition
  };

  return (

    <div
      ref={setNodeRef}

      style={{
        ...style,

        position: "relative",

        borderRadius: 22,

        overflow: "hidden",

        background: "#f9fafb",

        border:
          "1px solid #f3f4f6",

        boxShadow:
          "0 6px 18px rgba(0,0,0,0.04)"
      }}
    >

      {/* drag handle */}
      <div
        {...attributes}
        {...listeners}

        style={{
          position: "absolute",

          top: 12,
          left: 12,

          zIndex: 10,

          background:
            "rgba(255,255,255,0.92)",

          width: 36,
          height: 36,

          borderRadius: 12,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          cursor: "grab",

          fontWeight: "700"
        }}
      >
        ⋮⋮
      </div>

      {/* imagen */}
      <img
        src={img.url}

        style={{
          width: "100%",
          height: 220,
          objectFit: "cover"
        }}
      />

      {/* portada */}
      {index === 0 && (

        <div
          style={{
            position: "absolute",

            bottom: 12,
            left: 12,

            background:
              "#111827",

            color: "#fff",

            padding: "6px 12px",

            borderRadius: 999,

            fontSize: 11,

            fontWeight: "700"
          }}
        >
          Portada
        </div>

      )}

      {/* eliminar */}
      <button
        onClick={() =>
          eliminarImagen(img.id)
        }

        style={{
          position: "absolute",

          top: 12,
          right: 12,

          width: 36,
          height: 36,

          borderRadius: 12,

          border: "none",

          background:
            "rgba(255,255,255,0.92)",

          color: "#ef4444",

          fontWeight: "700",

          cursor: "pointer"
        }}
      >
        ✕
      </button>

    </div>

  );

}

export default function ProductoDetalle() {

  const { id } = useParams();

  const [producto, setProducto] = useState(null);

  const [guardandoInfo, setGuardandoInfo] =
  useState(false);

  const [estadoGuardado, setEstadoGuardado] =
    useState({});
  
  const [mostrarModal, setMostrarModal] =
  useState(false);

const [nuevaTalla, setNuevaTalla] =
  useState("");

const [nuevoPrecio, setNuevoPrecio] =
  useState("");

const [nuevoStock, setNuevoStock] =
  useState("");

  const [subiendoImagen, setSubiendoImagen] =
  useState(false);

  // 🔄 cargar producto
  useEffect(() => {

    cargarProducto();

  }, [id]);

  const cargarProducto = async () => {

    const { data } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq("id", id)
      .order("sort_order", {
  foreignTable: "product_images",
  ascending: true
})
      .single();

    if (!data) return;

    if (!data.slug) {

  data.slug =
    generarSlug(data.name);

}

if (!data.meta_title) {

  data.meta_title =
    data.name;

}

if (!data.meta_description) {

  data.meta_description =
    data.description || "";

}

    const ordenTallas = {
      XXS: 1,
      XS: 2,
      S: 3,
      M: 4,
      L: 5,
      XL: 6,
      XXL: 7,
      XXXL: 8,

      "TALLA 0": 20,
      "TALLA 1": 21,
      "TALLA 2": 22,
      "TALLA 3": 23,
      "TALLA 4": 24,
      "TALLA 5": 25,
      "TALLA 6": 26,
      "TALLA 7": 27,
      "TALLA 8": 28,
      "TALLA 9": 29,
      "TALLA 10": 30,
      "TALLA 11": 31,
      "TALLA 12": 32
    };

    data.product_variants.sort((a, b) => {

      const tallaA =
        ordenTallas[
          a.size?.trim().toUpperCase()
        ] || 999;

      const tallaB =
        ordenTallas[
          b.size?.trim().toUpperCase()
        ] || 999;

      return tallaA - tallaB;

    });

    data.product_images.sort(
  (a, b) =>
    (a.sort_order || 0)
    -
    (b.sort_order || 0)
);

setProducto(data);

  };

  // 🔥 actualizar precio
  const actualizarPrecio = async (
    variantId,
    nuevoPrecio
  ) => {

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.map(v =>
          v.id === variantId
            ? { ...v, price: nuevoPrecio }
            : v
        )
    }));

    setEstadoGuardado(prev => ({
      ...prev,
      [variantId]: "saving"
    }));

    await supabase
      .from("product_variants")
      .update({ price: nuevoPrecio })
      .eq("id", variantId);

    setEstadoGuardado(prev => ({
      ...prev,
      [variantId]: "saved"
    }));

    setTimeout(() => {

      setEstadoGuardado(prev => ({
        ...prev,
        [variantId]: "idle"
      }));

    }, 1800);

  };

  // 🔥 actualizar stock
  const actualizarStock = async (
    variantId,
    nuevoStock
  ) => {

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.map(v =>
          v.id === variantId
            ? { ...v, stock: nuevoStock }
            : v
        )
    }));

    setEstadoGuardado(prev => ({
      ...prev,
      [`stock-${variantId}`]: "saving"
    }));

    await supabase
      .from("product_variants")
      .update({ stock: nuevoStock })
      .eq("id", variantId);

    setEstadoGuardado(prev => ({
      ...prev,
      [`stock-${variantId}`]: "saved"
    }));

    setTimeout(() => {

      setEstadoGuardado(prev => ({
        ...prev,
        [`stock-${variantId}`]: "idle"
      }));

    }, 1800);

  };

  // 🔥 eliminar talla
  const eliminarVariante = async (variantId) => {

    if (!confirm("¿Eliminar talla?")) return;

    await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.filter(
          v => v.id !== variantId
        )
    }));

  };

  // 🔥 agregar talla

  const agregarVariante = async () => {

  if (!nuevaTalla) {
    alert("Selecciona una talla");
    return;
  }

  // 🔥 evitar duplicados
  const existe =
    producto.product_variants.some(
      v =>
        v.size?.trim().toUpperCase()
        ===
        nuevaTalla.trim().toUpperCase()
    );

  if (existe) {
    alert("La talla ya existe");
    return;
  }

  const { data } = await supabase
    .from("product_variants")
    .insert([{
      product_id: producto.id,

      size: nuevaTalla,

      price:
        parseInt(nuevoPrecio)
        || 0,

      stock:
        parseInt(nuevoStock)
        || 0
    }])
    .select()
    .single();

  setProducto(prev => ({
    ...prev,
    product_variants: [
      ...prev.product_variants,
      data
    ]
  }));

  // reset
  setNuevaTalla("");
  setNuevoPrecio("");
  setNuevoStock("");

  setMostrarModal(false);

  cargarProducto();

};

  const subirImagen = async (file) => {

  if (!file) return;

  try {

    setSubiendoImagen(true);

    const nombre =
      `${Date.now()}-${file.name}`;

    // 🔥 subir storage
    const { error: uploadError } =
      await supabase.storage
        .from("products")
        .upload(nombre, file);

   if (uploadError) {

  console.error(
    "SUPABASE STORAGE ERROR:",
    uploadError
  );

  alert(
    uploadError.message ||
    JSON.stringify(uploadError)
  );

  return;
}

    // 🔥 obtener url
    const { data } =
      supabase.storage
        .from("products")
        .getPublicUrl(nombre);

    const url =
      data.publicUrl;

    // 🔥 guardar db
    const { data: nueva } =
      await supabase
        .from("product_images")
        .insert([{
  product_id: producto.id,

  url,

  sort_order:
    producto.product_images.length
}])
        .select()
        .single();

    // 🔥 actualizar UI
    setProducto(prev => ({
      ...prev,
      product_images: [
        ...prev.product_images,
        nueva
      ]
    }));

  } catch (err) {

    console.error(err);

  } finally {

    setSubiendoImagen(false);

  }

};

  const eliminarImagen = async (id) => {

  if (!confirm("¿Eliminar imagen?"))
    return;

  await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  setProducto(prev => ({
    ...prev,
    product_images:
      prev.product_images.filter(
        img => img.id !== id
      )
  }));

};

  const generarSlug = (texto) => {

  return texto
    ?.toLowerCase()

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )

    .replace(/\s+/g, "-")

    .replace(/-+/g, "-");

};

  const actualizarProducto = async (
  campo,
  valor
) => {

  try {

    setGuardandoInfo(true);

    // 🔥 UI inmediata
    setProducto(prev => ({
      ...prev,
      [campo]: valor
    }));

    // 🔥 guardar db
    const { error } =
      await supabase
        .from("products")
        .update({
          [campo]: valor
        })
        .eq("id", producto.id);

    if (error) {
      console.error(error);
    }

  } catch (err) {

    console.error(err);

  } finally {

    setGuardandoInfo(false);

  }

};

const handleDragEnd = async (
  event
) => {

  const {
    active,
    over
  } = event;

  if (!over) return;

  if (active.id === over.id)
    return;

  const oldIndex =
    producto.product_images.findIndex(
      img => img.id === active.id
    );

  const newIndex =
    producto.product_images.findIndex(
      img => img.id === over.id
    );

  // 🔥 nuevo orden
  const nuevas =
    arrayMove(
      producto.product_images,
      oldIndex,
      newIndex
    );

  // 🔥 asignar sort_order correcto
  const actualizadas =
    nuevas.map((img, index) => ({
      ...img,
      sort_order: index
    }));

  // 🔥 actualizar UI inmediato
  setProducto(prev => ({
    ...prev,
    product_images: actualizadas
  }));

  try {

    // 🔥 guardar TODAS
    const updates =
      actualizadas.map(img =>
        supabase
          .from("product_images")
          .update({
            sort_order:
              img.sort_order
          })
          .eq("id", img.id)
      );

    await Promise.all(updates);

    // 🔥 recargar desde DB
    await cargarProducto();

  } catch (err) {

    console.error(
      "Error guardando orden",
      err
    );

  }

};

  if (!producto) {

    return (
      <div style={{ padding: 30 }}>
        Cargando...
      </div>
    );

  }

  const stockTotal =
  producto.product_variants.reduce(
    (acc, v) =>
      acc + (v.stock || 0),
    0
  );

const valorInventario =
  producto.product_variants.reduce(
    (acc, v) =>
      acc +
      (
        (v.stock || 0)
        *
        (v.price || 0)
      ),
    0
  );

const variantesAgotadas =
  producto.product_variants.filter(
    v => (v.stock || 0) <= 0
  ).length;

const variantesBajoStock =
  producto.product_variants.filter(
    v =>
      (v.stock || 0) > 0
      &&
      (v.stock || 0) <= 3
  ).length;

const precioPromedio =
  producto.product_variants.length > 0

    ? Math.round(

        producto.product_variants.reduce(
          (acc, v) =>
            acc + (v.price || 0),
          0
        )

        /

        producto.product_variants.length
      )

    : 0;
  
  

  return (

    <div
      style={{
        padding: 30,
        background:
          "linear-gradient(to bottom,#fff,#fff7fb)",
        minHeight: "100vh"
      }}
    >

     {/* HEADER PREMIUM */}
<div
  style={{
    marginBottom: 30
  }}
>

  {/* volver */}
  <Link
    to="/admin/productos"
    style={{
      textDecoration: "none",
      color: "#ec4899",
      fontWeight: "700",
      fontSize: 15
    }}
  >
    ← Volver a productos
  </Link>

  {/* card principal */}
  <div
    style={{
      marginTop: 18,

      background: "#fff",

      borderRadius: 28,

      padding: 24,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.06)",

      border:
        "1px solid rgba(236,72,153,0.08)"
    }}
  >

    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >

      {/* imagen */}
      <img
        src={
          producto.product_images?.[0]?.url
          || "/placeholder.png"
        }
        style={{
          width: 120,
          height: 120,
          borderRadius: 24,
          objectFit: "cover",

          boxShadow:
            "0 10px 25px rgba(0,0,0,0.10)"
        }}
      />

{/* INFO PREMIUM */}
<div
  style={{
    flex: 1,
    minWidth: 320
  }}
>

  {/* NOMBRE */}
  <input
    value={producto.name || ""}

    onChange={(e) =>
      setProducto(prev => ({
        ...prev,
        name: e.target.value
      }))
    }

    onBlur={(e) =>
      actualizarProducto(
        "name",
        e.target.value
      )
    }

    style={{
      width: "100%",

      border: "none",

      fontSize: 38,

      fontWeight: "900",

      color: "#111827",

      outline: "none",

      marginBottom: 18,

      background: "transparent"
    }}
  />

  {/* BADGES */}
  <div
    style={{
      display: "flex",
      gap: 12,
      flexWrap: "wrap",

      marginBottom: 18
    }}
  >

    {/* categoría */}
    <input
      value={
        producto.category || ""
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          category:
            e.target.value
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "category",
          e.target.value
        )
      }

      placeholder="Categoría"

      style={{
        padding:
          "10px 16px",

        borderRadius: 999,

        border:
          "1px solid #e5e7eb",

        background:
          "#f9fafb",

        fontWeight: "700"
      }}
    />

    {/* variantes */}
    <div
      style={{
        background: "#ecfeff",
        color: "#0891b2",

        padding: "10px 16px",

        borderRadius: 999,

        fontWeight: "700",

        fontSize: 13
      }}
    >
      {
        producto.product_variants
          .length
      } variantes
    </div>

    {/* activo */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,

        background:
          producto.active
            ? "#dcfce7"
            : "#fee2e2",

        color:
          producto.active
            ? "#166534"
            : "#991b1b",

        padding:
          "10px 16px",

        borderRadius: 999,

        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(
            producto.active
          )
        }

        onChange={(e) =>
          actualizarProducto(
            "active",
            e.target.checked
          )
        }
      />

      {producto.active
        ? "Activo"
        : "Inactivo"}

    </label>

    {/* destacado */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,

        background:
          producto.featured
            ? "#fef3c7"
            : "#f3f4f6",

        color:
          producto.featured
            ? "#92400e"
            : "#374151",

        padding:
          "10px 16px",

        borderRadius: 999,

        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(
            producto.featured
          )
        }

        onChange={(e) =>
          actualizarProducto(
            "featured",
            e.target.checked
          )
        }
      />

      ⭐ Destacado

       </label>

  </div>

      {/* 🔥 COLECCIONES PREMIUM */}
<div
  style={{
    marginTop: 30
  }}
>

  <h3
    style={{
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 20
    }}
  >
    🏷 Colecciones
  </h3>

  <div
    style={{
      display: "flex",
      gap: 14,
      flexWrap: "wrap"
    }}
  >

    {/* NUEVA COLECCIÓN */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 20,
        background:
        producto.new_collection
            ? "#ecfdf5"
            : "#f3f4f6",
        cursor: "pointer",
        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(producto.new_collection)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            new_collection: checked
          }));

          await supabase
            .from("products")
            .update({
              new_collection: checked
            })
            .eq("id", producto.id);

        }}
      />

      🆕 Nueva colección

    </label>

    {/* BEST SELLER */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 20,
        background:
          producto.best_seller
            ? "#eff6ff"
            : "#f3f4f6",
        cursor: "pointer",
        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(producto.best_seller)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            best_seller: checked
          }));

          await supabase
            .from("products")
            .update({
              best_seller: checked
            })
            .eq("id", producto.id);

        }}
      />

      🔥 Best seller

    </label>

    {/* LUXURY */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 20,
        background:
          producto.luxury
            ? "#fef3c7"
            : "#f3f4f6",
        cursor: "pointer",
        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(producto.luxury)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            luxury: checked
          }));

          await supabase
            .from("products")
            .update({
              luxury: checked
            })
            .eq("id", producto.id);

        }}
      />

      👑 Luxury

    </label>

    {/* EXCLUSIVO */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 20,
        background:
          producto.exclusive
            ? "#fce7f3"
            : "#f3f4f6",
        cursor: "pointer",
        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(producto.exclusive)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            exclusive: checked
          }));

          await supabase
            .from("products")
            .update({
              exclusive: checked
            })
            .eq("id", producto.id);

        }}
      />

      💎 Exclusivo

    </label>

  </div>

</div>

  {/* DESCRIPCIÓN */}
  <textarea
    value={
      producto.description || ""
    }

    onChange={(e) =>
      setProducto(prev => ({
        ...prev,
        description:
          e.target.value
      }))
    }

    onBlur={(e) =>
      actualizarProducto(
        "description",
        e.target.value
      )
    }

    placeholder="
      Describe el producto...
    "

    rows={4}

    style={{
      width: "100%",

      padding: 18,

      borderRadius: 20,

      border:
        "1px solid #e5e7eb",

      background:
        "#f9fafb",

      resize: "vertical",

      fontSize: 15,

      outline: "none"
    }}
  />

  {/* GUARDANDO */}
  {guardandoInfo && (

    <div
      style={{
        marginTop: 12,

        color: "#ec4899",

        fontWeight: "700"
      }}
    >
      Guardando...
    </div>

  )}

</div>

      {/* KPIs */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap"
        }}
      >

        {/* stock total */}
        <div
          style={{
            minWidth: 130,

            background:
              "linear-gradient(135deg,#fff7ed,#ffedd5)",

            borderRadius: 22,

            padding: 18
          }}
        >

          <div
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#9a3412"
            }}
          >
            STOCK TOTAL
          </div>

          <div
            style={{
              marginTop: 8,

              fontSize: 30,
              fontWeight: "800",

              color: "#111827"
            }}
          >
            {
              producto.product_variants.reduce(
                (acc, v) =>
                  acc + (v.stock || 0),
                0
              )
            }
          </div>

        </div>

        {/* precio desde */}
        <div
          style={{
            minWidth: 160,

            background:
              "linear-gradient(135deg,#eff6ff,#dbeafe)",

            borderRadius: 22,

            padding: 18
          }}
        >

          <div
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#1d4ed8"
            }}
          >
            PRECIO DESDE
          </div>

          <div
            style={{
              marginTop: 8,

              fontSize: 28,
              fontWeight: "800",

              color: "#111827"
            }}
          >
            {
  producto.product_variants.length > 0
    ? `$${Math.min(
        ...producto.product_variants.map(
          v => v.price || 0
        )
      ).toLocaleString("es-CL")}`

    : "$0"
}
          </div>

        </div>

      </div>

    </div>

  </div>

</div>

      {/* SEO PREMIUM */}
<div
  style={{
    background: "#fff",

    borderRadius: 28,

    padding: 24,

    marginBottom: 26,

    boxShadow:
      "0 10px 35px rgba(0,0,0,0.05)"
  }}
>

  {/* título */}
  <div
    style={{
      marginBottom: 22
    }}
  >

    <h2
      style={{
        margin: 0,
        fontSize: 24,
        fontWeight: "800"
      }}
    >
      🔎 SEO Producto
    </h2>

    <p
      style={{
        marginTop: 8,
        color: "#6b7280"
      }}
    >
      Optimiza este producto para Google
    </p>

  </div>

  {/* grid */}
  <div
    style={{
      display: "grid",

      gridTemplateColumns:
        "repeat(auto-fit,minmax(280px,1fr))",

      gap: 20
    }}
  >

    {/* slug */}
    <div>

      <label
        style={{
          display: "block",

          marginBottom: 8,

          fontWeight: "700"
        }}
      >
        URL / Slug
      </label>

      <input
        value={
          producto.slug || ""
        }

        onChange={(e) =>
          setProducto(prev => ({
            ...prev,
            slug:
              generarSlug(
                e.target.value
              )
          }))
        }

        onBlur={(e) =>
          actualizarProducto(
            "slug",
            generarSlug(
              e.target.value
            )
          )
        }

        placeholder="producto-premium"

        style={{
          width: "100%",

          padding: "14px 16px",

          borderRadius: 16,

          border:
            "1px solid #e5e7eb",

          fontWeight: "600"
        }}
      />

    </div>

    {/* meta title */}
    <div>

      <label
        style={{
          display: "block",

          marginBottom: 8,

          fontWeight: "700"
        }}
      >
        Meta title
      </label>

      <input
        value={
          producto.meta_title || ""
        }

        onChange={(e) =>
          setProducto(prev => ({
            ...prev,
            meta_title:
              e.target.value
          }))
        }

        onBlur={(e) =>
          actualizarProducto(
            "meta_title",
            e.target.value
          )
        }

        placeholder="
          Título SEO Google
        "

        style={{
          width: "100%",

          padding: "14px 16px",

          borderRadius: 16,

          border:
            "1px solid #e5e7eb",

          fontWeight: "600"
        }}
      />

    </div>

  </div>

  {/* descripción */}
  <div
    style={{
      marginTop: 20
    }}
  >

    <label
      style={{
        display: "block",

        marginBottom: 8,

        fontWeight: "700"
      }}
    >
      Meta description
    </label>

    <textarea
      value={
        producto.meta_description
        || ""
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          meta_description:
            e.target.value
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "meta_description",
          e.target.value
        )
      }

      rows={4}

      placeholder="
        Descripción SEO Google
      "

      style={{
        width: "100%",

        padding: 18,

        borderRadius: 20,

        border:
          "1px solid #e5e7eb",

        resize: "vertical",

        fontSize: 15
      }}
    />

  </div>

  {/* keywords */}
  <div
    style={{
      marginTop: 20
    }}
  >

    <label
      style={{
        display: "block",

        marginBottom: 8,

        fontWeight: "700"
      }}
    >
      Keywords SEO
    </label>

    <input
      value={
        producto.seo_keywords || ""
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          seo_keywords:
            e.target.value
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "seo_keywords",
          e.target.value
        )
      }

      placeholder="
        ropa mascotas, luxury pet...
      "

      style={{
        width: "100%",

        padding: "14px 16px",

        borderRadius: 16,

        border:
          "1px solid #e5e7eb",

        fontWeight: "600"
      }}
    />

  </div>

  {/* preview google */}
  <div
    style={{
      marginTop: 28,

      background: "#f9fafb",

      borderRadius: 22,

      padding: 22,

      border:
        "1px solid #f3f4f6"
    }}
  >

    <div
      style={{
        color: "#1a0dab",

        fontSize: 22,

        fontWeight: "500"
      }}
    >
      {
        producto.meta_title
        || producto.name
      }
    </div>

    <div
      style={{
        marginTop: 6,

        color: "#15803d",

        fontSize: 14
      }}
    >
      boutiquepetlove.cl/producto/
      {
        producto.slug
        || generarSlug(
          producto.name
        )
      }
    </div>

    <div
      style={{
        marginTop: 10,

        color: "#4b5563",

        lineHeight: 1.6
      }}
    >
      {
        producto.meta_description
        || producto.description
      }
    </div>

  </div>

</div>

      {/* ANALYTICS PREMIUM */}
<div
  style={{
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 20,

    marginBottom: 26
  }}
>

  {/* STOCK */}
  <div
    style={{
      background: "#fff",

      borderRadius: 26,

      padding: 24,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.05)"
    }}
  >

    <div
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: "#6b7280"
      }}
    >
      STOCK TOTAL
    </div>

    <div
      style={{
        marginTop: 12,

        fontSize: 36,

        fontWeight: "900",

        color: "#111827"
      }}
    >
      {stockTotal}
    </div>

  </div>

  {/* INVENTARIO */}
  <div
    style={{
      background: "#fff",

      borderRadius: 26,

      padding: 24,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.05)"
    }}
  >

    <div
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: "#6b7280"
      }}
    >
      VALOR INVENTARIO
    </div>

    <div
      style={{
        marginTop: 12,

        fontSize: 28,

        fontWeight: "900",

        color: "#059669"
      }}
    >
      $
      {valorInventario.toLocaleString(
        "es-CL"
      )}
    </div>

  </div>

  {/* PROMEDIO */}
  <div
    style={{
      background: "#fff",

      borderRadius: 26,

      padding: 24,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.05)"
    }}
  >

    <div
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: "#6b7280"
      }}
    >
      PRECIO PROMEDIO
    </div>

    <div
      style={{
        marginTop: 12,

        fontSize: 28,

        fontWeight: "900",

        color: "#2563eb"
      }}
    >
      $
      {precioPromedio.toLocaleString(
        "es-CL"
      )}
    </div>

  </div>

  {/* ALERTAS */}
  <div
    style={{
      background: "#fff",

      borderRadius: 26,

      padding: 24,

      boxShadow:
        "0 10px 35px rgba(0,0,0,0.05)"
    }}
  >

    <div
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: "#6b7280"
      }}
    >
      ALERTAS
    </div>

    <div
      style={{
        marginTop: 14,

        display: "flex",

        flexDirection: "column",

        gap: 10
      }}
    >

      {variantesAgotadas > 0 && (

        <div
          style={{
            color: "#dc2626",
            fontWeight: "700"
          }}
        >
          🔴 {variantesAgotadas}
          {" "}agotadas
        </div>

      )}

      {variantesBajoStock > 0 && (

        <div
          style={{
            color: "#ea580c",
            fontWeight: "700"
          }}
        >
          🟠 {variantesBajoStock}
          {" "}bajo stock
        </div>

      )}

      {!producto.meta_title && (
        <div
          style={{
            color: "#9333ea",
            fontWeight: "700"
          }}
        >
          🟣 SEO incompleto
        </div>
      )}

      {producto.product_images
        .length === 0 && (
        <div
          style={{
            color: "#2563eb",
            fontWeight: "700"
          }}
        >
          🔵 Sin imágenes
        </div>
      )}

    </div>

  </div>

</div>

      {/* DESCUENTOS PREMIUM */}
<div
  style={{
    background: "#fff",

    borderRadius: 28,

    padding: 24,

    marginBottom: 26,

    boxShadow:
      "0 10px 35px rgba(0,0,0,0.05)"
  }}
>

  {/* título */}
  <div
    style={{
      marginBottom: 24
    }}
  >

    <h2
      style={{
        margin: 0,

        fontSize: 24,

        fontWeight: "800"
      }}
    >
      🔥 Descuentos
    </h2>

    <p
      style={{
        marginTop: 8,

        color: "#6b7280"
      }}
    >
      Configura promociones del producto
    </p>

  </div>

  {/* activar */}
  <div
    style={{
      display: "flex",

      alignItems: "center",

      gap: 12,

      marginBottom: 24
    }}
  >

    <label
      style={{
        display: "flex",

        alignItems: "center",

        gap: 10,

        background:
          producto.discount_active
            ? "#fef2f2"
            : "#f9fafb",

        color:
          producto.discount_active
            ? "#dc2626"
            : "#374151",

        padding: "14px 18px",

        borderRadius: 18,

        fontWeight: "700"
      }}
    >

      <input
        type="checkbox"

        checked={
          Boolean(
            producto.discount_active
          )
        }

        onChange={(e) =>
          actualizarProducto(
            "discount_active",
            e.target.checked
          )
        }
      />

      🔥 Activar descuento

    </label>

  </div>

  {/* porcentaje */}
  <div
    style={{
      maxWidth: 280
    }}
  >

    <label
      style={{
        display: "block",

        marginBottom: 8,

        fontWeight: "700"
      }}
    >
      % descuento
    </label>

    <input
      type="number"

      value={
        producto.discount_percent || 0
      }

      onChange={(e) =>
        setProducto(prev => ({
          ...prev,
          discount_percent:
            parseInt(e.target.value)
            || 0
        }))
      }

      onBlur={(e) =>
        actualizarProducto(
          "discount_percent",
          parseInt(e.target.value)
          || 0
        )
      }

      min={0}
      max={90}

      style={{
        width: "100%",

        padding: "16px 18px",

        borderRadius: 18,

        border:
          "1px solid #e5e7eb",

        fontSize: 18,

        fontWeight: "800"
      }}
    />

  </div>

  {/* preview */}
  <div
    style={{
      marginTop: 28,

      background:
        "linear-gradient(135deg,#fff1f2,#ffe4e6)",

      borderRadius: 24,

      padding: 24
    }}
  >

    <div
      style={{
        fontSize: 14,

        fontWeight: "700",

        color: "#9f1239",

        marginBottom: 14
      }}
    >
      PREVIEW DESCUENTO
    </div>

    <div
      style={{
        display: "flex",

        alignItems: "center",

        gap: 14,

        flexWrap: "wrap"
      }}
    >

      {/* precio original */}
      <div
        style={{
          fontSize: 24,

          textDecoration: "line-through",

          color: "#9ca3af",

          fontWeight: "700"
        }}
      >
        $
        {
          precioPromedio.toLocaleString(
            "es-CL"
          )
        }
      </div>

      {/* precio descuento */}
      <div
        style={{
          fontSize: 36,

          fontWeight: "900",

          color: "#e11d48"
        }}
      >
        $
        {
          Math.round(

            precioPromedio *

            (
              1 -
              (
                (
                  producto.discount_percent
                  || 0
                ) / 100
              )
            )

          ).toLocaleString("es-CL")
        }
      </div>

      {/* badge */}
      {producto.discount_active && (

        <div
          style={{
            background:
              "#e11d48",

            color: "#fff",

            padding: "10px 14px",

            borderRadius: 999,

            fontWeight: "800",

            fontSize: 14
          }}
        >
          🔥 -
          {
            producto.discount_percent
          }%
        </div>

      )}

    </div>

  </div>

</div>

      {/* IMÁGENES PREMIUM */}
<div
  style={{
    background: "#fff",

    borderRadius: 28,

    padding: 24,

    marginBottom: 26,

    boxShadow:
      "0 10px 35px rgba(0,0,0,0.05)"
  }}
>

  {/* título */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",

      marginBottom: 22
    }}
  >

    <div>

      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: "800"
        }}
      >
        📸 Imágenes
      </h2>

      <p
        style={{
          marginTop: 6,
          color: "#6b7280"
        }}
      >
        Gestiona imágenes del producto
      </p>

    </div>

    {/* subir */}
    <label
      style={{
        background:
          "linear-gradient(135deg,#ec4899,#db2777)",

        color: "#fff",

        padding: "14px 18px",

        borderRadius: 16,

        fontWeight: "700",

        cursor: "pointer",

        boxShadow:
          "0 10px 25px rgba(236,72,153,0.25)"
      }}
    >

      {subiendoImagen
        ? "Subiendo..."
        : "➕ Subir imagen"}

      <input
        type="file"
        accept="image/*"

        hidden

        onChange={(e) =>
          subirImagen(
            e.target.files?.[0]
          )
        }
      />

    </label>

  </div>

  {/* grid */}
{/* grid drag */}
<DndContext
  collisionDetection={
    closestCenter
  }

  onDragEnd={handleDragEnd}
>

  <SortableContext
    items={
      producto.product_images.map(
        img => img.id
      )
    }

    strategy={
      rectSortingStrategy
    }
  >

    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "repeat(auto-fill,minmax(180px,1fr))",

        gap: 18
      }}
    >

      {producto.product_images.map(
        (img, index) => (

          <SortableImage
            key={img.id}

            img={img}

            index={index}

            eliminarImagen={
              eliminarImagen
            }
          />

        )
      )}

    </div>

  </SortableContext>

</DndContext>

</div>
      
{/* TABLA PREMIUM */}
<div
  style={{
    background: "#fff",

    borderRadius: 28,

    padding: 20,

    boxShadow:
      "0 10px 35px rgba(0,0,0,0.05)"
  }}
>

  {/* encabezado */}
  <div
    style={{
      display: "grid",

      gridTemplateColumns:
        "1fr 1fr 1fr 1fr 120px",

      padding: "0 16px 18px 16px",

      borderBottom:
        "1px solid #f3f4f6",

      fontSize: 13,

      fontWeight: "700",

      color: "#6b7280"
    }}
  >

    <div>Talla</div>

    <div>Precio</div>

    <div>Stock</div>

    <div>Estado</div>

    <div>Acciones</div>

  </div>

  {/* filas */}
  <div
    style={{
      marginTop: 8,

      display: "flex",
      flexDirection: "column",
      gap: 12
    }}
  >

    {producto.product_variants.map(v => (

      <div
        key={v.id}

        style={{
          display: "grid",

          gridTemplateColumns:
            "1fr 1fr 1fr 1fr 120px",

          alignItems: "center",

          padding: 16,

          borderRadius: 22,

          background:
            "linear-gradient(to right,#fff,#fcfcfc)",

          border:
            "1px solid #f3f4f6",

          transition:
            "all .25s ease",

          boxShadow:
            "0 4px 12px rgba(0,0,0,0.03)"
        }}

        onMouseEnter={(e) => {

          e.currentTarget.style.transform =
            "translateY(-2px)";

          e.currentTarget.style.boxShadow =
            "0 12px 24px rgba(0,0,0,0.06)";

        }}

        onMouseLeave={(e) => {

          e.currentTarget.style.transform =
            "translateY(0px)";

          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.03)";

        }}
      >

        {/* TALLA */}
        <div>

          <span
            style={{
              background:
                "#f9fafb",

              border:
                "1px solid #e5e7eb",

              padding: "10px 16px",

              borderRadius: 999,

              fontWeight: "700",

              fontSize: 14
            }}
          >
            {v.size}
          </span>

        </div>

        {/* PRECIO */}
        <div>

          <input
            type="number"

            value={v.price || 0}

            onChange={(e) => {

              const nuevo =
                parseInt(e.target.value)
                || 0;

              setProducto(prev => ({
                ...prev,
                product_variants:
                  prev.product_variants.map(x =>
                    x.id === v.id
                      ? {
                          ...x,
                          price: nuevo
                        }
                      : x
                  )
              }));

            }}

            onBlur={(e) => {

              actualizarPrecio(
                v.id,
                parseInt(e.target.value)
                || 0
              );

            }}

            style={{
              width: 140,

              padding: "12px 16px",

              borderRadius: 16,

              border:
                "1px solid #e5e7eb",

              fontWeight: "700",

              fontSize: 15,

              background: "#fff",

              transition:
                "all .2s ease"
            }}
          />

        </div>

        {/* STOCK */}
        <div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >

            {/* - */}
            <button
              onClick={() =>
                actualizarStock(
                  v.id,
                  Math.max(
                    (v.stock || 0) - 1,
                    0
                  )
                )
              }

              style={{
                width: 38,
                height: 38,

                borderRadius: 12,

                border: "none",

                background:
                  "#fef2f2",

                color: "#ef4444",

                fontSize: 18,
                fontWeight: "700",

                cursor: "pointer"
              }}
            >
              −
            </button>

            {/* input */}
            <input
              type="number"

              value={v.stock || 0}

              onChange={(e) => {

                const nuevo =
                  parseInt(e.target.value)
                  || 0;

                setProducto(prev => ({
                  ...prev,
                  product_variants:
                    prev.product_variants.map(x =>
                      x.id === v.id
                        ? {
                            ...x,
                            stock: nuevo
                          }
                        : x
                    )
                }));

              }}

              onBlur={(e) => {

                actualizarStock(
                  v.id,
                  parseInt(e.target.value)
                  || 0
                );

              }}

              style={{
                width: 80,

                padding: "12px 14px",

                borderRadius: 16,

                border:
                  "1px solid #e5e7eb",

                textAlign: "center",

                fontWeight: "700",

                fontSize: 15
              }}
            />

            {/* + */}
            <button
              onClick={() =>
                actualizarStock(
                  v.id,
                  (v.stock || 0) + 1
                )
              }

              style={{
                width: 38,
                height: 38,

                borderRadius: 12,

                border: "none",

                background:
                  "#ecfdf5",

                color: "#22c55e",

                fontSize: 18,
                fontWeight: "700",

                cursor: "pointer"
              }}
            >
              +
            </button>

          </div>

        </div>

        {/* ESTADO */}
        <div>

          {(v.stock || 0) <= 0 ? (

            <span
              style={{
                background:
                  "#fef2f2",

                color: "#dc2626",

                padding: "8px 14px",

                borderRadius: 999,

                fontWeight: "700",

                fontSize: 12
              }}
            >
              ● Agotado
            </span>

          ) : (v.stock || 0) <= 3 ? (

            <span
              style={{
                background:
                  "#fff7ed",

                color: "#ea580c",

                padding: "8px 14px",

                borderRadius: 999,

                fontWeight: "700",

                fontSize: 12
              }}
            >
              ● Bajo stock
            </span>

          ) : (

            <span
              style={{
                background:
                  "#ecfdf5",

                color: "#059669",

                padding: "8px 14px",

                borderRadius: 999,

                fontWeight: "700",

                fontSize: 12
              }}
            >
              ● En stock
            </span>

          )}

        </div>

        {/* ACCIONES */}
        <div>

          <button
            onClick={() =>
              eliminarVariante(v.id)
            }

            style={{
              width: 42,
              height: 42,

              borderRadius: 14,

              border: "none",

              background:
                "#fef2f2",

              color: "#ef4444",

              fontWeight: "700",

              cursor: "pointer",

              transition:
                "all .2s ease"
            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.background =
                "#ef4444";

              e.currentTarget.style.color =
                "#fff";

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.background =
                "#fef2f2";

              e.currentTarget.style.color =
                "#ef4444";

            }}
          >
            ✕
          </button>

        </div>

      </div>

    ))}

  </div>

</div>

{/* BOTÓN ABRIR MODAL */}
<button
  onClick={() =>
    setMostrarModal(true)
  }

  style={{
    marginTop: 24,

    background:
      "linear-gradient(135deg,#22c55e,#16a34a)",

    color: "#fff",

    border: "none",

    borderRadius: 18,

    padding: "16px 22px",

    fontWeight: "700",

    fontSize: 15,

    cursor: "pointer",

    boxShadow:
      "0 10px 25px rgba(34,197,94,0.25)"
  }}
>
  ➕ Agregar talla
</button>

      {/* MODAL PREMIUM */}
{mostrarModal && (

  <div
    style={{
      position: "fixed",
      inset: 0,

      background:
        "rgba(0,0,0,0.45)",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      zIndex: 9999,

      backdropFilter: "blur(6px)"
    }}
  >

    <div
      style={{
        width: 420,

        background: "#fff",

        borderRadius: 30,

        padding: 28,

        boxShadow:
          "0 20px 60px rgba(0,0,0,0.18)"
      }}
    >

      {/* título */}
      <h2
        style={{
          marginTop: 0,
          marginBottom: 24,

          fontSize: 26,

          fontWeight: "800",

          color: "#111827"
        }}
      >
        Nueva variante
      </h2>

      {/* talla */}
      <div style={{ marginBottom: 18 }}>

        <label
          style={{
            display: "block",

            marginBottom: 8,

            fontWeight: "700",

            fontSize: 14
          }}
        >
          Talla
        </label>

        <select
          value={nuevaTalla}

          onChange={(e) =>
            setNuevaTalla(e.target.value)
          }

          style={{
            width: "100%",

            padding: "14px 16px",

            borderRadius: 16,

            border:
              "1px solid #e5e7eb",

            fontWeight: "600",

            fontSize: 15
          }}
        >

          <option value="">
            Seleccionar talla
          </option>

          {[
            "XXS",
            "XS",
            "S",
            "M",
            "L",
            "XL",
            "XXL",
            "XXXL",

            "Talla 0",
            "Talla 1",
            "Talla 2",
            "Talla 3",
            "Talla 4",
            "Talla 5",
            "Talla 6",
            "Talla 7",
            "Talla 8",
            "Talla 9",
            "Talla 10",
            "Talla 11",
            "Talla 12"
          ].map(t => (

            <option
              key={t}
              value={t}
            >
              {t}
            </option>

          ))}

        </select>

      </div>

      {/* precio */}
      <div style={{ marginBottom: 18 }}>

        <label
          style={{
            display: "block",

            marginBottom: 8,

            fontWeight: "700",

            fontSize: 14
          }}
        >
          Precio
        </label>

        <input
          type="number"

          value={nuevoPrecio}

          onChange={(e) =>
            setNuevoPrecio(e.target.value)
          }

          placeholder="24990"

          style={{
            width: "100%",

            padding: "14px 16px",

            borderRadius: 16,

            border:
              "1px solid #e5e7eb",

            fontWeight: "600",

            fontSize: 15
          }}
        />

      </div>

      {/* stock */}
      <div style={{ marginBottom: 26 }}>

        <label
          style={{
            display: "block",

            marginBottom: 8,

            fontWeight: "700",

            fontSize: 14
          }}
        >
          Stock inicial
        </label>

        <input
          type="number"

          value={nuevoStock}

          onChange={(e) =>
            setNuevoStock(e.target.value)
          }

          placeholder="0"

          style={{
            width: "100%",

            padding: "14px 16px",

            borderRadius: 16,

            border:
              "1px solid #e5e7eb",

            fontWeight: "600",

            fontSize: 15
          }}
        />

      </div>

      {/* acciones */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12
        }}
      >

        {/* cancelar */}
        <button
          onClick={() =>
            setMostrarModal(false)
          }

          style={{
            padding: "14px 18px",

            borderRadius: 16,

            border:
              "1px solid #e5e7eb",

            background: "#fff",

            fontWeight: "700",

            cursor: "pointer"
          }}
        >
          Cancelar
        </button>

        {/* guardar */}
        <button
          onClick={agregarVariante}

          style={{
            padding: "14px 20px",

            borderRadius: 16,

            border: "none",

            background:
              "linear-gradient(135deg,#ec4899,#db2777)",

            color: "#fff",

            fontWeight: "700",

            cursor: "pointer",

            boxShadow:
              "0 10px 25px rgba(236,72,153,0.25)"
          }}
        >
          Guardar variante
        </button>

      </div>

    </div>

  </div>

)}

    </div>

  );

}

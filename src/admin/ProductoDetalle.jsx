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
        .from("productos")
        .upload(nombre, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Error subiendo imagen");
      return;
    }

    // 🔥 obtener url
    const { data } =
      supabase.storage
        .from("productos")
        .getPublicUrl(nombre);

    const url =
      data.publicUrl;

    // 🔥 guardar db
    const { data: nueva } =
      await supabase
        .from("product_images")
        .insert([{
          product_id: producto.id,
          url
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

const handleDragEnd = async (
  event
) => {

  const {
    active,
    over
  } = event;

  if (!over) return;

  if (active.id !== over.id) {

    const oldIndex =
      producto.product_images.findIndex(
        img => img.id === active.id
      );

    const newIndex =
      producto.product_images.findIndex(
        img => img.id === over.id
      );

    const nuevas =
      arrayMove(
        producto.product_images,
        oldIndex,
        newIndex
      );

    // 🔥 actualizar sort_order local
    const actualizadas =
      nuevas.map((img, index) => ({
        ...img,
        sort_order: index
      }));

    // 🔥 UI inmediata
    setProducto(prev => ({
      ...prev,
      product_images: actualizadas
    }));

    // 🔥 guardar DB
    for (const img of actualizadas) {

      await supabase
        .from("product_images")
        .update({
          sort_order: img.sort_order
        })
        .eq("id", img.id);

    }

    // 🔥 recargar desde DB
    await cargarProducto();

  }

};

  if (!producto) {

    return (
      <div style={{ padding: 30 }}>
        Cargando...
      </div>
    );

  }

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

      {/* info */}
      <div style={{ flex: 1 }}>

        <h1
          style={{
            margin: 0,
            fontSize: 34,
            fontWeight: "800",
            color: "#111827"
          }}
        >
          {producto.name}
        </h1>

        {/* badges */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 12,
            flexWrap: "wrap"
          }}
        >

          {/* categoría */}
          <span
            style={{
              background: "#f3f4f6",
              color: "#374151",

              padding: "8px 14px",

              borderRadius: 999,

              fontSize: 12,
              fontWeight: "700"
            }}
          >
            {producto.category}
          </span>

          {/* variantes */}
          <span
            style={{
              background: "#ecfeff",
              color: "#0891b2",

              padding: "8px 14px",

              borderRadius: 999,

              fontSize: 12,
              fontWeight: "700"
            }}
          >
            {producto.product_variants.length}
            {" "}variantes
          </span>

          {/* activo */}
          <span
            style={{
              background:
                producto.active
                  ? "#ecfdf5"
                  : "#fef2f2",

              color:
                producto.active
                  ? "#059669"
                  : "#dc2626",

              padding: "8px 14px",

              borderRadius: 999,

              fontSize: 12,
              fontWeight: "700"
            }}
          >
            {producto.active
              ? "● Activo"
              : "● Oculto"}
          </span>

        </div>

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
            $
            {Math.min(
              ...producto.product_variants.map(
                v => v.price || 0
              )
            ).toLocaleString("es-CL")}
          </div>

        </div>

      </div>

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

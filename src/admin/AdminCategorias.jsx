import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../supabaseClient";

export default function AdminCategorias() {

  const [categories, setCategories] =
    useState([]);

  const [newCategory, setNewCategory] =
    useState({
      name: "",
      slug: "",
      image: "",
      sort_order: 0
    });

  // 🔥 cargar categorías
  useEffect(() => {

    cargarCategorias();

  }, []);

  const cargarCategorias = async () => {

    const { data } =
      await supabase
        .from("categories")
        .select("*")
        .order("sort_order", {
          ascending: true
        });

    setCategories(data || []);

  };

  // 🔥 crear categoría
  const crearCategoria = async () => {

    if (
      !newCategory.name ||
      !newCategory.slug
    ) {
      alert(
        "Completa nombre y slug"
      );

      return;
    }

    const { error } =
      await supabase
        .from("categories")
        .insert([{
          ...newCategory,
          active: true
        }]);

    if (error) {

      alert(error.message);

      return;

    }

    setNewCategory({
      name: "",
      slug: "",
      image: "",
      sort_order: 0
    });

    cargarCategorias();

  };

  // 🔥 actualizar


  // 🔥 eliminar
  const eliminarCategoria =
    async (id) => {

      const ok =
        confirm(
          "¿Eliminar categoría?"
        );

      if (!ok) return;

      await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      cargarCategorias();

    };

  const guardarCategoria =
  async (cat) => {

    const { error } =
      await supabase
        .from("categories")
        .update({
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          sort_order:
            cat.sort_order,
          active: cat.active
        })
        .eq("id", cat.id);

    if (error) {

      alert(error.message);

      return;

    }

    alert(
      "Categoría actualizada"
    );

    await cargarCategorias();

};

  return (

    <div
      style={{
        padding: 30,
        maxWidth: 1400,
        margin: "auto"
      }}
    >

<div
  style={{
    marginBottom: 40
  }}
>

  <p
    style={{
      color: "#ec4899",
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
      fontSize: 13
    }}
  >
    Administración
  </p>

  <h1
    style={{
      fontSize: 46,
      fontWeight: "900",
      color: "#111827",
      marginTop: 10
    }}
  >
    🗂 Gestión de categorías
  </h1>

</div>

      {/* 🔥 CREAR */}
      <div
        style={{
          background: "#f5f7fb",
          padding: 20,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow:
  "0 10px 40px rgba(0,0,0,0.05)",

border:
  "1px solid rgba(255,255,255,0.6)",

backdropFilter:
  "blur(14px)",

background:
  "rgba(255,255,255,0.85)"
        }}
      >

        <h2
          style={{
            marginBottom: 20
          }}
        >
          Nueva categoría
        </h2>

        <div
  style={{
    display: "grid",
    gap: 14
  }}
>

          <input
            placeholder="Nombre"

            value={newCategory.name}

            onChange={(e) => {

  const value =
    e.target.value;

  setNewCategory(prev => ({

    ...prev,

    name: value,

    slug:
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")

  }));

}}

            style={{
  padding: 14,

  borderRadius: 16,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 15,

  fontWeight: "500",

  outline: "none"
}}
          />
            

          <input
            placeholder="Slug"

            value={newCategory.slug}

            onChange={(e) =>
              setNewCategory(prev => ({
                ...prev,
                slug: e.target.value
              }))
            }

            style={{
  padding: 14,

  borderRadius: 16,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 15,

  fontWeight: "500",

  outline: "none"
}}
          />

          <input
            placeholder="URL Imagen"

            value={newCategory.image}

            onChange={(e) =>
              setNewCategory(prev => ({
                ...prev,
                image: e.target.value
              }))
            }

            style={{
  padding: 14,

  borderRadius: 16,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 15,

  fontWeight: "500",

  outline: "none"
}}
          />

          {newCategory.image && (

  <div
  style={{
    display: "flex",
    justifyContent: "center"
  }}
>
  <img
    src={newCategory.image}

    style={{
      width: "100%",
      maxWidth: 240,

      aspectRatio: "4/5",

      objectFit: "cover",

      borderRadius: 20,

      marginTop: 10,

      boxShadow:
        "0 15px 35px rgba(0,0,0,0.12)"
    }}
  />
    </div>

)}

          <input
            type="number"

            placeholder="Orden"

            value={
              newCategory.sort_order
            }

            onChange={(e) =>
              setNewCategory(prev => ({
                ...prev,
                sort_order:
                  e.target.value
              }))
            }

            style={{
  padding: 14,

  borderRadius: 16,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 15,

  fontWeight: "500",

  outline: "none"
}}
          />

          <button
            onClick={
              crearCategoria
            }

            onMouseEnter={(e) => {

  e.currentTarget.style.transform =
    "translateY(-2px)";

}}

onMouseLeave={(e) => {

  e.currentTarget.style.transform =
    "translateY(0px)";

}}

            style={{
              background:
  "linear-gradient(135deg,#ec4899,#8b5cf6)",
              boxShadow:
  "0 10px 30px rgba(236,72,153,0.35)",

              color: "#fff",

              padding: "12px 18px",

              border: "none",

              borderRadius: 14,

              fontWeight: "700",

              cursor: "pointer",
              transition: "all .3s ease",
              transform: "translateY(0px)"
            }}
          >
            ➕ Crear categoría
          </button>

        </div>

      </div>

      {/* 🔥 LISTA */}
      <div
        style={{
          display: "grid",
          gap: 18
        }}
      >

        {categories.map((cat, index) => (

<div
  key={cat.id}

  onMouseEnter={(e) => {

    e.currentTarget.style.transform =
      "translateY(-2px)";

  }}

  onMouseLeave={(e) => {

    e.currentTarget.style.transform =
      "translateY(0px)";

  }}

  style={{
    background:
      "rgba(255,255,255,0.9)",

    backdropFilter:
      "blur(12px)",

    border:
      "1px solid #f1f5f9",

    padding: 20,

    borderRadius: 20,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.05)",

    transition:
      "all .3s ease",

    transform:
      "translateY(0px)"
  }}
>

            <div
  style={{
    display: "grid",

gridTemplateColumns:
  "repeat(auto-fit,minmax(280px,1fr))",

    gap: 24,

    alignItems: "start"
  }}
>
              <div
  style={{
    display: "grid",
    gap: 14
  }}
>

              <input
                value={cat.name}

                onChange={(e) => {

  const updated =
    [...categories];

  updated[index].name =
    e.target.value;

  setCategories(updated);

}}

                style={{
  padding: 14,

  borderRadius: 14,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 14,

  fontWeight: "500",

  outline: "none"
}}
              />

              <input
                value={cat.slug}

onChange={(e) => {

  const updated =
    [...categories];

  updated[index].slug =
    e.target.value;

  setCategories(updated);

}}

                style={{
  padding: 14,

  borderRadius: 14,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 14,

  fontWeight: "500",

  outline: "none"
}}
              />

              <input
                value={
                  cat.image || ""
                }
onChange={(e) => {

  const updated =
    [...categories];

  updated[index].image =
    e.target.value;

  setCategories(updated);

}}


                style={{
  padding: 14,

  borderRadius: 14,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 14,

  fontWeight: "500",

  outline: "none"
}}
              />



              <input
                type="number"

                value={
                  cat.sort_order || 0
                }

                onChange={(e) => {

  const updated =
    [...categories];

  updated[index].sort_order =
    e.target.value;

  setCategories(updated);

}}

                style={{
  padding: 14,

  borderRadius: 14,

  border:
    "1px solid #e5e7eb",

  background:
    "#fff",

  fontSize: 14,

  fontWeight: "500",

  outline: "none"
}}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}
              >

                <input
                  type="checkbox"

                  checked={cat.active}

                  onChange={(e) => {

  const updated =
    [...categories];

  updated[index].active =
    e.target.checked;

  setCategories(updated);

}}

                />

                Activa

              </label>

              <button
  onClick={() =>
    guardarCategoria(cat)
  }

  onMouseEnter={(e) => {

    e.currentTarget.style.transform =
      "translateY(-2px)";

  }}

  onMouseLeave={(e) => {

    e.currentTarget.style.transform =
      "translateY(0px)";

  }}

  style={{
    background:
      "linear-gradient(135deg,#ec4899,#8b5cf6)",

    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "700",
    boxShadow:
      "0 10px 30px rgba(236,72,153,0.25)",
    transition:
      "all .3s ease",
    transform:
      "translateY(0px)"
  }}
>
  💾 Guardar cambios
</button>

              <button
                onClick={() =>
                  eliminarCategoria(
                    cat.id
                  )
                }

                onMouseEnter={(e) => {

  e.currentTarget.style.transform =
    "translateY(-2px)";

}}

onMouseLeave={(e) => {

  e.currentTarget.style.transform =
    "translateY(0px)";

}}

                style={{
                  background:
  "linear-gradient(135deg,#111827,#374151)",

boxShadow:
  "0 10px 20px rgba(0,0,0,0.15)",

                  color: "#fff",
                  border: "none",
                  padding: 12,
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all .3s ease",
                  transform: "translateY(0px)"
                }}
              >
                🗑 Eliminar
              </button>

                </div>

<div>

  {cat.image && (

    <img
      src={cat.image}

      onMouseEnter={(e) => {

  e.currentTarget.style.transform =
    "scale(1.02)";

}}

onMouseLeave={(e) => {

  e.currentTarget.style.transform =
    "scale(1)";

}}

      style={{
        width: "100%",
        maxHeight: 360,
        aspectRatio: "4/5",
        objectFit: "cover",

        borderRadius: 22,

        boxShadow:
          "0 15px 35px rgba(0,0,0,0.12)",
        transition: "all .4s ease",
        transform: "scale(1)"
      }}
    />

  )}

</div>

              </div>

            </div>

          </div>

        ))}

      </div>


  );

}

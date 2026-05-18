import {
  useEffect,
  useState
} from "react";

import { supabase }
from "./supabaseClient";

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
  const actualizarCategoria =
    async (
      id,
      field,
      value
    ) => {

      await supabase
        .from("categories")
        .update({
          [field]: value
        })
        .eq("id", id);

    };

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

  return (

    <div
      style={{
        padding: 30,
        maxWidth: 900,
        margin: "auto"
      }}
    >

      <h1
        style={{
          fontSize: 34,
          fontWeight: "900",
          marginBottom: 30
        }}
      >
        ⚙️ Administrar categorías
      </h1>

      {/* 🔥 CREAR */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.06)"
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
            gap: 12
          }}
        >

          <input
            placeholder="Nombre"

            value={newCategory.name}

            onChange={(e) =>
              setNewCategory(prev => ({
                ...prev,
                name: e.target.value
              }))
            }

            style={{
              padding: 12
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
              padding: 12
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
              padding: 12
            }}
          />

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
              padding: 12
            }}
          />

          <button
            onClick={
              crearCategoria
            }

            style={{
              background:
                "#ec4899",

              color: "#fff",

              padding: 14,

              border: "none",

              borderRadius: 14,

              fontWeight: "700",

              cursor: "pointer"
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

        {categories.map(cat => (

          <div
            key={cat.id}

            style={{
              background: "#fff",

              padding: 20,

              borderRadius: 20,

              boxShadow:
                "0 10px 30px rgba(0,0,0,0.05)"
            }}
          >

            <div
              style={{
                display: "grid",
                gap: 12
              }}
            >

              <input
                value={cat.name}

                onChange={(e) =>
                  actualizarCategoria(
                    cat.id,
                    "name",
                    e.target.value
                  )
                }

                style={{
                  padding: 10
                }}
              />

              <input
                value={cat.slug}

                onChange={(e) =>
                  actualizarCategoria(
                    cat.id,
                    "slug",
                    e.target.value
                  )
                }

                style={{
                  padding: 10
                }}
              />

              <input
                value={
                  cat.image || ""
                }

                onChange={(e) =>
                  actualizarCategoria(
                    cat.id,
                    "image",
                    e.target.value
                  )
                }

                style={{
                  padding: 10
                }}
              />

              <input
                type="number"

                value={
                  cat.sort_order || 0
                }

                onChange={(e) =>
                  actualizarCategoria(
                    cat.id,
                    "sort_order",
                    e.target.value
                  )
                }

                style={{
                  padding: 10
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

                  onChange={(e) =>
                    actualizarCategoria(
                      cat.id,
                      "active",
                      e.target.checked
                    )
                  }
                />

                Activa

              </label>

              <button
                onClick={() =>
                  eliminarCategoria(
                    cat.id
                  )
                }

                style={{
                  background:
                    "#ef4444",

                  color: "#fff",

                  border: "none",

                  padding: 12,

                  borderRadius: 12,

                  cursor: "pointer",

                  fontWeight: "700"
                }}
              >
                🗑 Eliminar
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

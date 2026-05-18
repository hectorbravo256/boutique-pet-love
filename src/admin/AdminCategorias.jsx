import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../supabaseClient";

import AdminCard
from "./components/AdminCard";

import AdminInput
from "./components/AdminInput";

import AdminButton
from "./components/AdminButton";

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

  // 🔥 guardar
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

    <div className="
      max-w-[1400px]
      mx-auto
      p-4
      md:p-8
    ">

      {/* HEADER */}
      <div className="mb-10">

        <p className="
          text-pink-500
          uppercase
          tracking-[0.3em]
          text-xs
          font-bold
        ">
          Administración
        </p>

        <h1 className="
          text-4xl
          md:text-5xl
          font-black
          text-slate-900
          mt-3
        ">
          🗂 Gestión de categorías
        </h1>

      </div>

      {/* CREAR */}
      <AdminCard className="mb-8">

        <h2 className="
          text-2xl
          font-black
          text-slate-900
          mb-6
        ">
          Nueva categoría
        </h2>

        <div className="
          grid
          gap-4
        ">

          <AdminInput
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
          />

          <AdminInput
            placeholder="Slug"

            value={newCategory.slug}

            onChange={(e) =>
              setNewCategory(prev => ({
                ...prev,
                slug: e.target.value
              }))
            }
          />

          <AdminInput
            placeholder="URL Imagen"

            value={newCategory.image}

            onChange={(e) =>
              setNewCategory(prev => ({
                ...prev,
                image: e.target.value
              }))
            }
          />

          {newCategory.image && (

            <div className="
              flex
              justify-center
            ">

              <img
                src={newCategory.image}

                className="
                  w-full
                  max-w-[240px]

                  aspect-[4/5]
                  object-cover

                  rounded-[24px]

                  shadow-[0_15px_35px_rgba(0,0,0,0.12)]

                  transition-all
                  duration-500

                  hover:scale-[1.02]
                "
              />

            </div>

          )}

          <AdminInput
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
          />

          <AdminButton
            onClick={crearCategoria}
          >
            ➕ Crear categoría
          </AdminButton>

        </div>

      </AdminCard>

      {/* LISTA */}
      <div className="
        grid
        gap-6
      ">

        {categories.map((cat, index) => (

          <AdminCard
            key={cat.id}
          >

            <div className="
              grid
              lg:grid-cols-[1fr_280px]
              gap-6
              items-start
            ">

              {/* FORM */}
              <div className="
                grid
                gap-4
              ">

                <AdminInput
                  value={cat.name}

                  onChange={(e) => {

                    const updated =
                      [...categories];

                    updated[index].name =
                      e.target.value;

                    setCategories(updated);

                  }}
                />

                <AdminInput
                  value={cat.slug}

                  onChange={(e) => {

                    const updated =
                      [...categories];

                    updated[index].slug =
                      e.target.value;

                    setCategories(updated);

                  }}
                />

                <AdminInput
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
                />

                <AdminInput
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
                />

                <label className="
                  flex
                  items-center
                  gap-3

                  text-sm
                  font-semibold
                  text-slate-700
                ">

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

                <AdminButton
                  onClick={() =>
                    guardarCategoria(cat)
                  }
                >
                  💾 Guardar cambios
                </AdminButton>

                <AdminButton
                  danger

                  onClick={() =>
                    eliminarCategoria(
                      cat.id
                    )
                  }
                >
                  🗑 Eliminar
                </AdminButton>

              </div>

              {/* IMAGE */}
              <div>

                {cat.image && (

                  <img
                    src={cat.image}

                    className="
                      w-full
                      max-h-[360px]

                      aspect-[4/5]
                      object-cover

                      rounded-[24px]

                      shadow-[0_15px_35px_rgba(0,0,0,0.12)]

                      transition-all
                      duration-500

                      hover:scale-[1.02]
                    "
                  />

                )}

              </div>

            </div>

          </AdminCard>

        ))}

      </div>

    </div>

  );

}

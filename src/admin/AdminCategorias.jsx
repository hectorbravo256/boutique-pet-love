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
    <div className="
      bg-white/80
      backdrop-blur-xl
      border
      border-white/60
      rounded-[30px]
      p-6
      shadow-[0_10px_40px_rgba(0,0,0,0.05)]
      mb-8
    ">

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

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            font-medium
            outline-none
            transition-all
            duration-300
            focus:border-pink-400
            focus:ring-4
            focus:ring-pink-100
          "
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

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            font-medium
            outline-none
            transition-all
            duration-300
            focus:border-pink-400
            focus:ring-4
            focus:ring-pink-100
          "
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

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            font-medium
            outline-none
            transition-all
            duration-300
            focus:border-pink-400
            focus:ring-4
            focus:ring-pink-100
          "
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

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            font-medium
            outline-none
            transition-all
            duration-300
            focus:border-pink-400
            focus:ring-4
            focus:ring-pink-100
          "
        />

        <button
          onClick={
            crearCategoria
          }

          className="
            bg-gradient-to-r
            from-pink-500
            to-purple-500

            hover:opacity-90
            hover:-translate-y-0.5

            transition-all
            duration-300

            text-white
            font-bold

            py-3
            rounded-2xl

            shadow-[0_10px_30px_rgba(236,72,153,0.35)]
          "
        >
          ➕ Crear categoría
        </button>

      </div>

    </div>

    {/* LISTA */}
    <div className="
      grid
      gap-6
    ">

      {categories.map((cat, index) => (

        <div
          key={cat.id}

          className="
            bg-white/90
            backdrop-blur-xl

            border
            border-slate-100

            rounded-[30px]

            p-5

            shadow-[0_10px_30px_rgba(0,0,0,0.05)]

            transition-all
            duration-300

            hover:-translate-y-1
          "
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

              <input
                value={cat.name}

                onChange={(e) => {

                  const updated =
                    [...categories];

                  updated[index].name =
                    e.target.value;

                  setCategories(updated);

                }}

                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  duration-300
                  focus:border-pink-400
                  focus:ring-4
                  focus:ring-pink-100
                "
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

                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  duration-300
                  focus:border-pink-400
                  focus:ring-4
                  focus:ring-pink-100
                "
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

                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  duration-300
                  focus:border-pink-400
                  focus:ring-4
                  focus:ring-pink-100
                "
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

                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  duration-300
                  focus:border-pink-400
                  focus:ring-4
                  focus:ring-pink-100
                "
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

              <button
                onClick={() =>
                  guardarCategoria(cat)
                }

                className="
                  bg-gradient-to-r
                  from-pink-500
                  to-purple-500

                  hover:opacity-90
                  hover:-translate-y-0.5

                  transition-all
                  duration-300

                  text-white
                  font-bold

                  py-3
                  rounded-2xl

                  shadow-[0_10px_30px_rgba(236,72,153,0.25)]
                "
              >
                💾 Guardar cambios
              </button>

              <button
                onClick={() =>
                  eliminarCategoria(
                    cat.id
                  )
                }

                className="
                  bg-gradient-to-r
                  from-slate-800
                  to-slate-700

                  hover:opacity-90
                  hover:-translate-y-0.5

                  transition-all
                  duration-300

                  text-white
                  font-bold

                  py-3
                  rounded-2xl

                  shadow-[0_10px_20px_rgba(0,0,0,0.15)]
                "
              >
                🗑 Eliminar
              </button>

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

        </div>

      ))}

    </div>

  </div>

);

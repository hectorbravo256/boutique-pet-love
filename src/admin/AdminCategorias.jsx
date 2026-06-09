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

import { useNavigate }
from "react-router-dom";

export default function AdminCategorias() {

  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

const [newCategory, setNewCategory] =
  useState({
    name: "",
    slug: "",
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
  sort_order: 0
});
    cargarCategorias();

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
<AdminCard className="mb-10">

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
  md:grid-cols-3
  gap-4
  items-end
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
    .replace(/\s*-\s*/g, "-")
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

<div className="
  md:col-span-3

  flex
  justify-end
">

  <AdminButton
    onClick={crearCategoria}
  >
    ➕ Crear categoría
  </AdminButton>

</div>

        </div>

      </AdminCard>

      {/* LISTA */}
      <div className="
        grid
        gap-6
      ">
{categories.map((cat) => (

  <AdminCard
    key={cat.id}

    onClick={() =>
      navigate(
        `/admin/categorias/${cat.slug}`
      )
    }

className="
  cursor-pointer

  hover:-translate-y-1
  hover:shadow-xl

  transition-all
  duration-300
"
  >

    <div className="
      flex
      items-center
      justify-between
      gap-6
    ">

      <div className="
        flex
        items-center
        gap-5
      ">

<img
  src={
    cat.image ||
    "/placeholder.png"
  }

  alt={cat.name}

  className="
    w-24
    h-24

    rounded-3xl

    object-cover

    shadow-md

    border
    border-white
  "
/>

<div>

  <div className="
    text-xl
    font-black
    text-slate-900
  ">
    {cat.name}
  </div>

  <div className="
    text-sm
    text-slate-500
    mt-1
  ">
    /categoria/{cat.slug}
  </div>

  <div className="
    text-xs
    text-slate-400
    mt-2
  ">
    📂 Administrar SEO, imagen y configuración
  </div>

</div>

      </div>

      <div className="
        flex
        items-center
        gap-3
      ">

        <div className={`
          px-4
          py-2

          rounded-full

          text-sm
          font-bold

          ${
            cat.active
              ? `
                bg-emerald-50
                text-emerald-600
              `
              : `
                bg-red-50
                text-red-600
              `
          }
        `}>

          {cat.active
            ? "Activa"
            : "Inactiva"}

        </div>

        <div className="
          text-slate-400
          text-xl
        ">
          →
        </div>

      </div>

    </div>

  </AdminCard>

))}

      </div>

    </div>

  );

}

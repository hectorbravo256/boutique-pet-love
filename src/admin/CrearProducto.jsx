import {
  useState,
  useEffect
} from "react";

import { supabase }
from "../supabaseClient";

import AdminCard
from "./components/AdminCard";

import AdminInput
from "./components/AdminInput";

import AdminButton
from "./components/AdminButton";

export default function CrearProducto() {

  const [categories, setCategories] =
    useState([]);

  const [toast, setToast] =
    useState("");

  const [newProduct, setNewProduct] =
    useState({
      name: "",
      category: "",
      gender: "unisex",
      image: "",
      variants: [
        {
          size: "",
          price: "",
          stock: ""
        }
      ]
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
        .eq("active", true)
        .order("sort_order", {
          ascending: true
        });

    setCategories(data || []);

  };

  // 🔥 crear producto
  const crearProducto = async () => {

    if (
      !newProduct.name ||
      !newProduct.category
    ) {

      mostrarToast(
        "Completa nombre y categoría"
      );

      return;

    }

    // 🔥 insertar producto
    const { data, error } =
      await supabase
        .from("products")
        .insert([{
          name: newProduct.name,
          category:
            newProduct.category,
          gender:
            newProduct.gender,
          active: true
        }])
        .select()
        .single();

    if (error) {

      mostrarToast(
        "Error creando producto"
      );

      return;

    }

    const productId = data.id;

    // 🔥 insertar imagen
    if (newProduct.image) {

      await supabase
        .from("product_images")
        .insert([{
          product_id: productId,
          url: newProduct.image,
          sort_order: 0
        }]);

    }

    // 🔥 insertar variantes
    const variantes =
      newProduct.variants
        .filter(v =>
          v.size && v.price
        )
        .map(v => ({
          product_id: productId,
          size: v.size,
          price: Number(v.price),
          stock:
            Number(v.stock || 0)
        }));

    if (variantes.length > 0) {

      await supabase
        .from("product_variants")
        .insert(variantes);

    }

    mostrarToast(
      "Producto creado"
    );

    // 🔥 reset
    setNewProduct({
      name: "",
      category: "",
      gender: "unisex",
      image: "",
      variants: [
        {
          size: "",
          price: "",
          stock: ""
        }
      ]
    });

  };

  // 🔥 toast
  const mostrarToast = (msg) => {

    setToast(msg);

    setTimeout(() => {

      setToast("");

    }, 2500);

  };

  return (

    <div className="
      max-w-[1000px]
      mx-auto
      p-4
      md:p-8
    ">

      <AdminCard>

        {/* HEADER */}
        <div className="mb-8">

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
            ➕ Crear producto
          </h1>

        </div>

        {/* FORM */}
        <div className="
          grid
          gap-5
        ">

          {/* NOMBRE */}
          <AdminInput
            placeholder="Nombre"

            value={newProduct.name}

            onChange={(e) =>
              setNewProduct(prev => ({
                ...prev,
                name: e.target.value
              }))
            }
          />

          {/* CATEGORÍA */}
          <select
            value={newProduct.category}

            onChange={(e) =>
              setNewProduct(prev => ({
                ...prev,
                category:
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
          >

            <option value="">
              Selecciona categoría
            </option>

            {categories.map(cat => (

              <option
                key={cat.id}
                value={cat.slug}
              >
                {cat.name}
              </option>

            ))}

          </select>

          {/* GÉNERO */}
          <select
            value={newProduct.gender}

            onChange={(e) =>
              setNewProduct(prev => ({
                ...prev,
                gender:
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
          >

            <option value="macho">
              🐶 Macho
            </option>

            <option value="hembra">
              🎀 Hembra
            </option>

            <option value="unisex">
              ✨ Unisex
            </option>

          </select>

          {/* VARIANTES */}
          <div className="
            bg-slate-50

            border
            border-slate-100

            rounded-[28px]

            p-5
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-5
            ">

              <h2 className="
                text-2xl
                font-black
                text-slate-900
              ">
                📏 Variantes
              </h2>

              <button
                onClick={() => {

                  const tallas = [];

                  for (
                    let i = 0;
                    i <= 12;
                    i++
                  ) {

                    tallas.push({
                      size: `Talla ${i}`,
                      price: "",
                      stock: ""
                    });

                  }

                  setNewProduct(prev => ({
                    ...prev,
                    variants: tallas
                  }));

                }}

                className="
                  bg-emerald-500
                  hover:bg-emerald-600

                  transition-all
                  duration-300

                  text-white
                  text-sm
                  font-bold

                  px-4
                  py-2

                  rounded-xl
                "
              >
                ⚡ Generar 0–12
              </button>

            </div>

            <div className="
              grid
              gap-3
            ">

              {newProduct.variants.map(
                (v, index) => (

                <div
                  key={index}

                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-[1fr_140px_120px_60px]
                    gap-3
                  "
                >

                  {/* TALLA */}
                  <AdminInput
                    placeholder="Talla"

                    value={v.size}

                    onChange={(e) => {

                      const updated =
                        [...newProduct.variants];

                      updated[index].size =
                        e.target.value;

                      setNewProduct(prev => ({
                        ...prev,
                        variants: updated
                      }));

                    }}
                  />

                  {/* PRECIO */}
                  <AdminInput
                    type="number"

                    placeholder="Precio"

                    value={v.price}

                    onChange={(e) => {

                      const updated =
                        [...newProduct.variants];

                      updated[index].price =
                        e.target.value;

                      setNewProduct(prev => ({
                        ...prev,
                        variants: updated
                      }));

                    }}
                  />

                  {/* STOCK */}
                  <AdminInput
                    type="number"

                    placeholder="Stock"

                    value={v.stock}

                    onChange={(e) => {

                      const updated =
                        [...newProduct.variants];

                      updated[index].stock =
                        e.target.value;

                      setNewProduct(prev => ({
                        ...prev,
                        variants: updated
                      }));

                    }}
                  />

                  {/* ELIMINAR */}
                  <button
                    onClick={() => {

                      setNewProduct(prev => ({
                        ...prev,

                        variants:
                          prev.variants.filter(
                            (_, i) =>
                              i !== index
                          )
                      }));

                    }}

                    className="
                      bg-red-500
                      hover:bg-red-600

                      transition-all
                      duration-300

                      rounded-2xl

                      text-white
                      font-bold
                    "
                  >
                    ✕
                  </button>

                </div>

              ))}

            </div>

            {/* AGREGAR */}
            <button
              onClick={() => {

                setNewProduct(prev => ({
                  ...prev,

                  variants: [
                    ...prev.variants,
                    {
                      size: "",
                      price: "",
                      stock: ""
                    }
                  ]
                }));

              }}

              className="
                mt-5

                bg-blue-500
                hover:bg-blue-600

                transition-all
                duration-300

                text-white
                font-bold

                px-4
                py-3

                rounded-2xl
              "
            >
              ➕ Agregar talla
            </button>

          </div>

          {/* IMAGEN */}
          <AdminInput
            placeholder="URL Imagen"

            value={newProduct.image}

            onChange={(e) =>
              setNewProduct(prev => ({
                ...prev,
                image: e.target.value
              }))
            }
          />

          {/* PREVIEW */}
          {newProduct.image && (

            <div className="
              flex
              justify-center
            ">

              <img
                src={newProduct.image}

                className="
                  w-full
                  max-w-[260px]

                  aspect-[4/5]
                  object-cover

                  rounded-[28px]

                  shadow-[0_15px_35px_rgba(0,0,0,0.12)]

                  transition-all
                  duration-500

                  hover:scale-[1.02]
                "
              />

            </div>

          )}

          {/* CREAR */}
          <AdminButton
            onClick={crearProducto}
          >
            🚀 Crear producto
          </AdminButton>

        </div>

      </AdminCard>

      {/* TOAST */}
      {toast && (

        <div className="
          fixed
          bottom-5
          right-5

          bg-[#111827]

          text-white
          font-semibold

          px-5
          py-3

          rounded-2xl

          shadow-2xl

          z-[999]
        ">

          {toast}

        </div>

      )}

    </div>

  );

}

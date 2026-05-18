import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../supabaseClient";

import { Link }
from "react-router-dom";

import AdminCard
from "./components/AdminCard";

import AdminInput
from "./components/AdminInput";

export default function Productos() {

  const [productosFull, setProductosFull] =
    useState([]);

  const [searchProduct, setSearchProduct] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [orden, setOrden] =
    useState({
      campo: "name",
      direccion: "asc"
    });

  const [filtroCategoria, setFiltroCategoria] =
    useState("");

  const showToast = (msg) => {

    setToast(msg);

    setTimeout(() => {

      setToast("");

    }, 2500);

  };

  const recargarProductos =
    async () => {

      const { data } =
        await supabase
          .from("products")
          .select(`
            *,
            product_variants (*),
            product_images (*)
          `)

          .order("sort_order", {
            foreignTable:
              "product_images",
            ascending: true
          })

          .order("name", {
            ascending: true
          });

      setProductosFull(
        Array.isArray(data)
          ? data
          : []
      );

    };

  const ordenarProductos =
    (lista) => {

      if (!Array.isArray(lista))
        return [];

      return [...lista].sort(
        (a, b) => {

          let valA, valB;

          if (orden.campo === "name") {

            valA =
              a.name.toLowerCase();

            valB =
              b.name.toLowerCase();

          }

          if (
            orden.campo === "category"
          ) {

            valA =
              (
                a.category || ""
              ).toLowerCase();

            valB =
              (
                b.category || ""
              ).toLowerCase();

          }

          if (orden.campo === "price") {

            valA =
              a.product_variants?.[0]
                ?.price || 0;

            valB =
              b.product_variants?.[0]
                ?.price || 0;

          }

          if (valA < valB)
            return orden.direccion === "asc"
              ? -1
              : 1;

          if (valA > valB)
            return orden.direccion === "asc"
              ? 1
              : -1;

          return 0;

        }
      );

    };

  useEffect(() => {

    recargarProductos();

  }, []);

  return (

    <div className="
      p-4
      md:p-8
    ">

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
          🛒 Productos
        </h1>

      </div>

      {/* FILTROS */}
      <AdminCard className="mb-6">

        <div className="
          grid
          md:grid-cols-2
          gap-4
        ">

          <AdminInput
            placeholder="🔍 Buscar producto..."

            value={searchProduct}

            onChange={(e) =>
              setSearchProduct(
                e.target.value
              )
            }
          />

          <select
            value={filtroCategoria}

            onChange={(e) =>
              setFiltroCategoria(
                e.target.value
              )
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
              Todas las categorías
            </option>

            {[
              ...new Set(
                productosFull.map(
                  p => p.category
                )
              )
            ].map(cat => (

              <option
                key={cat}
                value={cat}
              >
                {cat}
              </option>

            ))}

          </select>

        </div>

      </AdminCard>

      {/* TABLA */}
      <AdminCard className="overflow-x-auto">

        <table className="
          w-full
          min-w-[850px]
        ">

          <thead>

            <tr className="
              border-b
              border-slate-100
            ">

              <th className="
                text-left
                p-4
              ">
                ⚙️
              </th>

              <th
                className="
                  text-left
                  p-4
                  cursor-pointer
                "

                onClick={() =>
                  setOrden(prev => ({
                    campo: "name",

                    direccion:
                      prev.direccion === "asc"
                        ? "desc"
                        : "asc"
                  }))
                }
              >
                Producto ⬍
              </th>

              <th
                className="
                  text-left
                  p-4
                  cursor-pointer
                "

                onClick={() =>
                  setOrden(prev => ({
                    campo: "category",

                    direccion:
                      prev.direccion === "asc"
                        ? "desc"
                        : "asc"
                  }))
                }
              >
                Categoría ⬍
              </th>

              <th className="
                text-left
                p-4
              ">
                Variantes
              </th>

              <th className="
                text-left
                p-4
              ">
                Precio desde
              </th>

            </tr>

          </thead>

          <tbody>

            {ordenarProductos(

              productosFull

                .filter(p =>
                  p.name
                    .toLowerCase()
                    .includes(
                      searchProduct
                        .toLowerCase()
                    )
                )

                .filter(p =>
                  filtroCategoria
                    ? p.category ===
                      filtroCategoria
                    : true
                )

            ).map(p => (

              <FilaProducto
                key={p.id}

                p={p}

                setProductosFull={
                  setProductosFull
                }

                recargarProductos={
                  recargarProductos
                }

                showToast={showToast}
              />

            ))}

          </tbody>

        </table>

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

function FilaProducto({
  p,
  setProductosFull,
  showToast
}) {

  return (

    <tr className="
      border-b
      border-slate-100

      hover:bg-slate-50

      transition-all
      duration-200
    ">

      {/* ACCIONES */}
      <td className="p-4">

        <button
          onClick={async () => {

            if (
              !confirm(
                "¿Eliminar producto completo?"
              )
            ) return;

            await supabase
              .from("product_variants")
              .delete()
              .eq(
                "product_id",
                p.id
              );

            await supabase
              .from("product_images")
              .delete()
              .eq(
                "product_id",
                p.id
              );

            await supabase
              .from("products")
              .delete()
              .eq("id", p.id);

            setProductosFull(prev =>
              prev.filter(
                prod =>
                  prod.id !== p.id
              )
            );

            showToast(
              "Producto eliminado"
            );

          }}

          className="
            w-10
            h-10

            rounded-2xl

            border
            border-red-100

            bg-gradient-to-br
            from-red-50
            to-pink-50

            text-red-500

            flex
            items-center
            justify-center

            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:scale-105

            hover:shadow-lg

            hover:from-red-500
            hover:to-pink-500

            hover:text-white
          "
        >
          ✕
        </button>

      </td>

      {/* PRODUCTO */}
      <td className="p-4">

        <div className="
          flex
          items-center
          gap-4
        ">

          <img
            src={
              p.product_images?.[0]
                ?.url
              ||
              "/placeholder.png"
            }

            className="
              w-14
              h-14

              rounded-2xl

              object-cover

              border
              border-slate-100
            "
          />

          <Link
            to={`/admin/producto/${p.id}`}

            className="
              font-bold
              text-slate-900

              hover:text-pink-500

              transition-all
              duration-300
            "
          >
            {p.name}
          </Link>

        </div>

      </td>

      {/* CATEGORÍA */}
      <td className="p-4">

        <span className="
          bg-slate-100

          px-3
          py-1.5

          rounded-full

          text-sm
          font-semibold

          text-slate-700
        ">
          {p.category}
        </span>

      </td>

      {/* VARIANTES */}
      <td className="p-4">

        <span className="
          bg-pink-50
          text-pink-600

          px-3
          py-1.5

          rounded-full

          text-sm
          font-bold
        ">
          {
            p.product_variants
              ?.length || 0
          } variantes
        </span>

      </td>

      {/* PRECIO */}
      <td className="p-4">

        <span className="
          font-black
          text-slate-900
        ">
          Desde $

          {Math.min(

            ...(p.product_variants || [])
              .map(v =>
                v.price || 0
              )

          ).toLocaleString(
            "es-CL"
          )}
        </span>

      </td>

    </tr>

  );

}

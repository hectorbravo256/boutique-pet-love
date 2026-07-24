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

import AdminModal
from "./components/AdminModal";

import ProductsSkeleton
from "./components/ProductsSkeleton";

import HeroProductos from "@/admin/products/components/HeroProductos";

export default function Productos() {

  const [productosFull, setProductosFull] =
    useState([]);

  const [loading, setLoading] =
  useState(true);

  const [searchProduct, setSearchProduct] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [
  deleteModal,
  setDeleteModal
] = useState(false);

const [
  productoEliminar,
  setProductoEliminar
] = useState(null);

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

      setLoading(false);

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

  if (loading) {

  return (
    <ProductsSkeleton />
  );

}

  return (

<div className="
  min-h-screen

  p-4
  md:p-8

  bg-gradient-to-b
  from-[#fff7fb]
  via-white
  to-[#fdf2f8]
">

<HeroProductos productos={productosFull} />

      {/* FILTROS */}
      <AdminCard className="
  mb-6

  hover:-translate-y-1
  transition-all
  duration-300
">

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
      <AdminCard className="
  overflow-x-auto

  hover:-translate-y-1
  transition-all
  duration-300
">

        <table className="
          w-full
          min-w-[850px]
        ">

          <thead className="
            sticky
            top-0
            z-10
            ">

            <tr className="
                border-b
                border-slate-100
                bg-slate-50/80
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

                setDeleteModal={
                  setDeleteModal
                }

                setProductoEliminar={
                  setProductoEliminar
                }
              />

            ))}

          </tbody>

        </table>

      </AdminCard>

  {/* DELETE MODAL */}
<AdminModal
  open={deleteModal}

  onClose={() => {

    setDeleteModal(false);

    setProductoEliminar(null);

  }}

  title="Eliminar producto"
>

  <p className="
    text-slate-600
    leading-relaxed
  ">
    ¿Seguro que deseas
    eliminar este producto?
  </p>

  <div className="
    flex
    justify-end
    gap-3

    mt-8
  ">

    <button
      onClick={() => {

        setDeleteModal(false);

        setProductoEliminar(null);

      }}

      className="
        px-5
        py-3

        rounded-2xl

        bg-slate-100
        hover:bg-slate-200

        font-semibold

        transition-all
      "
    >
      Cancelar
    </button>

    <button
      onClick={async () => {

        if (!productoEliminar)
          return;

        await supabase
          .from("product_variants")
          .delete()
          .eq(
            "product_id",
            productoEliminar.id
          );

        await supabase
          .from("product_images")
          .delete()
          .eq(
            "product_id",
            productoEliminar.id
          );

        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            productoEliminar.id
          );

        setProductosFull(prev =>
          prev.filter(
            prod =>
              prod.id !==
              productoEliminar.id
          )
        );

        showToast(
          "Producto eliminado"
        );

        setDeleteModal(false);

        setProductoEliminar(null);

      }}

      className="
        px-5
        py-3

        rounded-2xl

        bg-gradient-to-r
        from-red-500
        to-pink-500

        text-white
        font-bold

        shadow-lg

        hover:scale-[1.02]

        transition-all
      "
    >
      Eliminar
    </button>

  </div>

</AdminModal>

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

function MiniStat({
  label,
  value
}) {

  return (

    <div className="
      rounded-3xl

      bg-white/10
      backdrop-blur-xl

      border
      border-white/10

      p-4
    ">

      <div className="
        text-xs
        uppercase
        tracking-[0.2em]

        text-pink-100
        font-bold
      ">
        {label}
      </div>

      <div className="
        mt-3

        text-xl
        md:text-2xl

        font-black
      ">
        {value}
      </div>

    </div>

  );

}

function FilaProducto({
  p,
  setProductosFull,
  showToast,
  setDeleteModal,
  setProductoEliminar
}) {

  return (

    <tr className="
      border-b
      border-slate-100

      hover:bg-slate-50
      hover:shadow-sm
      transition-all
      duration-200
    ">

      {/* ACCIONES */}
      <td className="p-4">

        <button
          onClick={async () => {

            setProductoEliminar(p);

            setDeleteModal(true);

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
              w-16
              h-16
              shadow-md
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
              text-lg
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
          bg-gradient-to-r
          from-slate-100
          to-slate-50

          border
          border-slate-200

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
          bg-gradient-to-r
          from-pink-50
          to-purple-50

          border
          border-pink-100
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

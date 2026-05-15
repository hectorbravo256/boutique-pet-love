import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import { supabase } from "./supabaseClient";

export default function Collection() {

  const { slug } = useParams();

  const navigate =
    useNavigate();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    cargar();

  }, [slug]);

  const cargar = async () => {

    setLoading(true);

    let query =
      supabase
        .from("products")
        .select(`
          *,
          product_variants (*),
          product_images (*)
        `)
        .eq("active", true);

    if (slug === "new") {
      query =
        query.eq(
          "new_collection",
          true
        );
    }

    if (slug === "best-seller") {
      query =
        query.eq(
          "best_seller",
          true
        );
    }

    if (slug === "luxury") {
      query =
        query.eq(
          "luxury",
          true
        );
    }

    if (slug === "exclusive") {
      query =
        query.eq(
          "exclusive",
          true
        );
    }

    const { data } =
      await query;

    (data || []).forEach(product => {

  product.product_images?.sort(
    (a, b) =>
      (a.sort_order || 0)
      -
      (b.sort_order || 0)
  );

});

    setProducts(data || []);

    setLoading(false);

  };

  const titles = {

    "new":
      "🆕 Nueva colección",

    "best-seller":
      "🔥 Best Sellers",

    "luxury":
      "👑 Luxury Collection",

    "exclusive":
      "💎 Exclusivos"

  };

  if (loading) {

    return (
      <div style={{ padding: 40 }}>
        Cargando...
      </div>
    );

  }

  return (

    <div className="px-6 py-10">

      {/* HEADER */}
      <div className="mb-10">

        <p className="
          text-pink-500
          uppercase
          tracking-[0.3em]
          text-sm
          font-bold
        ">
          Colección
        </p>

        <h1 className="
          text-5xl
          font-black
          text-gray-900
          mt-3
        ">
          {titles[slug]}
        </h1>

      </div>

      {/* GRID */}
      <div className="
        grid
        grid-cols-2
        md:grid-cols-3
        xl:grid-cols-4
        gap-6
      ">

        {products.map(product => {

          const precios =
            product.product_variants
              ?.map(v =>
                Number(v.price)
              )
              .filter(v =>
                !isNaN(v)
              ) || [];

          const precio =
            precios.length > 0
              ? Math.min(...precios)
              : 0;

          return (

            <div
              key={product.id}

              onClick={() =>
                navigate(
                  `/producto/${product.id}`
                )
              }

              className="
                bg-white
                rounded-[30px]
                overflow-hidden
                shadow-sm
                hover:shadow-2xl
                transition-all
                duration-500
                hover:-translate-y-1
                cursor-pointer
                group
              "
            >

              {/* IMAGEN */}
              <div className="
                relative
                overflow-hidden
              ">

                <img
                  src={
                    product.product_images?.[0]?.url
                    || "/placeholder.png"
                  }

                  className="
                    w-full
                    aspect-square
                    object-cover
                    transition-all
                    duration-700
                    group-hover:scale-105
                  "
                />

              </div>

              {/* INFO */}
              <div className="p-5">

                <h3 className="
                  font-black
                  text-xl
                  text-gray-900
                  line-clamp-2
                ">
                  {product.name}
                </h3>

                <p className="
                  mt-4
                  text-pink-600
                  font-black
                  text-3xl
                ">
                  Desde $
                  {precio.toLocaleString("es-CL")}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}

import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import { supabase } from "./supabaseClient";

export default function Gender() {

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

    const { data } =
      await supabase
        .from("products")
        .select(`
          *,
          product_variants (*),
          product_images (*)
        `)
        .eq("active", true)
        .eq("gender", slug);

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

  if (loading) {

    return (

      <div
        style={{
          padding: 40
        }}
      >
        Cargando...
      </div>

    );

  }

  return (

    <div className="
  px-4
  md:px-6
  py-8
  overflow-x-hidden
">

      {/* HEADER */}
      <div
        style={{
          marginBottom: 34
        }}
      >

        <p
          style={{
            color: "#ec4899",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 2,
            fontSize: 13
          }}
        >
          Colección
        </p>

        <h1
          className="md:text-[46px]"
          
          style={{
            marginTop: 10,
            fontSize: 32,
            fontWeight: "900",
            color: "#111827",
            textTransform: "capitalize"
          }}
        >
          {slug}
        </h1>

      </div>

      {/* GRID */}
<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-3 md:gap-6
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

              style={{
                background: "#fff",

                borderRadius: 22,

                overflow: "hidden",

                cursor: "pointer",

                boxShadow:
                  "0 10px 35px rgba(0,0,0,0.05)",

                transition:
                  "all .3s ease"
              }}

              onMouseEnter={(e) => {

                e.currentTarget.style.transform =
                  "translateY(-4px)";

              }}

              onMouseLeave={(e) => {

                e.currentTarget.style.transform =
                  "translateY(0px)";

              }}
            >

              {/* imagen */}
              <img
                src={
                  product.product_images?.[0]?.url
                  || "/placeholder.png"
                }

                alt={product.name}

                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "cover"
                }}
              />

              {/* info */}
              <div
                style={{
                  padding: 14
                }}
              >

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#111827"
                  }}
                >
                  {product.name}
                </div>

                <div
                  style={{
                    marginTop: 12,

                    fontSize: 18,

                    fontWeight: "900",

                    color: "#ec4899"
                  }}
                >
                  Desde $
                  {precio.toLocaleString("es-CL")}
                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}

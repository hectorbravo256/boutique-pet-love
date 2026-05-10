import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProductoDetalle() {

  const { id } = useParams();

  const [producto, setProducto] = useState(null);

  const [estadoGuardado, setEstadoGuardado] =
    useState({});

  // 🔄 cargar producto
  useEffect(() => {

    cargarProducto();

  }, [id]);

  const cargarProducto = async () => {

    const { data } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq("id", id)
      .single();

    if (!data) return;

    const ordenTallas = {
      XXS: 1,
      XS: 2,
      S: 3,
      M: 4,
      L: 5,
      XL: 6,
      XXL: 7,
      XXXL: 8,

      "TALLA 0": 20,
      "TALLA 1": 21,
      "TALLA 2": 22,
      "TALLA 3": 23,
      "TALLA 4": 24,
      "TALLA 5": 25,
      "TALLA 6": 26,
      "TALLA 7": 27,
      "TALLA 8": 28,
      "TALLA 9": 29,
      "TALLA 10": 30,
      "TALLA 11": 31,
      "TALLA 12": 32
    };

    data.product_variants.sort((a, b) => {

      const tallaA =
        ordenTallas[
          a.size?.trim().toUpperCase()
        ] || 999;

      const tallaB =
        ordenTallas[
          b.size?.trim().toUpperCase()
        ] || 999;

      return tallaA - tallaB;

    });

    setProducto(data);

  };

  // 🔥 actualizar precio
  const actualizarPrecio = async (
    variantId,
    nuevoPrecio
  ) => {

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.map(v =>
          v.id === variantId
            ? { ...v, price: nuevoPrecio }
            : v
        )
    }));

    setEstadoGuardado(prev => ({
      ...prev,
      [variantId]: "saving"
    }));

    await supabase
      .from("product_variants")
      .update({ price: nuevoPrecio })
      .eq("id", variantId);

    setEstadoGuardado(prev => ({
      ...prev,
      [variantId]: "saved"
    }));

    setTimeout(() => {

      setEstadoGuardado(prev => ({
        ...prev,
        [variantId]: "idle"
      }));

    }, 1800);

  };

  // 🔥 actualizar stock
  const actualizarStock = async (
    variantId,
    nuevoStock
  ) => {

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.map(v =>
          v.id === variantId
            ? { ...v, stock: nuevoStock }
            : v
        )
    }));

    setEstadoGuardado(prev => ({
      ...prev,
      [`stock-${variantId}`]: "saving"
    }));

    await supabase
      .from("product_variants")
      .update({ stock: nuevoStock })
      .eq("id", variantId);

    setEstadoGuardado(prev => ({
      ...prev,
      [`stock-${variantId}`]: "saved"
    }));

    setTimeout(() => {

      setEstadoGuardado(prev => ({
        ...prev,
        [`stock-${variantId}`]: "idle"
      }));

    }, 1800);

  };

  // 🔥 eliminar talla
  const eliminarVariante = async (variantId) => {

    if (!confirm("¿Eliminar talla?")) return;

    await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    setProducto(prev => ({
      ...prev,
      product_variants:
        prev.product_variants.filter(
          v => v.id !== variantId
        )
    }));

  };

  // 🔥 agregar talla
  const agregarVariante = async () => {

    const size =
      prompt("Nueva talla");

    if (!size) return;

    const { data } = await supabase
      .from("product_variants")
      .insert([{
        product_id: producto.id,
        size,
        price: 0,
        stock: 0
      }])
      .select()
      .single();

    setProducto(prev => ({
      ...prev,
      product_variants: [
        ...prev.product_variants,
        data
      ]
    }));

    cargarProducto();

  };

  if (!producto) {

    return (
      <div style={{ padding: 30 }}>
        Cargando...
      </div>
    );

  }

  return (

    <div
      style={{
        padding: 30,
        background:
          "linear-gradient(to bottom,#fff,#fff7fb)",
        minHeight: "100vh"
      }}
    >

      {/* HEADER */}
      <div
        style={{
          marginBottom: 30
        }}
      >

        <Link
          to="/admin/productos"
          style={{
            textDecoration: "none",
            color: "#ec4899",
            fontWeight: "700"
          }}
        >
          ← Volver
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 16
          }}
        >

          <img
            src={
              producto.product_images?.[0]?.url
              || "/placeholder.png"
            }
            style={{
              width: 70,
              height: 70,
              borderRadius: 18,
              objectFit: "cover"
            }}
          />

          <div>

            <h1
              style={{
                margin: 0,
                fontSize: 28
              }}
            >
              {producto.name}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 8
              }}
            >

              <span
                style={{
                  background: "#f3f4f6",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: "700"
                }}
              >
                {producto.category}
              </span>

              <span
                style={{
                  background: "#ecfeff",
                  color: "#0891b2",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: "700"
                }}
              >
                {producto.product_variants.length}
                {" "}variantes
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* TABLA */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden"
        }}
      >

        <thead
          style={{
            background: "#f9fafb"
          }}
        >

          <tr>

            <th style={{ padding: 16 }}>
              Talla
            </th>

            <th style={{ padding: 16 }}>
              Precio
            </th>

            <th style={{ padding: 16 }}>
              Stock
            </th>

            <th style={{ padding: 16 }}>
              Estado
            </th>

            <th style={{ padding: 16 }}>
              Acciones
            </th>

          </tr>

        </thead>

        <tbody>

          {producto.product_variants.map(v => (

            <tr
              key={v.id}
              style={{
                borderBottom:
                  "1px solid #f3f4f6"
              }}
            >

              {/* TALLA */}
              <td
                style={{
                  padding: 16,
                  fontWeight: "700"
                }}
              >
                {v.size}
              </td>

              {/* PRECIO */}
              <td style={{ padding: 16 }}>

                <input
                  type="number"
                  value={v.price || 0}

                  onChange={(e) => {

                    const nuevo =
                      parseInt(e.target.value)
                      || 0;

                    setProducto(prev => ({
                      ...prev,
                      product_variants:
                        prev.product_variants.map(x =>
                          x.id === v.id
                            ? {
                                ...x,
                                price: nuevo
                              }
                            : x
                        )
                    }));

                  }}

                  onBlur={(e) => {

                    actualizarPrecio(
                      v.id,
                      parseInt(e.target.value) || 0
                    );

                  }}

                  style={{
                    width: 120,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontWeight: "700"
                  }}
                />

              </td>

              {/* STOCK */}
              <td style={{ padding: 16 }}>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}
                >

                  <button
                    onClick={() =>
                      actualizarStock(
                        v.id,
                        Math.max((v.stock || 0) - 1, 0)
                      )
                    }
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={v.stock || 0}

                    onChange={(e) => {

                      const nuevo =
                        parseInt(e.target.value)
                        || 0;

                      setProducto(prev => ({
                        ...prev,
                        product_variants:
                          prev.product_variants.map(x =>
                            x.id === v.id
                              ? {
                                  ...x,
                                  stock: nuevo
                                }
                              : x
                          )
                      }));

                    }}

                    onBlur={(e) => {

                      actualizarStock(
                        v.id,
                        parseInt(e.target.value)
                        || 0
                      );

                    }}

                    style={{
                      width: 80,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      textAlign: "center",
                      fontWeight: "700"
                    }}
                  />

                  <button
                    onClick={() =>
                      actualizarStock(
                        v.id,
                        (v.stock || 0) + 1
                      )
                    }
                  >
                    +
                  </button>

                </div>

              </td>

              {/* ESTADO */}
              <td style={{ padding: 16 }}>

                {(v.stock || 0) <= 0 ? (

                  <span
                    style={{
                      color: "#ef4444",
                      fontWeight: "700"
                    }}
                  >
                    ● Agotado
                  </span>

                ) : (v.stock || 0) <= 3 ? (

                  <span
                    style={{
                      color: "#f59e0b",
                      fontWeight: "700"
                    }}
                  >
                    ● Bajo stock
                  </span>

                ) : (

                  <span
                    style={{
                      color: "#22c55e",
                      fontWeight: "700"
                    }}
                  >
                    ● En stock
                  </span>

                )}

              </td>

              {/* ACCIONES */}
              <td style={{ padding: 16 }}>

                <button
                  onClick={() =>
                    eliminarVariante(v.id)
                  }
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 12px",
                    cursor: "pointer"
                  }}
                >
                  Eliminar
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* AGREGAR */}
      <button
        onClick={agregarVariante}
        style={{
          marginTop: 24,
          background: "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "14px 18px",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        ➕ Agregar talla
      </button>

    </div>

  );

}

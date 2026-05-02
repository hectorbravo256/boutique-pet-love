import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Success() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const processOrder = async () => {

      // 🔥 VALIDAR PAGO APROBADO
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");

      if (status !== "approved") return;

      // 🔥 CARGAR ORDEN
      const saved = localStorage.getItem("lastOrder");
      if (saved) {
        setOrder(JSON.parse(saved));
      }

      // 🔥 ACTUALIZAR CUPÓN
      const code = localStorage.getItem("couponUsed");

      if (code) {
        const { data } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", code)
          .maybeSingle();

        if (data) {
          await supabase
            .from("coupons")
            .update({
              used_count: (data.used_count || 0) + 1
            })
            .eq("id", data.id);
        }

        localStorage.removeItem("couponUsed");
      }

      // 🔥 LIMPIAR CARRITO
      localStorage.removeItem("cart");
      localStorage.removeItem("lastOrder");
    };

    processOrder();
  }, []);

  if (!order || !order.cart) {
    return <p style={{ padding: 40 }}>Cargando...</p>;
  }

  const subtotal = order.cart.reduce(
    (acc, i) => acc + i.price * (i.qty || 1),
    0
  );

  const envio = order.total - subtotal;

  const numeroOrden = "ORD-" + new Date(order.date).getTime();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fdf2f8",
      padding: 20,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>

      <div style={{
        width: "100%",
        maxWidth: 500,
        background: "white",
        borderRadius: 16,
        padding: 25,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#ec4899", margin: 0 }}>
            🐾 Boutique Pet Love
          </h2>
          <p style={{ fontSize: 12, color: "#999" }}>
            Confirmación de compra
          </p>
        </div>

        {/* ESTADO */}
        <div style={{
          background: "#ecfdf5",
          color: "#059669",
          padding: 10,
          borderRadius: 10,
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 20
        }}>
          ✅ Pago aprobado
        </div>

        {/* INFO CLIENTE */}
        <div style={{ fontSize: 14, marginBottom: 15 }}>
          <p><strong>N° Orden:</strong> {numeroOrden}</p>
          <p><strong>Fecha:</strong> {new Date(order.date).toLocaleString()}</p>
          <p><strong>Cliente:</strong> {order.formData.nombre}</p>
          <p><strong>Correo:</strong> {order.formData.correo}</p>
        </div>

        <hr />

        {/* PRODUCTOS */}
        <div style={{ marginTop: 15 }}>
          {order.cart.map((item, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {item.name}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                  {item.size} x{item.qty || 1}
                </p>
              </div>

              <span>
                ${(item.price * (item.qty || 1)).toLocaleString("es-CL")}
              </span>
            </div>
          ))}
        </div>

        <hr />

        {/* TOTALES */}
        <div style={{ marginTop: 15, fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString("es-CL")}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Envío</span>
            <span>
              {envio > 0
                ? `$${envio.toLocaleString("es-CL")}`
                : "Por pagar"}
            </span>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: 18,
            marginTop: 10
          }}>
            <span>Total</span>
            <span>${order.total.toLocaleString("es-CL")}</span>
          </div>
        </div>

        {/* BOTÓN */}
        <div style={{ textAlign: "center", marginTop: 25 }}>
          <a
            href="/"
            style={{
              background: "#ec4899",
              color: "white",
              padding: "12px 20px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Volver a la tienda
          </a>
        </div>

      </div>
    </div>
  );
}

import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Success() {

  useEffect(() => {
    const updateCouponUsage = async () => {

      // 🔥 VALIDAR QUE EL PAGO FUE APROBADO
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");

      if (status !== "approved") return;

      // 🔥 OBTENER CUPÓN USADO
      const code = localStorage.getItem("couponUsed");
      if (!code) return;

      // 🔥 BUSCAR CUPÓN
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (!data) return;

      // 🔥 ACTUALIZAR USO
      await supabase
        .from("coupons")
        .update({
          used_count: (data.used_count || 0) + 1
        })
        .eq("id", data.id);

      // 🔥 LIMPIAR CUPÓN
      localStorage.removeItem("couponUsed");
    };

    updateCouponUsage();
  }, []);

  return (
    <div style={{
      padding: 40,
      textAlign: "center"
    }}>
      <h1>✅ Pago exitoso</h1>
      <p>Gracias por tu compra 🐶</p>
    </div>
  );
}

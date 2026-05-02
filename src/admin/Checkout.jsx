import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";


export default function Checkout({
  cart,
  total,
  shipping,
  totalFinal,
  formData,
  setFormData,
  handleMercadoPago,
  aplicaEnvio,

  increaseQty,
  decreaseQty,
  removeItem,
  formatPrice
}) {
	
const [errors, setErrors] = useState({});
const [coupon, setCoupon] = useState("");
const [discount, setDiscount] = useState(0);
const [couponError, setCouponError] = useState("");
const [stockDB, setStockDB] = useState([]);

const mensajeEnvio = formData.region
  ? aplicaEnvio
    ? "Envío $3.500 por PAKET"
    : "Envío por pagar (Starken / Blue Express)"
  : "Selecciona tu región";

	const subtotal = total;
const discountAmount = subtotal * discount;
const totalConDescuento = subtotal - discountAmount + (aplicaEnvio ? shipping : 0);

	const stockMap = Object.fromEntries(
  stockDB.map(s => [`${s.product_id}-${s.size}`, s.stock])
);

const validarFormulario = () => {
  const nuevosErrores = {};

  if (!formData.nombre?.trim()) {
    nuevosErrores.nombre = "Ingresa tu nombre";
  }

  if (!formData.rut?.trim()) {
    nuevosErrores.rut = "Ingresa tu RUT";
  }

  if (!formData.direccion?.trim()) {
    nuevosErrores.direccion = "Ingresa tu dirección";
  }

  if (!formData.comuna?.trim()) {
    nuevosErrores.comuna = "Ingresa tu comuna";
  }

  if (!formData.region) {
    nuevosErrores.region = "Selecciona una región";
  }

  if (!formData.correo?.includes("@")) {
    nuevosErrores.correo = "Correo inválido";
  }

const telefonoRegex = /^\+569\d{8}$/;

if (!telefonoRegex.test(formData.telefono || "")) {
  nuevosErrores.telefono = "Debe ser +56 9 XXXXXXXX";
}
  setErrors(nuevosErrores);
  return Object.keys(nuevosErrores).length === 0;
};

const applyCoupon = async () => {
  const code = coupon.trim().toUpperCase();

  if (!code) {
    setCouponError("Ingresa un código");
    return;
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    setDiscount(0);
    setCouponError("❌ Código inválido");
    return;
  }

  // 🔥 VALIDAR EXPIRACIÓN
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    setDiscount(0);
    setCouponError("⏳ Cupón expirado");
    return;
  }
  if (data.max_uses && data.used_count >= data.max_uses) {
  setDiscount(0);
  setCouponError("⚠️ Cupón agotado");
  return;
}

  setDiscount(data.discount);
  setCouponError("");
  localStorage.setItem("couponUsed", data.code);
};

	useEffect(() => {
  const cargarStock = async () => {
    const { data } = await supabase
      .from("product_stock")
      .select("*");

    setStockDB(data || []);
  };

  cargarStock();
}, []);

	useEffect(() => {
  const updatedCart = cart.map(item => {
    const stock =
      stockMap[`${item.id}-${item.size}`] || 0;

    if (item.qty > stock) {
      return { ...item, qty: stock };
    }

    return item;
  });

  localStorage.setItem("cart", JSON.stringify(updatedCart));
}, [stockDB, cart]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 grid md:grid-cols-2 gap-8">

      {/* 🧾 RESUMEN */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

{cart.map((item, i) => (
  <div key={i} className="checkout-item">

    {/* 🖼 IMAGEN */}
    <img
  	src={item.image || "/placeholder.png"}
  	className="checkout-img"
	/>

    {/* 📦 INFO */}
    <div className="checkout-info">
      <p className="checkout-name">{item.name}</p>
      <p className="checkout-size">{item.size}</p>
 	  <p className="text-xs text-gray-500">
  {(stockMap[`${item.id}-${item.size}`] || 0) === 0
  ? "❌ Sin stock"
  : `Stock disponible: ${stockMap[`${item.id}-${item.size}`]}`}
</p>

      {/* 🔢 CANTIDAD */}
      <div className="checkout-qty">
        <button onClick={() => decreaseQty(i)}>−</button>
        <span>{item.qty || 1}</span>
        <button
  onClick={() => {
    const stock = stockMap[`${item.id}-${item.size}`] || 0;

    if ((item.qty || 1) >= stock) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: "⚠️ No puedes agregar más del stock disponible"
        })
      );
      return;
    }

    increaseQty(i);
  }}
  disabled={
    (stockMap[`${item.id}-${item.size}`] || 0) === 0 ||
    (item.qty || 1) >= (stockMap[`${item.id}-${item.size}`] || 0)
  }
>
  +
</button>
      </div>
    </div>

    {/* 💰 PRECIO + ELIMINAR */}
    <div className="checkout-actions">
      <p className="checkout-price">
        {formatPrice(item.price * (item.qty || 1))}
      </p>

      <button
        onClick={() => removeItem(i)}
        className="checkout-remove"
      >
        Eliminar
      </button>
    </div>

  </div>
))}

<div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-2">

  <div className="flex justify-between text-sm">
    <span>Subtotal</span>
    <span>{formatPrice(total)}</span>
  </div>

  <div className="flex justify-between text-sm">
    <span>Envío</span>
    <span className={aplicaEnvio ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>
      {aplicaEnvio
        ? formatPrice(shipping)
        : "Por pagar"}
    </span>
  </div>

  {/* 👇 MENSAJE CLAVE */}
 <p className={`text-xs font-medium ${aplicaEnvio ? "text-green-600" : "text-orange-500"}`}>
  {mensajeEnvio}
</p>

	{/* 🎟 CUPÓN */}
<div className="mt-3">
  <p className="text-sm font-semibold">Código de descuento</p>

  <div className="flex gap-2 mt-1">
    <input
      value={coupon}
      onChange={(e) => setCoupon(e.target.value)}
      placeholder="Ingresa tu código"
      className="flex-1 border rounded px-2 py-1 text-sm"
    />

    <button
      onClick={applyCoupon}
      className="bg-pink-500 text-white px-3 rounded text-sm"
    >
      Aplicar
    </button>
  </div>

  {couponError && (
    <p className="text-red-500 text-xs mt-1">{couponError}</p>
  )}

  {discount > 0 && (
    <p className="text-green-600 text-xs mt-1">
      ✅ Descuento aplicado ({discount * 100}%)
    </p>
  )}
</div>

	{discount > 0 && (
  <div className="flex justify-between text-green-600 text-sm">
    <span>Descuento</span>
    <span>-{formatPrice(discountAmount)}</span>
  </div>
)}
	
  <div className="border-t pt-2 flex justify-between font-bold text-lg">
    <span>Total</span>
    <span>{formatPrice(totalConDescuento)}</span>
  </div>

</div>
        
      </div>

      {/* 📋 FORMULARIO */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Datos de envío</h2>

        <div className="space-y-3">

          <input
  		placeholder="Nombre y Apellidos"
  		value={formData.nombre || ""}
  		onChange={(e) =>
    		setFormData({ ...formData, nombre: e.target.value })
  		}
  		className={`w-full p-2 rounded border ${errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"}`}
		/>

		{errors.nombre && (
  		<p className="text-red-500 text-xs">{errors.nombre}</p>
		)}

          <input
  		placeholder="RUT"
  		value={formData.rut || ""}
  		onChange={(e) =>
    		setFormData({ ...formData, rut: e.target.value })
  		}
  		className={`w-full p-2 rounded border ${errors.rut ? "border-red-500 bg-red-50" : "border-gray-300"}`}
		/>

		{errors.rut && (
  		<p className="text-red-500 text-xs">{errors.rut}</p>
		)}

          <input
            	placeholder="Dirección exacta (calle, número, casa/depto)"
  		value={formData.direccion || ""}
  		onChange={(e) =>
    		setFormData({ ...formData, direccion: e.target.value })
  		}
  		className={`w-full p-2 rounded border ${errors.direccion ? "border-red-500 bg-red-50" : "border-gray-300"}`}
		/>

		{errors.direccion && (
  		<p className="text-red-500 text-xs">{errors.direccion}</p>
		)}


          <input
		placeholder="Comuna"
  		value={formData.comuna || ""}
  		onChange={(e) =>
    		setFormData({ ...formData, comuna: e.target.value })
  		}
  		className={`w-full p-2 rounded border ${errors.comuna ? "border-red-500 bg-red-50" : "border-gray-300"}`}
		/>

		{errors.comuna && (
  		<p className="text-red-500 text-xs">{errors.comuna}</p>
		)}


          <select
           	value={formData.region || ""}
  		onChange={(e) =>
    		setFormData({ ...formData, region: e.target.value })
  		}
  		className={`w-full p-2 rounded border ${errors.region ? "border-red-500 bg-red-50" : "border-gray-300"}`}
		>
            <option value="">Selecciona Región</option>
            	<option>Región de Arica y Parinacota</option>
  	    	<option>Región de Tarapacá</option>
  		<option>Región de Antofagasta</option>
  		<option>Región de Atacama</option>
  		<option>Región de Coquimbo</option>
  		<option>Región de Valparaíso</option>
  		<option>Región Metropolitana de Santiago</option>
  		<option>Región del Libertador General Bernardo O'Higgins</option>
  		<option>Región del Maule</option>
  		<option>Región de Ñuble</option>
  		<option>Región del Biobío</option>
  		<option>Región de La Araucanía</option>
  		<option>Región de Los Ríos</option>
  		<option>Región de Los Lagos</option>
  		<option>Región de Aysén del General Carlos Ibáñez del Campo</option>
		{errors.region && (
  		<p className="text-red-500 text-xs">{errors.region}</p>
		)}
          </select>

	   <input
  		placeholder="Correo electrónico"
  		value={formData.correo || ""}
  		onChange={(e) =>
    		setFormData({ ...formData, correo: e.target.value })
  		}
  		className={`w-full p-2 rounded border ${
    		errors.correo ? "border-red-500 bg-red-50" : "border-gray-300"
  		}`}
		/>

		{errors.correo && (
  		<p className="text-red-500 text-xs">{errors.correo}</p>
		)}

	<input
  placeholder="+56 9 1234 5678"
  value={formData.telefono || ""}
  onChange={(e) => {
    let value = e.target.value;

    // Quitar todo lo que no sea número o +
    value = value.replace(/[^\d+]/g, "");

    // Si no empieza con +56 → lo agregamos
    if (!value.startsWith("+56")) {
      value = "+56" + value.replace("+", "").replace(/^56/, "");
    }

    setFormData({
      ...formData,
      telefono: value
    });
  }}
  className={`w-full p-2 rounded border ${
    errors.telefono ? "border-red-500 bg-red-50" : "border-gray-300"
  }`}
/>

{errors.telefono && (
  <p className="text-red-500 text-xs">{errors.telefono}</p>
)}

          <textarea
            placeholder="Observación"
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, observacion: e.target.value})}
          />

        </div>

<p className="text-sm text-green-600 font-semibold mt-2">
  🔒 Pago 100% seguro con MercadoPago
</p>

        <button
          onClick={() => {
  	if (validarFormulario()) {
    	handleMercadoPago();
  	}
	}}
          className="btn-pagar"
        >
          💳 Pagar con MercadoPago
        </button>
      </div>
    </div>
  );
}

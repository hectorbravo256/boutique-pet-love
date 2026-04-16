import { useState } from "react";

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


const mensajeEnvio = formData.region
  ? aplicaEnvio
    ? "Envío $3.500 por PAKET"
    : "Envío por pagar (Starken / Blue Express)"
  : "Selecciona tu región";


  return (
    <div className="min-h-screen bg-gray-50 p-6 grid md:grid-cols-2 gap-8">

      {/* 🧾 RESUMEN */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

{cart.map((item, i) => (
  <div key={i} className="checkout-item">

    {/* 🖼 IMAGEN */}
    <img
      src={item.images?.[0]}
      className="checkout-img"
    />

    {/* 📦 INFO */}
    <div className="checkout-info">
      <p className="checkout-name">{item.name}</p>
      <p className="checkout-size">{item.size}</p>

      {/* 🔢 CANTIDAD */}
      <div className="checkout-qty">
        <button onClick={() => decreaseQty(i)}>−</button>
        <span>{item.qty || 1}</span>
        <button onClick={() => increaseQty(i)}>+</button>
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

  <div className="border-t pt-2 flex justify-between font-bold text-lg">
    <span>Total</span>
    <span>{formatPrice(totalFinal)}</span>
  </div>

</div>
        
      </div>

      {/* 📋 FORMULARIO */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Datos de envío</h2>

        <div className="space-y-3">

          <input
            placeholder="Nombre y Apellidos"
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />

          <input
            placeholder="RUT"
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, rut: e.target.value})}
          />

          <input
            placeholder="Dirección"
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
          />

          <input
            placeholder="Comuna"
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, comuna: e.target.value})}
          />

          <select
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setFormData({ ...formData, region: e.target.value })
            }
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
          </select>

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
          onClick={handleMercadoPago}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
        >
          💳 Pagar con MercadoPago
        </button>
      </div>
    </div>
  );
}
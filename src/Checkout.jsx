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

const [errors, setErrors] = useState({});

const mensajeEnvio = formData.region
  ? aplicaEnvio
    ? "Envío $3.500 por PAKET"
    : "Envío por pagar (Starken / Blue Express)"
  : "Selecciona tu región";

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

const formatTelefono = (value) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 3) return "+" + digits;

  return `+${digits.slice(0,2)} ${digits.slice(2,3)} ${digits.slice(3,7)} ${digits.slice(7,11)}`;
};

  setErrors(nuevosErrores);
  return Object.keys(nuevosErrores).length === 0;
};

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
            	placeholder="Dirección"
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
    		let value = e.target.value.replace(/\D/g, "");

    		// Forzar formato chileno
    		if (!value.startsWith("56")) {
      		value = "56" + value;
    		}

    		// Limitar largo (56 + 9 + 8 dígitos = 11)
    		value = value.slice(0, 11);

    		setFormData({
      		...formData,
      		telefono: formatTelefono(value)
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
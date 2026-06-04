import { useEffect, useState } from "react";
import Checkout from "./Checkout";

function CheckoutWrapper() {

  const [cart, setCart] = useState(() => {
  const stored = localStorage.getItem("cart");
  return stored ? JSON.parse(stored) : [];
});

  const [formData, setFormData] = useState({
  nombre: "",
  rut: "",
  direccion: "",
  comuna: "",
  region: "",
  correo: "",
  telefono: "",
  observacion: "",
});

// 🔥 CALCULAR TOTALES (MOVER AQUÍ)
const total = cart.reduce(
  (acc, i) => acc + i.price * (i.qty || 1),
  0
);

const regionesConEnvio = [
  "Región Metropolitana de Santiago",
  "Región de Valparaíso",
  "Región del Libertador General Bernardo O'Higgins",
];

const aplicaEnvio =
  cart.length > 0 && regionesConEnvio.includes(formData.region);

const shipping = aplicaEnvio ? 3500 : 0;

const totalFinal = total + shipping;

const handleMercadoPago = async () => {

  /* ✅ VALIDACIÓN FORMULARIO */

  if (!formData.nombre.trim()) {
    alert("Ingresa tu nombre");
    return;
  }

  if (!formData.rut.trim()) {
    alert("Ingresa tu RUT");
    return;
  }

  if (!formData.direccion.trim()) {
    alert("Ingresa tu dirección");
    return;
  }

  if (!formData.comuna.trim()) {
    alert("Ingresa tu comuna");
    return;
  }

  if (!formData.region) {
    alert("Selecciona una región");
    return;
  }

if (!formData.correo.includes("@")) {
  alert("Correo inválido");
  return;
}

if (!formData.telefono || formData.telefono.length < 8) {
  alert("Teléfono inválido");
  return;
}

/* 🛒 VALIDACIÓN CARRITO */

  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

 /* 💳 PAGO */

  try {
    const res = await fetch("/.netlify/functions/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart,
        formData,
      }),
    });

    const data = await res.json();

// 🔥 GUARDAR PEDIDO (CLAVE)
localStorage.setItem(
  "lastOrder",
  JSON.stringify({
    cart,
    formData,
    total: totalFinal,
    date: new Date().toISOString(),
  })
);

    window.location.href = data.init_point;
  } catch (error) {
    alert("Error al iniciar pago");
  }
};

const increaseQty = (index) => {

  const updated = [...cart];

  const stock =
    updated[index].stock || 0;

  const currentQty =
    updated[index].qty || 1;

  if (currentQty >= stock) {
    alert(
      `Solo quedan ${stock} unidades disponibles`
    );
    return;
  }

  updated[index].qty =
    currentQty + 1;

  setCart(updated);

  localStorage.setItem(
    "cart",
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new Event("storage")
  );

};

const decreaseQty = (index) => {
  const updated = [...cart];

  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const removeItem = (index) => {
  const updated = cart.filter((_, i) => i !== index);

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));

  // 🔥 sincroniza con layout / carrito flotante
  window.dispatchEvent(new Event("storage"));
};

const formatPrice = (p) =>
  p ? "$" + p.toLocaleString("es-CL") : "";


	useEffect(() => {
  const updateCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  window.addEventListener("storage", updateCart);

  return () => window.removeEventListener("storage", updateCart);
}, []);


return (
  <Checkout
  cart={cart}
  total={total}
  shipping={shipping}
  totalFinal={totalFinal}
  formData={formData}
  setFormData={setFormData}
  handleMercadoPago={handleMercadoPago}
  aplicaEnvio={aplicaEnvio}

  /* 🔥 NUEVO */
  increaseQty={increaseQty}
  decreaseQty={decreaseQty}
  removeItem={removeItem}
  formatPrice={formatPrice}
/>
  );

}

export default CheckoutWrapper;

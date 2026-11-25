import { readCart } from "./cartStock.mjs";
import { useEffect, useState } from "react";
import Checkout from "./Checkout";

function CheckoutWrapper() {

  const [cart, setCart] = useState(readCart);

  const [formData, setFormData] = useState({
  nombre: "",
  rut: "",
  direccion: "",
  comuna: "",
  region: "",
  empresa_envio: "",
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
  alert("ENTORNO TEST: pagos deshabilitados");
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
    const stored = readCart();
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

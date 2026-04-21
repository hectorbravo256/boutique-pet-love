

import { ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Checkout from "./Checkout";
import './index.css';
import Admin from "./Admin";
import { supabase } from "./lib/supabase";
import Login from "./Login";

const WHATSAPP = "https://wa.me/56982700002";

/* ================= PRODUCTOS ================= */

const products = [
  {
    id: 1,
    name: "Abrigo Escocés Rojo",
    images: [
"/products/abrigo-escoces-rojo.jpg",
"/products/tallaje.jpg"
],
    category: "Ropa",
    badge: "Otoño / Invierno",
    description: "Abrigo cálido ideal para invierno.",
    sizes: {
      "Talla 0": 10,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990,
    },
  },
  {
    id: 2,
    name: "Corderito de Stitch",
    images: [
"/products/corderito-stitch.jpg",
"/products/tallaje.jpg"
],
    category: "Ropa",
    badge: "Otoño / Invierno",
    description: "Abrigo tipo corderito suave y abrigador.",
    sizes: {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990,
    },
  },
{
    id: 3,
    name: "Corderito de Angela",
    images: [
"/products/corderito-Angela.jpg",
"/products/tallaje.jpg"
],
    category: "Ropa",
    badge: "Otoño / Invierno",
    description: "Abrigo tipo corderito suave y abrigador.",
    sizes: {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990,
    },
  },
{
    id: 4,
    name: "Traje Mickey Mouse",
    images: [
"/products/traje-Mickey-Mouse.jpg",
"/products/tallaje.jpg"
],
    category: "Ropa",
    badge: "Otoño / Invierno",
    description: "Abrigo tipo corderito suave y abrigador.",
    sizes: {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990,
    },
  },
{
    id: 5,
    name: "Traje Minnie Mouse",
    images: [
 "/products/traje-Minnie-Mouse.jpg",
 "/products/tallaje.jpg"
],
    category: "Ropa",
    badge: "Otoño / Invierno",
    description: "Abrigo tipo corderito suave y abrigador.",
    sizes: {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990,
    },
  },
{
    id: 6,
    name: "Traje Hello Kitty",
    images: [
  "/products/traje-Hello-Kitty1.jpg",
  "/products/traje-Hello-Kitty2.jpg",
  "/products/traje-Hello-Kitty3.jpg",
  "/products/tallaje.jpg"
],
    category: "Ropa",
    badge: "Otoño / Invierno",
    description: "Abrigo tipo corderito suave y abrigador.",
    sizes: {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990,
    },
  },

 {
    "id": 7,
    "name": "Osita con Tutu",
    "images":[ 
"/products/Osita-con-Tutu.jpg",
  "/products/tallaje.jpg"
],
    "category": "Ropa",
    "badge": "Otoño / Invierno",
    "description": "Producto de alta calidad para mascotas",
    "sizes": {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990
    },
  },
  {
    "id": 8,
    "name": "Cuerina Forrada con Corderito",
    "images": [ 
"/products/Cuerina-Forrada.jpg",
  "/products/tallaje.jpg"
],
    "category": "Ropa",
    "badge": "Otoño / Invierno",
    "description": "Producto de alta calidad para mascotas",
    "sizes": {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990
    },
  },
  {
    "id": 9,
    "name": "Polar Corderito Azul",
    "images": [
"/products/Polar-Corderito-Azul.jpg",
  "/products/tallaje.jpg"
],
    "category": "Ropa",
    "badge": "Otoño / Invierno",
    "description": "Producto de alta calidad para mascotas",
    "sizes": {
      "Talla 0": 8000,
      "Talla 1": 8500,
      "Talla 2": 9000,
      "Talla 3": 10000,
      "Talla 4": 11000,
      "Talla 5": 12000,
      "Talla 6": 13000,
      "Talla 7": 14000,
      "Talla 8": 15000,
      "Talla 9": 16000,
      "Talla 10": 16990,
      "Talla 11": 17990,
      "Talla 12": 18990
    },
  },
];

/* ================= APP PRINCIPAL ================= */

function AppContent() {
  const navigate = useNavigate();

const increaseQty = (index) => {
  const updated = [...cart];
  updated[index].qty = (updated[index].qty || 1) + 1;
  setCart(updated);
};

const decreaseQty = (index) => {
  const updated = [...cart];
  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }
  setCart(updated);
};


  const [selectedSizes, setSelectedSizes] = useState({});
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(true);
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
  const [currentIndex, setCurrentIndex] = useState({});
  const touchStartRef = useRef({});
  const [zoomGallery, setZoomGallery] = useState(null);
  const zoomTouchStart = useRef(0);
  const handleTouchStart = (e, productId) => {
   touchStartRef.current[productId] = e.touches[0].clientX;
};
  const handleTouchEnd = (e, product) => {
  const start = touchStartRef.current[product.id];
  if (!start) return;
  const end = e.changedTouches[0].clientX;
  const diff = start - end;
  if (Math.abs(diff) > 50 && product.images) {
    setCurrentIndex((prev) => {
  const current = prev[product.id] || 0;
  const next =
        diff > 0
          ? (current + 1) % product.images.length
          : (current - 1 + product.images.length) % product.images.length;

   return { ...prev, [product.id]: next };
      });
    }

  delete touchStartRef.current[product.id];
};
 
/* ===== CARRITO LOCAL ===== */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  	}, [cart]);

  useEffect(() => {
  	document.body.style.overflow = zoomGallery ? "hidden" : "auto";
	}, [zoomGallery]);

	const AUTO_SLIDE = false; // 🔥 cambiar a true cuando quieras activarlo

  useEffect(() => {
  if (!AUTO_SLIDE) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => {
      const updated = { ...prev };

      products.forEach((product) => {
        if (product.images) {
          const current = prev[product.id] || 0;
          updated[product.id] =
            current === product.images.length - 1 ? 0 : current + 1;
        }
      });

      return updated;
    });
  }, 3000);

  return () => clearInterval(interval);
}, []);


 /* ===== FUNCIONES ===== */
  const formatPrice = (p) =>
    p ? "$" + p.toLocaleString("es-CL") : "";

  const addToCart = (product, size, price) => {

    if (!size) return alert("Selecciona talla");
    setCart([...cart, { ...product, size, price }]);
  };

  const removeItem = (i) =>
    setCart(cart.filter((_, idx) => idx !== i));

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

  const mensajeEnvio = formData.region
  	? regionesConEnvio.includes(formData.region)
    	? "Envío $3.500 por PAKET"
    	: "Envío por pagar (Starken / Blue Express)"
  	: "Selecciona tu región para calcular envío";

  const shipping = aplicaEnvio ? 3500 : 0;

  const totalFinal = total + shipping;

  const handleMercadoPago = async () => {
  	// ✅ VALIDACIÓN FORMULARIO

if (!formData.nombre) {
  alert("Ingresa tu nombre");
  return;
}

if (!formData.rut) {
  alert("Ingresa tu RUT");
  return;
}

if (!formData.direccion) {
  alert("Ingresa tu Dirección");
  return;
}

if (!formData.comuna) {
  alert("Ingresa tu Comuna");
  return;
}

if (!formData.region) {
  alert("Selecciona una región");
  return;
}

  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

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

/* ================= UI ================= */
  return (
         <div className="bg-pink-50 min-h-screen">
    
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center text-sm py-1">
        🚚 Envíos a todo Chile | RM, V y VI: $3.500 | Otras regiones: por pagar • Moda y accesorios para mascotas
      </div>

      {/* HEADER */}
      <header className="bg-white shadow-md flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-pink-600 text-2xl md:text-3xl font-extrabold tracking-wide">
  		BOUTIQUE PET LOVE
		</h1>

            <p className="text-purple-400 text-sm md:text-base font-semibold">
  		Moda y accesorios para mascotas
		</p>
          </div>
        </div>

       <div className="hidden md:flex gap-8 text-lg md:text-xl font-bold text-gray-700">
 	<a href="#" className="hover:text-pink-600 transition duration-200">
  	Inicio
	</a>
	<a href="#catalogo" className="hover:text-pink-600 transition duration-200">
  	Tienda
	</a>
	<a href="#contacto" className="hover:text-pink-600 transition duration-200">
  	Contacto
	</a>
	</div>

        <div className="flex items-center gap-3">
          <input
            placeholder="Buscar"
            className="border rounded-full px-3 py-1 text-sm"
          />

          <div
  		onClick={() => setCartOpen(!cartOpen)}
  		className="relative bg-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer"
		>
            <ShoppingBag size={16} />
            Carrito
            <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 rounded-full">
              {cart.length}
            </span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="p-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-sm flex items-center gap-2 w-fit">
 	   🐾 Boutique Pet Love
	   </span>

          <h2 className="text-6xl md:text-7xl font-extrabold mt-4 leading-tight text-gray-900">
 	 Viste a tu mascota con{" "}
  	<span className="text-pink-600">amor</span> y estilo
	</h2>

          <p className="mt-4 text-gray-500 text-lg">
            Tienda online profesional para ropa y accesorios de mascotas.
          </p>

          <div className="flex gap-3 mt-6">
            <a
              href="#catalogo"
              className="bg-pink-600 text-white px-6 py-3 rounded-xl"
            >
              Comprar ahora
            </a>

           <a
 	 href="https://instagram.com/boutique_petlove"
 	 target="_blank"
  	 className="bg-white text-purple-600 border border-purple-200 px-6 py-3 rounded-xl font-semibold hover:shadow-md transition"
	>
 	 Ver Instagram
	</a>
          </div>
        </div>

        <img
          src="/logo.png"
          className="w-96 mx-auto rounded-2xl shadow-xl"
        />
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Tienda online</h2>
            <p className="text-gray-500 text-sm">
              Versión estable para Netlify.
            </p>
          </div>

          <a
            href={WHATSAPP}
            target="_blank"
            className="bg-purple-600 text-white px-5 py-2 rounded-xl"
          >
            Pedir catálogo completo
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const size = selectedSizes[product.id];
            const price = size ? product.sizes[size] : null;





            return (
              <div
  key={product.id}
  className="bg-white p-4 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
>

<div
  className="relative overflow-hidden rounded-xl touch-pan-y select-none"
  onTouchStart={(e) => handleTouchStart(e, product.id)}
  onTouchEnd={(e) => handleTouchEnd(e, product)}
>


{product.images ? (
  <>
    <img
      src={product.images[currentIndex[product.id] || 0]}
      onClick={() =>
  setZoomGallery({
    images: product.images || [product.image],
    index: currentIndex[product.id] || 0,
  })
}
      className="w-full h-[280px] object-cover rounded-xl bg-gray-100 transition-all duration-300 cursor-zoom-in"
    />

{/* Flecha izquierda */}
<button
  onClick={() =>
    setCurrentIndex((prev) => ({
      ...prev,
      [product.id]:
        (prev[product.id] || 0) === 0
          ? product.images.length - 1
          : (prev[product.id] || 0) - 1,
    }))
  }
  className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded-full"
>
  ◀
</button>

{/* Flecha derecha */}
<button
  onClick={() =>
    setCurrentIndex((prev) => ({
      ...prev,
      [product.id]:
        (prev[product.id] || 0) === product.images.length - 1
          ? 0
          : (prev[product.id] || 0) + 1,
    }))
  }
  className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded-full"
>
  ▶
</button>

    {/* ✅ PUNTITOS (AQUÍ ADENTRO) */}
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
      {product.images.map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            (currentIndex[product.id] || 0) === index
              ? "bg-pink-600"
              : "bg-white/70"
          }`}
        />
      ))}
    </div>

  </>
) : (
  <img
  src={product.image}
  onClick={() =>
  setZoomGallery({
    images: [product.image],
    index: 0,
  })
}
  className="w-full h-[280px] object-cover rounded-xl bg-gray-100 cursor-zoom-in"
/>
  )}

  {/* BADGE */}
  <span className="absolute top-2 left-2 bg-white text-pink-600 text-xs px-2 py-1 rounded-full shadow">
    {product.badge}
  </span>
<span className="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full shadow">
  🔥 Más vendido
</span>

</div>



                <p className="text-xs text-purple-500 mt-2 uppercase">
                  {product.category}
                </p>

                <h3 className="font-bold">{product.name}</h3>

                <p className="text-sm text-gray-500">
                  {product.description}
                </p>

                <p className="text-pink-600 font-bold mt-2">
                  {price ? formatPrice(price) : "Selecciona talla"}
                </p>

                <select
                  className="w-full mt-3 border p-2 rounded-xl"
                  value={size || ""}
                  onChange={(e) =>
                    setSelectedSizes({
                      ...selectedSizes,
                      [product.id]: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar talla</option>
                  {Object.keys(product.sizes).map((s) => (
                    <option key={s} value={s}>
                      {s} - {formatPrice(product.sizes[s])}
                    </option>
                  ))}
                </select>

                <div className="bloque-botones">

		 {/* BOTÓN AGREGAR */}
               <button
    		onClick={() => addToCart(product, size, price)}
    		className="btn btn-carrito"
  		>
    		<span className="icono">
      		<ShoppingCart size={18} strokeWidth={2} />
    		</span>
                <span>Agregar Carro</span>
                  </button>
		 {/* BOTÓN WHATSAPP */}
                  <a
                    href={`${WHATSAPP}?text=${encodeURIComponent(
  "🛒 Pedido:\n\n" +
  cart.map(i =>
    `${i.name} (${i.size}) x${i.qty || 1} - ${formatPrice(i.price)}`
  ).join("\n") +
  `\n\nTotal: ${formatPrice(totalFinal)}`
)}`}
		  target="_blank"
                    className="btn btn-whatsapp"
                  >
		<span className="icono">
      		<MessageCircle size={18} />
		</span>
    		<span>Consultar por WhatsApp</span>
                  </a>
                </div>
                  

              </div>
            );
     })}
</div>
</section>

      {/* CARRITO */}
      <div
  	className={`fixed bottom-5 right-5 bg-white rounded-2xl shadow transition-all duration-300 ${
    	cartOpen ? "w-64 p-4" : "w-16 h-16 flex items-center justify-center"
  	}`}
	>
	{cartOpen ? (
    <>
      {/* BOTÓN CERRAR */}
<button
  onClick={() => setCartOpen(false)}
  className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:scale-105 hover:shadow-lg transition"
>
  −
</button>

        <h3 className="font-bold">Carrito</h3>

        {cart.length === 0 && <p>Vacío</p>}

        {cart.map((item, i) => (
  <div key={i} className="flex justify-between items-center text-sm mt-3 gap-2">

    <img
      src={item.images?.[0]}
      className="w-12 h-12 object-cover rounded-lg"
    />

    <div className="flex-1">
      <p className="font-semibold text-xs">{item.name}</p>
      <p className="text-xs text-gray-500">{item.size}</p>

      {/* 🔥 CONTROL DE CANTIDAD */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => decreaseQty(i)}
          className="bg-gray-200 px-2 rounded"
        >
          −
        </button>

        <span>{item.qty || 1}</span>

        <button
          onClick={() => increaseQty(i)}
          className="bg-gray-200 px-2 rounded"
        >
          +
        </button>
      </div>
    </div>

    <div className="text-right">
      <p className="text-xs font-bold">
        {formatPrice(item.price * (item.qty || 1))}
      </p>

      <button
        onClick={() => removeItem(i)}
        className="text-red-400 text-xs"
      >
        Eliminar
      </button>
    </div>

  </div>
))}

{cart.length > 0 && (
  <>
 	{/* TOTALES BONITOS */}
   <div className="mt-3 border-t pt-2 text-sm space-y-1">
  <div className="flex justify-between font-bold text-base">
    <span>Total:</span>
    <span>{formatPrice(total)}</span>
  </div>
</div>




    {/* 💳 BOTÓN MERCADOPAGO */}
    <button
  onClick={() => navigate("/checkout")}
  className="block mt-3 bg-blue-500 text-white text-center py-2 rounded-xl w-full"
>
  Continuar compra
</button>

    {/* 🟢 WHATSAPP */}
   <a
  href={`${WHATSAPP}?text=${encodeURIComponent(
    "Pedido:\n" +
      cart
        .map(
          (i) =>
            `${i.name} - ${i.size} - ${formatPrice(i.price)}`
        )
        .join("\n") +
      `\nTotal: ${formatPrice(total)}`
  )}`}
  target="_blank"
  className="bg-green-500 text-white py-2 rounded-xl flex justify-center items-center font-semibold"
>
  Contactar por WhatsApp
</a>
  </>
)}
</>
 ) : (
  <div
    onClick={() => setCartOpen(true)}
    className="relative cursor-pointer bg-pink-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg"
  >
    <ShoppingCart size={24} />

    {/* 🔢 CONTADOR */}
    {cart.length > 0 && (
     <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-bounce">
        {cart.length}
      </span>
    )}
  </div>
)}
      </div>

      {/* WHATSAPP */}
      <a
        href={WHATSAPP}
        className="fixed bottom-5 left-5 bg-green-500 text-white p-4 rounded-full"
        target="_blank"
      >
        <MessageCircle />
      </a>

      {/* FOOTER */}
      <footer id="contacto" className="bg-white mt-10 border-t p-8">
        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <img src="/logo.png" className="w-16 rounded-full mb-2" />
            <h3 className="text-pink-600 font-bold">
              BOUTIQUE PET LOVE
            </h3>
            <p className="text-sm text-gray-500">
              Moda y accesorios para mascotas con estilo y personalidad.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Contacto</h4>
            <p className="text-sm">WhatsApp: +56 9 8270 0002</p>
            <p className="text-sm">Instagram: @boutique_petlove</p>
            <p className="text-sm">Atención personalizada</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Información</h4>
            <p className="text-sm">Envíos</p>
            <p className="text-sm">Métodos de pago</p>
            <p className="text-sm">Preguntas frecuentes</p>
          </div>

        </div>

        <div className="text-center text-sm text-gray-400 mt-6">
          © 2026 BOUTIQUE PET LOVE • Sitio listo para publicar en Netlify.
        </div>
      </footer>

{/* 🔍 ZOOM IMAGEN */}
{zoomGallery && (
  <div
  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"

  onTouchStart={(e) => {
    zoomTouchStart.current = e.touches[0].clientX;
  }}

  onTouchEnd={(e) => {
    const end = e.changedTouches[0].clientX;
    const diff = zoomTouchStart.current - end;

    if (Math.abs(diff) > 50) {
      setZoomGallery((prev) => ({
        ...prev,
        index:
          diff > 0
            ? (prev.index + 1) % prev.images.length
            : (prev.index - 1 + prev.images.length) % prev.images.length,
      }));
    }
  }}
>

 {/* FONDO CLIC PARA CERRAR */}
<div
  className="absolute inset-0 z-40"
  onClick={() => setZoomGallery(null)}
/>

<button
  onClick={() => setZoomGallery(null)}
  className="absolute top-5 right-5 text-white text-3xl z-50"
>
  ✕
</button>

<img
  src={zoomGallery.images[zoomGallery.index]}
  className="max-w-[90%] max-h-[90%] rounded-xl z-50 transition-all duration-300"
  onClick={(e) => e.stopPropagation()}
/>

<button
  onClick={() =>
    setZoomGallery((prev) => ({
      ...prev,
      index:
        prev.index === 0
          ? prev.images.length - 1
          : prev.index - 1,
    }))
  }
  className="absolute left-5 text-white text-3xl z-50 bg-black/40 px-3 py-1 rounded-full"
>
  ◀
</button>

<button
  onClick={() =>
    setZoomGallery((prev) => ({
      ...prev,
      index:
        prev.index === prev.images.length - 1
          ? 0
          : prev.index + 1,
    }))
  }
  className="absolute right-5 text-white text-3xl z-50 bg-black/40 px-3 py-1 rounded-full"
>
  ▶
</button>

  </div>
)}


      </div>
  );
}


/* ================= CHECKOUT WRAPPER ================= */
function CheckoutWrapper() {
  const [cart, setCart] = useState([]);

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
  updated[index].qty = (updated[index].qty || 1) + 1;
  setCart(updated);
};

const decreaseQty = (index) => {
  const updated = [...cart];
  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }
  setCart(updated);
};

const removeItem = (index) => {
  setCart(cart.filter((_, i) => i !== index));
};

const formatPrice = (p) =>
  p ? "$" + p.toLocaleString("es-CL") : "";



  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
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

function Success() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastOrder");
    if (saved) {
      setOrder(JSON.parse(saved));
    }

    localStorage.removeItem("cart");
    localStorage.removeItem("lastOrder");
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

        {/* 🐾 HEADER */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#ec4899", margin: 0 }}>
            🐾 Boutique Pet Love
          </h2>
          <p style={{ fontSize: 12, color: "#999" }}>
            Confirmación de compra
          </p>
        </div>

        {/* ✅ ESTADO */}
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

        {/* 📄 INFO */}
        <div style={{ fontSize: 14, marginBottom: 15 }}>
          <p><strong>N° Orden:</strong> {numeroOrden}</p>
          <p><strong>Fecha:</strong> {new Date(order.date).toLocaleString()}</p>
          <p><strong>Cliente:</strong> {order.formData.nombre}</p>
          <p><strong>Correo:</strong> {order.formData.correo}</p>
        </div>

        <hr />

        {/* 🛒 PRODUCTOS */}
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

        {/* 💰 TOTALES */}
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

        {/* 🏠 BOTÓN */}
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

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  if (session === null) return <p>Cargando...</p>;

  return session ? children : <Login />;
}

/* ================= ROUTER ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/checkout" element={<CheckoutWrapper />} />
	<Route path="/success" element={<Success />} />
	<Route path="/admin" element={<Admin />} />
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  }
/>
<Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
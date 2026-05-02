import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const WHATSAPP = "https://wa.me/56982700002";

export default function Layout() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState([]);
	
const formatPrice = (price) =>
  `$${price.toLocaleString("es-CL")}`;

const total = cart.reduce(
  (acc, item) => acc + item.price * (item.qty || 1),
  0
);

const saveCart = (newCart) => {
  setCart(newCart);
  localStorage.setItem("cart", JSON.stringify(newCart));
  window.dispatchEvent(new Event("storage"));
};

const increaseQty = (i) => {
  const newCart = [...cart];
  newCart[i].qty = (newCart[i].qty || 1) + 1;
  saveCart(newCart);
};

const decreaseQty = (i) => {
  const newCart = [...cart];
  if ((newCart[i].qty || 1) > 1) {
    newCart[i].qty -= 1;
    saveCart(newCart);
  }
};

const removeItem = (i) => {
  const newCart = cart.filter((_, index) => index !== i);
  saveCart(newCart);
};

	useEffect(() => {
  const updateCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    const total = storedCart.reduce(
      (acc, item) => acc + (item.qty || 1),
      0
    );
    setCartCount(total);
  };

  updateCart();

  window.addEventListener("storage", updateCart);

  return () => window.removeEventListener("storage", updateCart);
}, []);

	useEffect(() => {
  const openCart = () => {
    setCartOpen(true);
  };

  window.addEventListener("openCart", openCart);

  return () => window.removeEventListener("openCart", openCart);
}, []);

useEffect(() => {
  document.body.style.overflow =
    menuOpen || cartOpen ? "hidden" : "auto";
}, [menuOpen, cartOpen]);

  useEffect(() => {
  if (location.state?.scrollTo) {
    const el = document.getElementById(location.state.scrollTo);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}, [location]);

useEffect(() => {
  if (location.pathname === "/checkout") {
    setCartOpen(false);
  }
}, [location.pathname]);

  return (
    <div className="bg-pink-50 min-h-screen">

        <div
  className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${
    menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
>

    {/* FONDO OSCURO */}
    <div
      className="bg-black/50 backdrop-blur-sm w-full"
      onClick={() => setMenuOpen(false)}
    />

    {/* PANEL */}
    <div
  className={`absolute left-0 top-0 h-full w-80 bg-white p-6 shadow-xl transform transition-transform duration-300 ${
    menuOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setMenuOpen(false)}
          className="text-2xl"
        >
          ✕
        </button>

        <h2 className="text-pink-600 text-lg font-bold">
        Menú
        </h2>
      </div>

      {/* OPCIONES */}
<div className="flex flex-col gap-6 text-pink-500 text-lg font-semibold">

  <span
    onClick={() => {
      navigate("/");
      setMenuOpen(false);
    }}
    className="cursor-pointer hover:text-pink-700 transition transform hover:translate-x-1"
  >
    🏠 Inicio
  </span>

  <span
    onClick={() => {
      navigate("/", { state: { scrollTo: "catalogo" } });
      setMenuOpen(false);
    }}
    className="cursor-pointer hover:text-pink-700 transition transform hover:translate-x-1"
  >
    🛍 Tienda →
  </span>

  <span
    onClick={() => {
      navigate("/", { state: { scrollTo: "contacto" } });
      setMenuOpen(false);
    }}
    className="cursor-pointer hover:text-pink-700 transition transform hover:translate-x-1"
  >
    📞 Contacto →
  </span>

</div>

    </div>

  </div>
      
      {/* 🔝 TOP BAR */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center text-sm py-1">
        🚚 Envíos a todo Chile | RM, V y VI: $3.500 | Otras regiones: por pagar • Moda y accesorios para mascotas
      </div>

      {/* 🔝 HEADER */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 sticky top-0 z-40">
  <div className="grid grid-cols-[auto_1fr_auto] items-center">

    {/* ☰ IZQUIERDA → MENÚ */}
    <div>
      <button
        onClick={() => setMenuOpen(true)}
        className="text-2xl"
      >
        ☰
      </button>
    </div>

    {/* 🟣 CENTRO → LOGO */}
 <div className="flex justify-center">
  <div
    onClick={() => navigate("/")}
    className="flex items-center gap-4 cursor-pointer"
  >
    
    {/* 🔥 LOGO IZQUIERDA */}
    <img
      src="/logo.png"
      className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-md"
    />

    {/* 🔥 TEXTO DERECHA (2 FILAS) */}
    <div className="flex flex-col justify-center leading-tight">

      <h1 className="text-pink-600 text-lg md:text-xl font-extrabold tracking-wide">
        BOUTIQUE PET LOVE
      </h1>

      <p className="text-purple-400 text-xs md:text-sm">
        Moda y accesorios para mascotas
      </p>

    </div>

  </div>
</div>

    {/* 🟢 DERECHA → CARRITO */}
<div className="flex justify-end">
  <div
  onClick={() => setCartOpen(true)}
  className="relative bg-pink-600 hover:bg-pink-700 transition text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer shadow-md"
>
    <ShoppingBag size={18} />

    <span className="hidden md:inline">Carrito</span>

    <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
      {cartCount}
    </span>
  </div>
</div>

  </div>
</header>

      {/* 🔽 CONTENIDO DINÁMICO */}
      <div>
        <Outlet />
         <a
  href={WHATSAPP}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-5 left-5 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition transform hover:scale-110"
>
  <MessageCircle size={24} />
</a>

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

    <img src={item.image}
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
  onClick={() => {
  setCartOpen(false);
  window.location.href = "/checkout";
}}
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
            `${i.name} - ${i.size} - ${formatPrice(i.price * (i.qty || 1))}`
        )
        .join("\n") +
      `\nTotal: ${formatPrice(total)}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
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
        {cartCount}
      </span>
    )}
  </div>
)}
      </div>

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
        
      </div>

    </div>
  );
}

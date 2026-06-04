import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, MessageCircle, ShoppingCart, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "https://wa.me/56982700002";

export default function Layout() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [toastTimeout, setToastTimeout] = useState(null);
  const [categories, setCategories] = useState([]);
	
const formatPrice = (price = 0) =>
  `$${Number(price).toLocaleString("es-CL")}`;

const total = (cart || []).reduce(
  (acc, item) => acc + item.price * (item.qty || 1),
  0
);


const saveCart = (newCart) => {
  setCart(newCart);
  localStorage.setItem("cart", JSON.stringify(newCart));
  window.dispatchEvent(new Event("storage"));
};

const increaseQty = (i) => {
  const newCart = [...(cart || [])];

  if (!newCart[i]) return;

  const currentQty = newCart[i].qty || 1;
  const stock = newCart[i].stock || 0;

  if (currentQty >= stock) {

    showToast(
      `Solo quedan ${stock} unidades disponibles`
    );

    return;
  }

  newCart[i].qty = currentQty + 1;

  saveCart(newCart);
};

const decreaseQty = (i) => {
  const newCart = [...(cart || [])];
	if (!newCart[i]) return;
  if ((newCart[i].qty || 1) > 1) {
    newCart[i].qty -= 1;
    saveCart(newCart);
  }
};

const removeItem = (i) => {
  const newCart = (cart || []).filter((_, index) => index !== i);
  saveCart(newCart);
};

const showToast = (message) => {

  setToast(message);

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  const timeout = setTimeout(() => {
    setToast(null);
  }, 2500);

  setToastTimeout(timeout);
};

	useEffect(() => {
  const updateCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
	  
setCart(Array.isArray(savedCart) ? savedCart : []);

    const total = (savedCart || []).reduce(
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

  return () => {
    document.body.style.overflow = "auto";
  };

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
  setCartOpen(false);
}, [location.pathname]);

	useEffect(() => {
  const handleToast = (e) => {
    showToast(e.detail);
  };

  window.addEventListener("toast", handleToast);

  return () => window.removeEventListener("toast", handleToast);
}, []);


useEffect(() => {

  const fetchCategories = async () => {

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", {
        ascending: true
      });

    setCategories(data || []);

  };

  fetchCategories();

}, []);

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
  className={`absolute left-0 top-0 h-full w-[92vw] max-w-[420px] bg-white/95 backdrop-blur-2xl p-6 shadow-2xl border-r border-pink-100 transform transition-transform duration-300
  ${
    menuOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>

      {/* HEADER */}
<div className="
  flex
  justify-between
  items-center
  mb-10
  pb-5
  border-b
  border-pink-100
">

  <div>

    <p className="
      text-xs
      uppercase
      tracking-[0.3em]
      text-pink-400
      font-bold
    ">
      Boutique Pet Love
    </p>

    <h2 className="
      text-2xl
      font-black
      text-pink-600
      mt-2
    ">
      ☰ Menú
    </h2>

  </div>

  <button
    onClick={() => setMenuOpen(false)}

    className="
      w-11
      h-11
      rounded-full
      bg-pink-100
      hover:bg-pink-200
      transition
      text-xl
      font-bold
    "
  >
    ✕
  </button>

</div>

{/* OPCIONES */}
<div className="
  flex
  flex-col
  gap-7
  overflow-y-auto
  pr-2
  h-[calc(100vh-140px)]
  scrollbar-hide
">

  {/* INICIO */}
  <button
    onClick={() => {
      navigate("/");
      setMenuOpen(false);
    }}

    className="
  text-left
  text-pink-600
  font-bold
  text-lg
  hover:text-pink-700
  hover:translate-x-1
  transition-all
  duration-300
"
  >
    🏠 Inicio
  </button>

  {/* COLECCIONES */}
	<div className="border-t border-pink-100 pt-6">
  <div>

    <h3 className="
      text-xs
      uppercase
      tracking-[0.25em]
      text-gray-400
      mb-3
    ">
      Colecciones
    </h3>

    <div className="flex flex-col gap-3">

      <button
        onClick={() => {
          navigate("/coleccion/new");
          setMenuOpen(false);
        }}

        className="   text-left   text-pink-500   hover:text-pink-700   hover:translate-x-1   transition-all   duration-300 "
      >
        🆕 Nueva colección
      </button>

      <button
        onClick={() => {
          navigate("/coleccion/best-seller");
          setMenuOpen(false);
        }}

        className="   text-left   text-pink-500   hover:text-pink-700   hover:translate-x-1   transition-all   duration-300 "
      >
        🔥 Best Sellers
      </button>

      <button
        onClick={() => {
          navigate("/coleccion/luxury");
          setMenuOpen(false);
        }}

        className="   text-left   text-pink-500   hover:text-pink-700   hover:translate-x-1   transition-all   duration-300 "
      >
        👑 Luxury
      </button>

      <button
        onClick={() => {
          navigate("/coleccion/exclusive");
          setMenuOpen(false);
        }}

        className="   text-left   text-pink-500   hover:text-pink-700   hover:translate-x-1   transition-all   duration-300 "
      >
        💎 Exclusivos
      </button>

    </div>

  </div>
</div>

  {/* MASCOTAS */}
	<div className="border-t border-pink-100 pt-6">
  <div>

    <h3 className="
      text-xs
      uppercase
      tracking-[0.25em]
      text-gray-400
      mb-3
    ">
      Mascotas
    </h3>

    <div className="flex flex-col gap-3">

      <button
        onClick={() => {
          navigate("/genero/macho");
          setMenuOpen(false);
        }}

        className="   text-left   text-pink-500   hover:text-pink-700   hover:translate-x-1   transition-all   duration-300 "
      >
        🐶 Macho
      </button>

      <button
        onClick={() => {
          navigate("/genero/hembra");
          setMenuOpen(false);
        }}

        className="   text-left   text-pink-500   hover:text-pink-700   hover:translate-x-1   transition-all   duration-300 "
      >
        🎀 Hembra
      </button>

		<button
  onClick={() => {
    navigate("/genero/unisex");
    setMenuOpen(false);
  }}

  className="
    text-left
    text-pink-500
    hover:text-pink-700
    hover:translate-x-1
    transition-all
    duration-300
  "
>
  ✨ Unisex
</button>

    </div>

  </div>
</div>
	
  {/* CATEGORÍAS */}
	<div className="border-t border-pink-100 pt-6">
  <div>

    <h3 className="
      text-xs
      uppercase
      tracking-[0.25em]
      text-gray-400
      mb-3
    ">
      Categorías
    </h3>

    <div className="flex flex-col gap-3">

{categories.map(category => (

  <button
    key={category.id}

    onClick={() => {

      navigate(
        `/categoria/${category.slug}`
      );

      setMenuOpen(false);

    }}

    className="
      text-left
      text-pink-500
      hover:text-pink-700
      hover:translate-x-1
      transition-all
      duration-300
    "
  >
    ✨ {category.name}
  </button>

))}

</div>

  </div>
</div>

  {/* CONTACTO */}
  <button
    onClick={() => {
      navigate("/", {
        state: {
          scrollTo: "contacto"
        }
      });

      setMenuOpen(false);
    }}

    className="
      mt-4
      text-left
      text-pink-600
      font-bold
      text-lg
      hover:text-pink-700
    "
  >
    📞 Contacto
  </button>

</div>

    </div>

  </div>
      
      {/* 🔝 TOP BAR */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center text-sm py-1">
        🚚 Envíos a todo Chile | RM, V y VI: $3.500 | Otras regiones: por pagar • Moda y accesorios para mascotas
      </div>

      {/* 🔝 HEADER */}
      <header className="bg-white/90 backdrop-blur-xl shadow-sm px-4 md:px-6 py-3 md:py-4 sticky top-0 z-40 border-b border-pink-100">
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
  src="/logo.webp"
  alt="Boutique Pet Love"
  width="64"
  height="64"
  className="w-16 h-16 md:w-16 md:h-16 rounded-full shadow-md"
/>

    {/* 🔥 TEXTO DERECHA (2 FILAS) */}
<div className="
  hidden
  md:flex
  flex-col
  justify-center
  leading-tight
">

      <h1 className="text-pink-600 text-base sm:text-lg md:text-xl font-black tracking-[0.15em]">
        BOUTIQUE PET LOVE
      </h1>

      <p className="text-purple-400 text-xs md:text-sm">
        Moda y accesorios para mascotas
      </p>

    </div>

  </div>
</div>



    {/* 🟢 DERECHA → ACTIONS */}
<div className="
  flex
  justify-end
  items-center
  gap-2 md:gap-3
">

  {/* INSTAGRAM */}
  <a
  href="https://instagram.com/boutique_petlove"
  target="_blank"
  rel="noreferrer"
  aria-label="Instagram Boutique Pet Love"

    className="
      flex
      items-center
      justify-center
      w-9
      h-9
      md:w-11
      md:h-11
      rounded-full
      border
      border-pink-200
      bg-white/90
      backdrop-blur-md
      text-pink-500
      hover:bg-pink-50
      hover:scale-105
	  hover:-translate-y-0.5
      transition-all
      duration-300
      shadow-[0_4px_20px_rgba(0,0,0,0.08)]
    "
  >
    <Instagram size={18} />
  </a>

  {/* WHATSAPP */}
  <a
 href={WHATSAPP}
  target="_blank"
  rel="noreferrer"
  aria-label="WhatsApp Boutique Pet Love"

    className="
      flex
      items-center
      justify-center
      w-11
      h-11
      rounded-full
      border
      border-green-200
      bg-white/90
      backdrop-blur-md
      text-green-500
      hover:bg-green-50
      hover:scale-105
	  hover:-translate-y-0.5
      transition-all
      duration-300
      shadow-[0_4px_20px_rgba(0,0,0,0.08)]
    "
  >
    <MessageCircle size={18} />
  </a>

  {/* CARRITO */}
  <div
    onClick={() => setCartOpen(true)}

    className="
      relative
      bg-gradient-to-r
      from-pink-500
      to-pink-600
      hover:opacity-90
      transition
      text-white
      px-4
      py-2
      rounded-full
      flex
      items-center
      gap-2
      cursor-pointer
      shadow-md
    "
  >

    <ShoppingBag size={18} />

    <span className="hidden md:inline">
      Carrito
    </span>

    <span className="
      absolute
      -top-2
      -right-2
      bg-purple-500
      text-white
      text-xs
      px-2
      py-0.5
      rounded-full
      font-bold
    ">
      {cartCount}
    </span>

  </div>

</div>


  </div>
</header>

      {/* 🔽 CONTENIDO DINÁMICO */}
      <div>
        <main id="main-content">
 	 		<Outlet />
		</main>
         

        {/* CARRITO */}
      <div
  	className={`fixed bottom-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    	cartOpen ? "w-[92vw] max-w-sm p-4 max-h-[80vh] overflow-y-auto" : "w-16 h-16 flex items-center justify-center"
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

        {(cart || []).length === 0 && <p>Vacío</p>}

        {(cart || []).map((item, i) => (
  <div key={i} className="flex justify-between items-center text-sm mt-4 gap-3 pb-3 border-b border-pink-100">

    <img src={item.image}
  alt={item.name}
  width="48"
  height="48"
      className="w-12 h-12 object-cover rounded-lg"
    />

    <div className="flex-1">
      <p className="font-semibold text-xs">{item.name}</p>
      <p className="text-xs text-gray-500">{item.size}</p>

      {/* 🔥 CONTROL DE CANTIDAD */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => decreaseQty(i)}
          className="w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-200 transition font-bold"
        >
          −
        </button>

        <span>{item.qty || 1}</span>

<button
  onClick={() => increaseQty(i)}
  disabled={(item.qty || 1) >= (item.stock || 0)}
  className={`
    w-8 h-8
    md:w-7 md:h-7
    flex items-center justify-center
    rounded-full
    font-bold
    transition

    ${
      (item.qty || 1) >= (item.stock || 0)
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-pink-100 hover:bg-pink-200"
    }
  `}
>
  +
</button>
      </div>
    </div>

    <div className="text-right">

  {/* 💰 PRECIO ORIGINAL */}
  {item.discount > 0 && (
    <p
      className="text-xs"
      style={{
        textDecoration: "line-through",
        color: "#999"
      }}
    >
      {formatPrice(item.originalPrice * (item.qty || 1))}
    </p>
  )}

  {/* 💸 PRECIO FINAL */}
  <p className="text-xs font-bold text-pink-600">
    {formatPrice(item.price * (item.qty || 1))}
  </p>

  {/* 🔥 BADGE DESCUENTO */}
  {item.discount > 0 && (
    <p className="text-[10px] text-pink-500 font-bold">
      -{item.discount}%
    </p>
  )}

  <button
    onClick={() => removeItem(i)}
   className="text-red-500 text-xs font-semibold hover:text-red-700 transition"
  >
    Eliminar
  </button>

</div>

  </div>
))}

{(cart || []).length > 0 && (
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
  className="block mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white text-center py-3 rounded-2xl w-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
>
  💳 Finalizar compra segura
</button>

    {/* 🟢 WHATSAPP */}
   <a
  href={`${WHATSAPP}?text=${encodeURIComponent(
    "Pedido:\n" +
      (cart || []).map(
          (i) =>
            `${i.name} - ${i.size} - ${formatPrice(i.price * (i.qty || 1))}`
        )
        .join("\n") +
      `\nTotal: ${formatPrice(total)}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Contactar por WhatsApp"
  className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white py-3 rounded-2xl flex justify-center items-center font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
>
  Contactar por WhatsApp
</a>
  </>
)}
</>
 ) : (
  <div
    onClick={() => setCartOpen(true)}
    className="
relative
cursor-pointer
bg-gradient-to-r
from-pink-500
to-purple-500
text-white
w-16
h-16
flex
items-center
justify-center
rounded-full
shadow-2xl
transition-all
duration-300
hover:scale-105
active:scale-95
md:w-14
md:h-14
"
  >
    <ShoppingCart size={24} />

    {/* 🔢 CONTADOR */}
    {(cart || []).length > 0 && (
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
            <img
  src="/logo.webp"
  alt="Boutique Pet Love"
  width="64"
  height="64"
  className="w-16 rounded-full mb-2"
/>
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

        <div className="text-center text-sm text-gray-600 mt-6">
          © 2026 BOUTIQUE PET LOVE
        </div>
      </footer>
        
      </div>

		{toast && (
  <div
    style={{
  position: "fixed",
  bottom: 30,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#111",
  color: "white",
  padding: "12px 20px",
  borderRadius: 10,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  zIndex: 9999,
  animation: "fadeIn 0.3s ease",
  transition: "all 0.3s ease"
}}
  >
    {toast}
  </div>
)}
		
    </div>
  );
}

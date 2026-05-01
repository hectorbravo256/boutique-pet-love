import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";


export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  const updateCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
    setCartCount(total);
  };

  updateCart();

  window.addEventListener("storage", updateCart);

  return () => window.removeEventListener("storage", updateCart);
}, []);

  useEffect(() => {
  document.body.style.overflow = menuOpen ? "hidden" : "auto";
}, [menuOpen]);

  useEffect(() => {
  if (location.state?.scrollTo) {
    const el = document.getElementById(location.state.scrollTo);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}, [location]);

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
  className="flex flex-col items-center cursor-pointer"
>

  {/* 🔹 FILA: LOGO + NOMBRE */}
  <div className="flex items-center gap-3 hover:opacity-80 transition">
    <img src="/logo.png" className="w-9 h-9 rounded-full" />

    <h1 className="text-pink-600 text-lg md:text-xl font-extrabold tracking-wide">
      BOUTIQUE PET LOVE
    </h1>
  </div>

  {/* 🔹 SUBTEXTO */}
  <p className="text-purple-400 text-[11px] md:text-xs text-center mt-1">
    Moda y accesorios para mascotas
  </p>

</div>
</div>

    {/* 🟢 DERECHA → CARRITO */}
<div className="flex justify-end">
  <div className="relative bg-pink-600 hover:bg-pink-700 transition text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer shadow-md">
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
      </div>

    </div>
  );
}

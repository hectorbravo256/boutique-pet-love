import { Outlet, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="bg-pink-50 min-h-screen">

      {/* 🔝 TOP BAR */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center text-sm py-1">
        🚚 Envíos a todo Chile | RM, V y VI: $3.500 | Otras regiones: por pagar • Moda y accesorios para mascotas
      </div>

      {/* 🔝 HEADER */}
      <header className="bg-white shadow-md flex justify-between items-center px-8 py-5">

        {/* LOGO */}
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
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

        {/* MENÚ */}
        <div className="hidden md:flex gap-8 text-lg md:text-xl font-bold text-gray-700">
          <span onClick={() => navigate("/")} className="hover:text-pink-600 cursor-pointer">
            Inicio
          </span>
          <span onClick={() => navigate("/")} className="hover:text-pink-600 cursor-pointer">
            Tienda
          </span>
          <span className="hover:text-pink-600 cursor-pointer">
            Contacto
          </span>
        </div>

        {/* CARRITO */}
        <div
          className="relative bg-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer"
        >
          <ShoppingBag size={16} />
          Carrito
        </div>

      </header>

      {/* 🔽 CONTENIDO DINÁMICO */}
      <div>
        <Outlet />
      </div>

    </div>
  );
}

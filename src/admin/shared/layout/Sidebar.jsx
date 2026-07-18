import { NavLink } from "react-router-dom";

const menu = [

  {
    title: "Dashboard",
    icon: "🏠",
    to: "/admin",
  },

  {
    title: "Catálogo",
    icon: "🛍️",
    to: "/admin/catalog",
  },

  {
    title: "Inventario",
    icon: "📦",
    to: "/admin/inventory",
  },

  {
    title: "Ventas",
    icon: "💰",
    to: "/admin/sales",
  },

  {
    title: "Clientes",
    icon: "👥",
    to: "/admin/customers",
  },

  {
    title: "Proveedores",
    icon: "🚚",
    to: "/admin/suppliers",
  },

  {
    title: "Reportes",
    icon: "📈",
    to: "/admin/reports",
  },

  {
    title: "Configuración",
    icon: "⚙️",
    to: "/admin/settings",
  },

];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col">

      <div className="p-8">

        <h1 className="text-2xl font-black">
          Boutique Pet Love
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          ERP
        </p>

      </div>

      <nav className="flex-1 px-4">

        {menu.map((item) => (

          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-800 transition"
          >

            <span>{item.icon}</span>

            <span>{item.title}</span>

          </NavLink>

        ))}

      </nav>

    </aside>
  );
}

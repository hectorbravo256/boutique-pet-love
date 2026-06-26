import {
  Link,
  Outlet,
  useLocation
} from "react-router-dom";

import {
  useState
} from "react";

export default function AdminLayout() {

  const location =
    useLocation();

  const [
    sidebarOpen,
    setSidebarOpen
  ] = useState(false);

  const isActive =
    (path) =>
      location.pathname === path;

  const menu = [
    {
      label: "Dashboard",
      icon: "📊",
      path: "/admin"
    },
    {
      label: "Productos",
      icon: "🛒",
      path: "/admin/productos"
    },
    {
      label: "Crear",
      icon: "➕",
      path: "/admin/crear"
    },
    {
      label: "Ventas",
      icon: "💰",
      path: "/admin/ventas"
    },
    {
      label: "Categorías",
      icon: "🗂",
      path: "/admin/categorias"
    },
        {
      label: "Inventario",
      icon: "📦",
      path: "/admin/inventario"
    }
  ];

  return (

    <div className="
      min-h-screen
      bg-gradient-to-b
      from-[#fff7fb]
      via-white
      to-[#fdf2f8]
      flex
    ">

      {/* MOBILE TOPBAR */}
      <div className="
        md:hidden

        fixed
        top-0
        left-0
        right-0

        h-[72px]

        bg-white/80
        backdrop-blur-xl

        border-b
        border-slate-200

        px-4

        flex
        items-center
        justify-between

        z-[70]
      ">

        <div>

          <p className="
            uppercase
            tracking-[0.3em]
            text-[10px]
            font-bold
            text-pink-500
          ">
            Administración
          </p>

          <h1 className="
            text-xl
            font-black
            text-slate-900
          ">
            ⚙️ Admin
          </h1>

        </div>

        <button
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }

          className="
            w-12
            h-12

            rounded-2xl

            bg-gradient-to-r
            from-pink-500
            to-purple-500

            text-white
            text-xl

            shadow-lg

            active:scale-95

            transition-all
          "
        >
          ☰
        </button>

      </div>

      {/* BACKDROP */}
      {
        sidebarOpen && (

          <div
            onClick={() =>
              setSidebarOpen(false)
            }

            className="
              md:hidden

              fixed
              inset-0

              bg-black/40
              backdrop-blur-sm

              z-[60]
            "
          />

        )
      }

      {/* SIDEBAR */}
      <aside className={`
        fixed
        top-0
        left-0

        h-screen
        w-[280px]

        flex
        flex-col

        bg-[#111827]

        border-r
        border-white/5

        p-6

        z-[80]

        transition-all
        duration-300

        ${sidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
        }

        md:translate-x-0
      `}>

        {/* HEADER */}
        <div className="mb-10">

          <p className="
            uppercase
            tracking-[0.35em]
            text-[11px]
            text-pink-400
            font-bold
          ">
            Administración
          </p>

          <h1 className="
            text-3xl
            font-black
            text-white
            mt-3
          ">
            ⚙️ Admin
          </h1>

        </div>

        {/* MENU */}
        <nav className="
          flex
          flex-col
          gap-3
        ">

          {menu.map(item => (

            <Link
              key={item.path}

              to={item.path}

              onClick={() =>
                setSidebarOpen(false)
              }

              className={`
                flex
                items-center
                gap-3

                px-4
                py-3

                rounded-2xl

                font-semibold

                transition-all
                duration-300

                hover:-translate-y-0.5

                ${
                  isActive(item.path)

                    ? `
                      bg-gradient-to-r
                      from-pink-500
                      to-purple-500
                      text-white
                      shadow-lg
                    `

                    : `
                      text-slate-300
                      hover:bg-white/5
                      hover:text-white
                    `
                }
              `}
            >

              <span className="text-lg">
                {item.icon}
              </span>

              {item.label}

            </Link>

          ))}

        </nav>

        {/* FOOTER */}
        <div className="
          mt-auto
          pt-8
        ">

          <div className="
            rounded-3xl

            bg-white/5

            border
            border-white/10

            p-5
          ">

            <p className="
              text-xs
              uppercase
              tracking-[0.25em]

              text-slate-400
              font-bold
            ">
              Boutique Pet Love
            </p>

            <p className="
              mt-3
              text-sm
              text-slate-300
              leading-relaxed
            ">
              Panel administrativo premium
              para ecommerce.
            </p>

          </div>

        </div>

      </aside>

      {/* CONTENT */}
      <main className="
        flex-1

        md:ml-[280px]

        pt-[92px]
        md:pt-8

        p-4
        md:p-8
      ">

        <div className="
          max-w-[1600px]
          mx-auto
        ">

          <Outlet />

        </div>

      </main>

    </div>

  );

}

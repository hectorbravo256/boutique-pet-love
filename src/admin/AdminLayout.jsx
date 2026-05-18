import {
  Link,
  Outlet,
  useLocation
} from "react-router-dom";

export default function AdminLayout() {

  const location =
    useLocation();

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
    }
  ];

  return (

    <div className="
      min-h-screen
      bg-[#f5f7fb]
      flex
    ">

      {/* SIDEBAR */}
      <aside className="
        hidden
        md:flex
        fixed
        top-0
        left-0
        h-screen
        w-[260px]

        flex-col

        bg-[#111827]
        border-r
        border-white/5

        p-6

        z-50
      ">

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

      </aside>

      {/* CONTENT */}
      <main className="
        flex-1
        md:ml-[260px]
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

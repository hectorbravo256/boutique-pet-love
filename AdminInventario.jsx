import AdminCard from "./components/AdminCard";

export default function AdminInventario() {

  return (

    <div className="max-w-[1500px] mx-auto p-8">

      <div className="mb-10">

        <p className="
          uppercase
          tracking-[0.3em]
          text-pink-500
          text-xs
          font-bold
        ">
          Administración
        </p>

        <h1 className="
          text-5xl
          font-black
          text-slate-900
          mt-3
        ">
          📦 Inventario
        </h1>

      </div>

      <div className="
        grid
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        <AdminCard className="cursor-pointer">
          <h2 className="text-xl font-black">
            Compras
          </h2>

          <p className="mt-2 text-slate-500">
            Registrar ingreso de mercadería.
          </p>

        </AdminCard>

        <AdminCard className="cursor-pointer">

          <h2 className="text-xl font-black">
            Ventas Locales
          </h2>

          <p className="mt-2 text-slate-500">
            Registrar ventas presenciales.
          </p>

        </AdminCard>

        <AdminCard className="cursor-pointer">

          <h2 className="text-xl font-black">
            Movimientos
          </h2>

          <p className="mt-2 text-slate-500">
            Historial completo del inventario.
          </p>

        </AdminCard>

        <AdminCard className="cursor-pointer">

          <h2 className="text-xl font-black">
            Ajustes
          </h2>

          <p className="mt-2 text-slate-500">
            Correcciones de stock.
          </p>

        </AdminCard>

      </div>

    </div>

  );

}

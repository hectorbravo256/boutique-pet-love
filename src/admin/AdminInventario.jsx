import AdminCard from "./components/AdminCard";
import InventoryDashboard from "./inventory/InventoryDashboard";

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

<InventoryDashboard />


      </div>

    </div>

  );

}

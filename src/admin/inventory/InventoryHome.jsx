import { Link } from "react-router-dom";
import AdminCard from "../components/AdminCard";

const modules = [
    {
        title: "Compras",
        description: "Registrar compras y recepción de mercadería.",
        icon: "📥",
        to: "/admin/inventario/compras",
        color: "from-blue-500 to-cyan-500",
    },
    {
        title: "Inventario Maestro",
        description: "Administrar stock, precios y variantes.",
        icon: "📦",
        to: "/admin/inventario/master",
        color: "from-pink-500 to-fuchsia-600",
    },
    {
        title: "Proveedores",
        description: "Administrar proveedores, contactos y empresas.",
        icon: "🤝",
        to: "/admin/inventario/proveedores",
        color: "from-sky-500 to-cyan-500",
    },
    {
        title: "Ventas",
        description: "Registrar ventas presenciales y online.",
        icon: "🛒",
        to: "/admin/inventario/ventas",
        color: "from-green-500 to-emerald-500",
    },
    {
        title: "Movimientos",
        description: "Entradas, salidas y ajustes.",
        icon: "🔄",
        to: "/admin/inventario/movimientos",
        color: "from-orange-500 to-amber-500",
    },
    {
        title: "Reportes",
        description: "Indicadores y análisis del inventario.",
        icon: "📊",
        to: "/admin/inventario/reportes",
        color: "from-violet-500 to-purple-500",
    },
];

export default function InventoryHome() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {modules.map((module) => (
                <Link key={module.title} to={module.to}>
                    <AdminCard className="h-full hover:scale-[1.02] transition-all cursor-pointer">
                        <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center text-3xl mb-5`}
                        >
                            {module.icon}
                        </div>

                        <h3 className="text-xl font-bold">
                            {module.title}
                        </h3>

                        <p className="text-slate-500 mt-2">
                            {module.description}
                        </p>
                    </AdminCard>
                </Link>
            ))}
        </div>
    );
}

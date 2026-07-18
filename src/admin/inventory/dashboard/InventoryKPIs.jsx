import StatsCard from "../../shared/ui/StatsCard";

export default function InventoryKPIs({ dashboard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatsCard
        title="Stock Total"
        value={dashboard.stockTotal}
        icon="📦"
      />

      <StatsCard
        title="Productos"
        value={dashboard.productos}
        icon="🛍️"
        color="bg-blue-500"
      />

      <StatsCard
        title="Variantes"
        value={dashboard.variantes}
        icon="📋"
        color="bg-emerald-500"
      />

      <StatsCard
        title="Stock Crítico"
        value={dashboard.stockCritico}
        icon="⚠️"
        color="bg-red-500"
      />

    </div>
  );
}

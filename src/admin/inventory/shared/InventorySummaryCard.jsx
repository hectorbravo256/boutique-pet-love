export default function InventorySummaryCard({
  label,
  value,
  icon = null,
  description = null,
  variant = "default",
}) {
  const variants = {
    default: "bg-white border-slate-200",
    pink: "bg-pink-50 border-pink-100",
    blue: "bg-blue-50 border-blue-100",
    green: "bg-emerald-50 border-emerald-100",
    purple: "bg-purple-50 border-purple-100",
  };

  const valueColors = {
    default: "text-slate-900",
    pink: "text-pink-600",
    blue: "text-blue-600",
    green: "text-emerald-600",
    purple: "text-purple-600",
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
        variants[variant] || variants.default
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              valueColors[variant] || valueColors.default
            }`}
          >
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-lg shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

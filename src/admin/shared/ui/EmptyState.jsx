import Card from "./Card";

export default function EmptyState({
  icon = "📭",
  title = "Sin información",
  description = "No existen registros.",
}) {
  return (
    <Card>

      <div className="text-center py-12">

        <div className="text-6xl">

          {icon}

        </div>

        <h3 className="mt-5 text-xl font-bold">

          {title}

        </h3>

        <p className="text-slate-500 mt-3">

          {description}

        </p>

      </div>

    </Card>
  );
}

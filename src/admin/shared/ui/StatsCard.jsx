import Card from "./Card";

export default function StatsCard({
  title,
  value,
  icon,
  color = "bg-pink-500",
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div
          className={`
            w-14
            h-14
            rounded-xl
            flex
            items-center
            justify-center
            text-white
            text-2xl
            ${color}
          `}
        >
          {icon}
        </div>

      </div>
    </Card>
  );
}

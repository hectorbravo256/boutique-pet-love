import { Link } from "react-router-dom";
import Card from "./Card";

export default function QuickActionCard({
  icon,
  title,
  description,
  to = "#",
}) {
  return (
    <Link to={to}>

      <Card
        className="
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          cursor-pointer
          h-full
        "
      >

        <div className="text-4xl mb-4">

          {icon}

        </div>

        <h3 className="font-bold text-lg">

          {title}

        </h3>

        <p className="text-slate-500 mt-2">

          {description}

        </p>

      </Card>

    </Link>
  );
}

import Card from "./Card";

export default function PageHeader({

  title,

  subtitle,

  icon,

  actions,

}) {

  return (

    <Card className="mb-8">

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-5">

          <div className="text-5xl">

            {icon}

          </div>

          <div>

            <p className="text-xs uppercase tracking-widest text-pink-500 font-bold">

              Boutique Pet Love ERP

            </p>

            <h1 className="text-3xl font-black text-slate-900">

              {title}

            </h1>

            <p className="text-slate-500 mt-1">

              {subtitle}

            </p>

          </div>

        </div>

        <div>

          {actions}

        </div>

      </div>

    </Card>

  );

}

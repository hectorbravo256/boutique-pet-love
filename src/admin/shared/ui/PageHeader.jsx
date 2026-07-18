export default function PageHeader({

    title,

    subtitle,

    icon,

    actions

}) {

    return (

        <div className="flex items-center justify-between mb-10">

            <div className="flex items-center gap-5">

                <div
                    className="
                        w-16
                        h-16
                        rounded-2xl
                        bg-pink-100
                        flex
                        items-center
                        justify-center
                        text-4xl
                    "
                >
                    {icon}
                </div>

                <div>

                    <p
                        className="
                            uppercase
                            tracking-[6px]
                            text-pink-500
                            text-xs
                            font-black
                        "
                    >
                        Boutique Pet Love ERP
                    </p>

                    <h1
                        className="
                            text-5xl
                            font-black
                            text-slate-900
                        "
                    >
                        {title}
                    </h1>

                    <p
                        className="
                            mt-2
                            text-slate-500
                        "
                    >
                        {subtitle}
                    </p>

                </div>

            </div>

            {actions}

        </div>

    );

}

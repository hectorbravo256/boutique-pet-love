export default function SectionStep({
    numero,
    titulo,
    descripcion
}) {

    return (
        <div className="
            flex
            items-start
            gap-4
            mb-5
        ">

            <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-pink-500
                to-purple-600
                text-white
                font-black
                shadow-md
            ">

                {numero}

            </div>


            <div className="
                min-w-0
                pt-0.5
            ">

                <h3 className="
                    text-base
                    md:text-lg
                    font-black
                    text-slate-800
                ">

                    {titulo}

                </h3>


                {descripcion && (

                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                        leading-relaxed
                    ">

                        {descripcion}

                    </p>

                )}

            </div>

        </div>
    );
}

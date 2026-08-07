import { useEffect } from "react";

export default function Modal({

    open,

    onClose,

    title,

    children,

    size = "lg",

    closeOnBackdrop = true,

    workspace = false

}) {

    useEffect(() => {

        function handleKeyDown(event) {

            if (event.key === "Escape") {

                onClose?.();

            }

        }

        if (open) {

            document.addEventListener("keydown", handleKeyDown);

        }

        return () => {

            document.removeEventListener("keydown", handleKeyDown);

        };

    }, [open, onClose]);

    if (!open) return null;

const sizes = {

    sm: "max-w-md",

    md: "max-w-2xl",

    lg: "max-w-4xl",

    xl: "max-w-6xl",

    xxl: "max-w-[1180px]",

    full: "max-w-[95vw]"

};

    return (

<div
    className={`
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        ${workspace ? "pl-[260px]" : ""}
    `}
>

            <div

                className="absolute inset-0 bg-black/60 backdrop-blur-sm"

                onClick={() => {

                    if (closeOnBackdrop) {

                        onClose?.();

                    }

                }}

            />

            <div

                className={`

                    relative

                    bg-white

                    rounded-3xl

                    shadow-2xl

                    w-full

                    ${sizes[size]}

                    mx-4

                    overflow-hidden

                    animate-fade-in

                `}

            >

                <div className="

                    flex

                    items-center

                    justify-between

                    px-8

                    py-5

                    border-b

                ">

                    <h2 className="text-2xl font-black">

                        {title}

                    </h2>

                    <button

                        onClick={onClose}

                        className="

                            text-3xl

                            text-slate-400

                            hover:text-red-500

                            transition

                        "

                    >

                        ×

                    </button>

                </div>

<div

    className="

        p-8

        max-h-[88vh]

        overflow-y-auto

    "

>

    {children}

</div>

            </div>

        </div>

    );

}

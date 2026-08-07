import { useEffect, useState } from "react";

export default function CurrencyInput({

    value = 0,

    onChange,

    placeholder = "$ 0"

}) {

    const [display, setDisplay] = useState("");

    useEffect(() => {

        setDisplay(

            Number(value || 0).toLocaleString("es-CL")

        );

    }, [value]);

    function handleChange(e) {

        const onlyNumbers = e.target.value.replace(/\D/g, "");

        const number = Number(onlyNumbers || 0);

        setDisplay(

            number.toLocaleString("es-CL")

        );

        onChange?.(number);

    }

    return (

        <div
            className="
                flex
                items-center
                rounded-xl
                border
                bg-white
                h-12
                px-4
                shadow-sm
            "
        >

            <span className="text-slate-500 font-semibold mr-2">

                $

            </span>

            <input

                type="text"

                value={display}

                onChange={handleChange}

                placeholder={placeholder}

                className="
                    flex-1
                    outline-none
                    font-semibold
                "

            />

        </div>

    );

}

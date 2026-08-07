import { Minus, Plus } from "lucide-react";

export default function QuantityInput({

    value = 1,

    onChange,

    min = 1,

    max = 999999,

    step = 1,

    size = "sm"

}) {

    function decrease() {

        const newValue = Math.max(

            min,

            Number(value) - step

        );

        onChange?.(newValue);

    }

    function increase() {

        const newValue = Math.min(

            max,

            Number(value) + step

        );

        onChange?.(newValue);

    }

    function handleChange(e) {

        let number = Number(e.target.value);

        if (isNaN(number)) number = min;

        if (number < min) number = min;

        if (number > max) number = max;

        onChange?.(number);

    }

    const sizes = {

    sm: {

        container: "w-[160px]",

        input: "w-16",

        button: "w-10"

    },

    lg: {

        container: "w-[260px]",

        input: "w-24",

        button: "w-12"

    }

};

const current = sizes[size];

    return (

        <div
            className="
                flex
                items-center
                overflow-hidden
                rounded-xl
                border
                bg-white
                shadow-sm
                h-12
            "
        >

            <button

                type="button"

                onClick={decrease}

                className={`
                    ${current.button}
                    h-12
                    flex
                    items-center
                    justify-center
                    hover:bg-slate-100
                    transition
                    hover:bg-red-50
                    hover:text-red-600
                "

            >

                <Minus size={18} />

            </button>

            <input

                type="number"

                value={value}

                onChange={handleChange}

               className={`
                    ${current.input}
                    h-12
                    text-center
                    font-bold
                    outline-none
                "

            />

            <button

                type="button"

                onClick={increase}

                className={`
                    ${current.button}
                    h-12
                    flex
                    items-center
                    justify-center
                    hover:bg-slate-100
                    transition
                    hover:bg-green-50
                    hover:text-green-600
                "

            >

                <Plus size={18} />

            </button>

        </div>

    );

}

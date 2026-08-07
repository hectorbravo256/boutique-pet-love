import { Minus, Plus } from "lucide-react";

export default function QuantityInput({

    value = 1,

    onChange,

    min = 1,

    max = 999999,

    step = 1

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

                className="
                    w-10
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

                className="
                    w-[80px]
                    h-12
                    text-center
                    font-bold
                    outline-none
                "

            />

            <button

                type="button"

                onClick={increase}

                className="
                    w-10
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

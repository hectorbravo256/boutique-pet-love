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
                    w-12
                    h-full
                    flex
                    items-center
                    justify-center
                    hover:bg-slate-100
                    transition
                "

            >

                <Minus size={18} />

            </button>

            <input

                type="number"

                value={value}

                onChange={handleChange}

                className="
                    flex-1
                    h-full
                    text-center
                    font-semibold
                    outline-none
                    border-x
                "

            />

            <button

                type="button"

                onClick={increase}

                className="
                    w-12
                    h-full
                    flex
                    items-center
                    justify-center
                    hover:bg-slate-100
                    transition
                "

            >

                <Plus size={18} />

            </button>

        </div>

    );

}

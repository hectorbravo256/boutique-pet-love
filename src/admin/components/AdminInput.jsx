export default function AdminInput(props) {

  return (

    <input
      {...props}

      className="
        w-full

        rounded-2xl

        border
        border-slate-200

        bg-white

        px-4
        py-3

        text-sm
        font-medium

        outline-none

        transition-all
        duration-300

        focus:border-pink-400
        focus:ring-4
        focus:ring-pink-100
      "
    />

  );

}

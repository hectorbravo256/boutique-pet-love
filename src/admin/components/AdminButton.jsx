export default function AdminButton({
  children,
  danger = false,
  className = "",
  ...props
}) {

  return (

    <button
      {...props}

      className={`
        w-full

        py-3

        rounded-2xl

        font-bold
        text-white

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:opacity-90

        ${
          danger

            ? `
              bg-gradient-to-r
              from-slate-800
              to-slate-700
            `

            : `
              bg-gradient-to-r
              from-pink-500
              to-purple-500
            `
        }

        ${className}
      `}
    >

      {children}

    </button>

  );

}

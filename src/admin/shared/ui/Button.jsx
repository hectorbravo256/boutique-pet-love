const variants = {
  primary:
    "bg-pink-600 hover:bg-pink-700 text-white",

  secondary:
    "bg-slate-100 hover:bg-slate-200 text-slate-700",

  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white",

  danger:
    "bg-red-600 hover:bg-red-700 text-white",
};

export default function Button({

  children,

  variant = "primary",

  className = "",

  ...props

}) {
  return (
    <button
      className={`
        px-5
        py-3
        rounded-xl
        font-semibold
        transition
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Card({
  children,
  className = "",
  padding = "p-6",
}) {
  return (
    <div
      className={`
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

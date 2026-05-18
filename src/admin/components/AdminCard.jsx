export default function AdminCard({
  children,
  className = ""
}) {

  return (

    <div className={`
      bg-white/80
      backdrop-blur-xl

      border
      border-white/60

      rounded-[30px]

      p-6

      shadow-[0_10px_40px_rgba(0,0,0,0.05)]

      transition-all
      duration-300

      hover:-translate-y-1

      ${className}
    `}>

      {children}

    </div>

  );

}

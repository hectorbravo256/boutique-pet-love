export default function AdminSkeleton({
  className = ""
}) {

  return (

    <div className={`
      relative
      overflow-hidden

      rounded-3xl

      bg-slate-200/70

      ${className}
    `}>

      <div className="
        absolute
        inset-0

        -translate-x-full

        animate-[shimmer_2s_infinite]

        bg-gradient-to-r
        from-transparent
        via-white/60
        to-transparent
      " />

    </div>

  );

}

import {
  useEffect
} from "react";

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl"
}) {

  useEffect(() => {

    const handleEsc = (e) => {

      if (
        e.key === "Escape"
      ) {
        onClose();
      }

    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleEsc
      );

    };

  }, [onClose]);

  if (!open) return null;

  return (

    <div className="
      fixed
      inset-0

      z-[9999]

      flex
      items-center
      justify-center

      p-4
    ">

      {/* BACKDROP */}
      <div
        onClick={onClose}

        className="
          absolute
          inset-0

          bg-black/40
          backdrop-blur-sm

          animate-[fadeIn_.25s_ease]
        "
      />

      {/* MODAL */}
      <div className={`
        relative

        w-full
        ${width}

        rounded-[32px]

        bg-white/90
        backdrop-blur-2xl

        border
        border-white/60

        shadow-[0_25px_80px_rgba(15,23,42,0.20)]

        overflow-hidden

        animate-[modalIn_.25s_ease]
      `}>

        {/* HEADER */}
        <div className="
          flex
          items-center
          justify-between

          px-6
          md:px-8

          py-5

          border-b
          border-slate-200
        ">

          <h2 className="
            text-2xl
            font-black
            text-slate-900
          ">
            {title}
          </h2>

          <button
            onClick={onClose}

            className="
              w-11
              h-11

              rounded-2xl

              bg-slate-100
              hover:bg-slate-200

              transition-all

              text-xl
              font-bold

              text-slate-700
            "
          >
            ✕
          </button>

        </div>

        {/* BODY */}
        <div className="
          p-6
          md:p-8
        ">

          {children}

        </div>

      </div>

    </div>

  );

}

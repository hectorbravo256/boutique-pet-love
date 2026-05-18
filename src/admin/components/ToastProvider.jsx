import {
  createContext,
  useContext,
  useState
} from "react";

const ToastContext =
  createContext();

export function ToastProvider({
  children
}) {

  const [
    toasts,
    setToasts
  ] = useState([]);

  const addToast = (
    type,
    message
  ) => {

    const id =
      Date.now();

    setToasts(prev => [
      ...prev,
      {
        id,
        type,
        message
      }
    ]);

    setTimeout(() => {

      setToasts(prev =>
        prev.filter(
          t => t.id !== id
        )
      );

    }, 3500);

  };

  const toast = {

    success: (msg) =>
      addToast(
        "success",
        msg
      ),

    error: (msg) =>
      addToast(
        "error",
        msg
      ),

    warning: (msg) =>
      addToast(
        "warning",
        msg
      ),

    info: (msg) =>
      addToast(
        "info",
        msg
      )

  };

  return (

    <ToastContext.Provider
      value={toast}
    >

      {children}

      {/* TOASTS */}
      <div className="
        fixed
        top-5
        right-5

        z-[9999]

        flex
        flex-col
        gap-4
      ">

        {toasts.map(t => (

          <div
            key={t.id}

            className={`
              min-w-[320px]
              max-w-[380px]

              rounded-3xl

              px-5
              py-4

              backdrop-blur-xl

              border

              shadow-[0_20px_60px_rgba(15,23,42,0.15)]

              text-white
              font-semibold

              animate-[toastIn_.35s_ease]

              ${
                t.type === "success"
                  ? `
                    bg-emerald-500/90
                    border-emerald-300/40
                  `
                  : t.type === "error"
                  ? `
                    bg-red-500/90
                    border-red-300/40
                  `
                  : t.type === "warning"
                  ? `
                    bg-amber-500/90
                    border-amber-300/40
                  `
                  : `
                    bg-slate-900/90
                    border-white/10
                  `
              }
            `}
          >

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="text-2xl">

                {
                  t.type === "success"
                    ? "✅"

                    : t.type === "error"
                    ? "❌"

                    : t.type === "warning"
                    ? "⚠️"

                    : "ℹ️"
                }

              </div>

              <div className="
                text-sm
                leading-relaxed
              ">
                {t.message}
              </div>

            </div>

          </div>

        ))}

      </div>

    </ToastContext.Provider>

  );

}

export function useToast() {

  return useContext(
    ToastContext
  );

}

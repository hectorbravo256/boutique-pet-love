export default function TopBar() {
  return (
    <header
      className="
        h-16
        bg-white
        border-b
        border-slate-200
        px-8
        flex
        items-center
        justify-between
      "
    >

      <input
        type="text"
        placeholder="Buscar..."
        className="
          w-80
          px-4
          py-2
          rounded-xl
          border
          border-slate-300
        "
      />

      <div className="flex items-center gap-4">

        <button className="text-xl">
          🔔
        </button>

        <div className="flex items-center gap-2">

          <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">

            H

          </div>

          <div>

            <p className="font-semibold">
              Héctor
            </p>

            <p className="text-xs text-slate-500">
              Administrador
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

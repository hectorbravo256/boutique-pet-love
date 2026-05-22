export default function ProductCollections({
  producto,
  setProducto,
  actualizarProducto
}) {

  return (

    <div className="mt-8">

<h3 className="
  text-2xl
  font-black

  text-slate-900

  mb-5
">
    🏷 Colecciones
  </h3>

<div className="
  flex
  flex-wrap

  gap-4
">

    {/* NUEVA COLECCIÓN */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.new_collection

      ? `
        border-emerald-200

        bg-gradient-to-r
        from-emerald-500
        to-teal-500

        text-white

        shadow-[0_10px_30px_rgba(16,185,129,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-emerald-200
        hover:bg-emerald-50
      `
  }
`}>

      <input
        type="checkbox"

        className="
          w-5
          h-5

          accent-white

          cursor-pointer
        "

        checked={
          Boolean(producto.new_collection)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            new_collection: checked
          }));

          await supabase
            .from("products")
            .update({
              new_collection: checked
            })
            .eq("id", producto.id);

        }}
      />

      🆕 Nueva colección

    </label>

    {/* BEST SELLER */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.best_seller

      ? `
        border-blue-200

        bg-gradient-to-r
        from-blue-500
        to-cyan-500

        text-white

        shadow-[0_10px_30px_rgba(59,130,246,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-blue-200
        hover:bg-blue-50
      `
  }
`}>

      <input
        type="checkbox"
        className="
  w-5
  h-5

  accent-white

  cursor-pointer
"

        checked={
          Boolean(producto.best_seller)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            best_seller: checked
          }));

          await supabase
            .from("products")
            .update({
              best_seller: checked
            })
            .eq("id", producto.id);

        }}
      />

      🔥 Best seller

    </label>

    {/* LUXURY */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.luxury

      ? `
        border-amber-200

        bg-gradient-to-r
        from-amber-400
        to-yellow-500

        text-white

        shadow-[0_10px_30px_rgba(245,158,11,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-amber-200
        hover:bg-amber-50
      `
  }
`}>

      <input
        type="checkbox"
        className="
  w-5
  h-5

  accent-white

  cursor-pointer
"

        checked={
          Boolean(producto.luxury)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            luxury: checked
          }));

          await supabase
            .from("products")
            .update({
              luxury: checked
            })
            .eq("id", producto.id);

        }}
      />

      👑 Luxury

    </label>

    {/* EXCLUSIVO */}
<label className={`
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  px-5
  py-4

  cursor-pointer

  font-black

  border

  transition-all
  duration-300

  hover:-translate-y-1

  ${
    producto.exclusive

      ? `
        border-pink-200

        bg-gradient-to-r
        from-pink-500
        to-purple-500

        text-white

        shadow-[0_10px_30px_rgba(236,72,153,0.25)]
      `

      : `
        border-slate-200

        bg-white

        text-slate-700

        hover:border-pink-200
        hover:bg-pink-50
      `
  }
`}>

      <input
        type="checkbox"
        className="
  w-5
  h-5

  accent-white

  cursor-pointer
"
        checked={
          Boolean(producto.exclusive)
        }

        onChange={async (e) => {

          const checked =
            e.target.checked;

          setProducto(prev => ({
            ...prev,
            exclusive: checked
          }));

          await supabase
            .from("products")
            .update({
              exclusive: checked
            })
            .eq("id", producto.id);

        }}
      />

      💎 Exclusivo

    </label>

</div>

</div>

  );

}

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CrearProducto() {

 const [newProduct, setNewProduct] = useState({
  name: "",
  category: "",
  gender: "unisex",
  image: "",
  variants: [{ size: "Talla 1", price: "" }]
});

 const [categories, setCategories] =
  useState([]);

 useEffect(() => {

  cargarCategorias();

}, []);

const cargarCategorias = async () => {

  const { data } =
    await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", {
        ascending: true
      });

  setCategories(data || []);

};

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // 🔥 crear producto completo
  const crearProducto = async () => {

    if (!newProduct.name || newProduct.variants.length === 0) {
      showToast("⚠️ Completa el nombre y al menos una talla");
      return;
    }

    // 1. producto
    const { data: prod, error: errProd } = await supabase
      .from("products")
      .insert([{
  name: newProduct.name,
  category: newProduct.category,
  gender: newProduct.gender,
  active: true
}])
      .select()
      .single();

    if (errProd) {

  console.error(errProd);

  showToast(
    errProd.message ||
    "❌ Error creando producto"
  );

  return;
}

    // 2. variantes
    const variantsToInsert = newProduct.variants
      .filter(v => v.size && v.price)
      .map(v => ({
        product_id: prod.id,
        size: v.size,
        price: parseInt(v.price)
      }));

    if (variantsToInsert.length === 0) {
      showToast("⚠️ Debes ingresar al menos una talla con precio");
      return;
    }

    const { error: errVar } = await supabase
      .from("product_variants")
      .insert(variantsToInsert);

    if (errVar) {

  console.error(errVar);

  showToast(
    errVar.message ||
    "❌ Error creando tallas"
  );

  return;
}

    // 3. imagen
    if (newProduct.image) {
      await supabase
        .from("product_images")
        .insert([{
          product_id: prod.id,
          url: newProduct.image
        }]);
    }

    showToast("✅ Producto creado");

    // 🔄 reset completo
    setNewProduct({
  name: "",
  category: "",
  gender: "unisex",
  image: "",
  variants: [{ size: "Talla 1", price: "" }]
});

    // 🎯 foco automático
    setTimeout(() => {
      document.querySelector('input[placeholder="Nombre"]')?.focus();
    }, 0);
  };

  return (

  <div className="
    max-w-[900px]
    mx-auto
    p-4
    md:p-8
  ">

    <div className="
      bg-white/80
      backdrop-blur-xl

      border
      border-white/60

      rounded-[32px]

      p-6
      md:p-8

      shadow-[0_10px_40px_rgba(0,0,0,0.05)]
    ">

      {/* HEADER */}
      <div className="mb-8">

        <p className="
          text-pink-500
          uppercase
          tracking-[0.3em]
          text-xs
          font-bold
        ">
          Administración
        </p>

        <h1 className="
          text-4xl
          md:text-5xl
          font-black
          text-slate-900
          mt-3
        ">
          ➕ Crear producto
        </h1>

      </div>

      {/* FORM */}
      <div className="
        grid
        gap-5
      ">

        {/* NOMBRE */}
        <input
          placeholder="Nombre"

          value={newProduct.name}

          onChange={(e) =>
            setNewProduct(prev => ({
              ...prev,
              name: e.target.value
            }))
          }

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

        {/* CATEGORÍA */}
        <select
          value={newProduct.category}

          onChange={(e) =>
            setNewProduct(prev => ({
              ...prev,
              category: e.target.value
            }))
          }

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
        >

          <option value="">
            Selecciona categoría
          </option>

          {categories.map(cat => (

            <option
              key={cat.id}
              value={cat.slug}
            >
              {cat.name}
            </option>

          ))}

        </select>

        {/* GÉNERO */}
        <select
          value={newProduct.gender}

          onChange={(e) =>
            setNewProduct(prev => ({
              ...prev,
              gender: e.target.value
            }))
          }

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
        >

          <option value="macho">
            🐶 Macho
          </option>

          <option value="hembra">
            🎀 Hembra
          </option>

          <option value="unisex">
            ✨ Unisex
          </option>

        </select>

        {/* VARIANTES */}
        <div className="
          bg-slate-50
          border
          border-slate-100
          rounded-[28px]
          p-5
        ">

          <div className="
            flex
            items-center
            justify-between
            mb-5
          ">

            <h2 className="
              text-2xl
              font-black
              text-slate-900
            ">
              📏 Tallas
            </h2>

            <button
              onClick={() => {

                const tallas = [];

                for (let i = 0; i <= 12; i++) {

                  tallas.push({
                    size: `Talla ${i}`,
                    price: ""
                  });

                }

                setNewProduct(prev => ({
                  ...prev,
                  variants: tallas
                }));

              }}

              className="
                bg-emerald-500
                hover:bg-emerald-600

                transition-all
                duration-300

                text-white
                text-sm
                font-bold

                px-4
                py-2

                rounded-xl
              "
            >
              ⚡ Generar 0–12
            </button>

          </div>

          <div className="
            grid
            gap-3
          ">

            {newProduct.variants.map((v, index) => (

              <div
                key={index}

                className="
                  grid
                  grid-cols-[1fr_120px_50px]
                  gap-3
                "
              >

                {/* TALLA */}
                <input
                  placeholder="Talla"

                  value={v.size}

                  onChange={(e) => {

                    const updated =
                      [...newProduct.variants];

                    updated[index].size =
                      e.target.value;

                    setNewProduct(prev => ({
                      ...prev,
                      variants: updated
                    }));

                  }}

                  className="
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

                {/* PRECIO */}
                <input
                  type="number"

                  placeholder="Precio"

                  value={v.price}

                  onChange={(e) => {

                    const updated =
                      [...newProduct.variants];

                    updated[index].price =
                      e.target.value;

                    setNewProduct(prev => ({
                      ...prev,
                      variants: updated
                    }));

                  }}

                  className="
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

                {/* ELIMINAR */}
                <button
                  onClick={() => {

                    setNewProduct(prev => ({
                      ...prev,

                      variants:
                        prev.variants.filter(
                          (_, i) =>
                            i !== index
                        )
                    }));

                  }}

                  className="
                    bg-red-500
                    hover:bg-red-600

                    transition-all
                    duration-300

                    rounded-2xl

                    text-white
                    font-bold
                  "
                >
                  ✕
                </button>

              </div>

            ))}

          </div>

          {/* AGREGAR */}
          <button
            onClick={() => {

              setNewProduct(prev => ({
                ...prev,

                variants: [
                  ...prev.variants,
                  {
                    size: "",
                    price: ""
                  }
                ]
              }));

            }}

            className="
              mt-5

              bg-blue-500
              hover:bg-blue-600

              transition-all
              duration-300

              text-white
              font-bold

              px-4
              py-3

              rounded-2xl
            "
          >
            ➕ Agregar talla
          </button>

        </div>

        {/* IMAGEN */}
        <input
          placeholder="URL Imagen (opcional)"

          value={newProduct.image}

          onChange={(e) =>
            setNewProduct(prev => ({
              ...prev,
              image: e.target.value
            }))
          }

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

        {/* PREVIEW */}
        {newProduct.image && (

          <div className="
            flex
            justify-center
          ">

            <img
              src={newProduct.image}

              className="
                w-full
                max-w-[260px]

                aspect-[4/5]
                object-cover

                rounded-[28px]

                shadow-[0_15px_35px_rgba(0,0,0,0.12)]

                transition-all
                duration-500

                hover:scale-[1.02]
              "
            />

          </div>

        )}

        {/* CREAR */}
        <button
          onClick={crearProducto}

          className="
            bg-gradient-to-r
            from-pink-500
            to-purple-500

            hover:opacity-90
            hover:-translate-y-0.5

            transition-all
            duration-300

            text-white
            font-black
            text-lg

            py-4

            rounded-[24px]

            shadow-[0_10px_30px_rgba(236,72,153,0.35)]
          "
        >
          🚀 Crear producto
        </button>

      </div>

    </div>

    {/* TOAST */}
    {toast && (

      <div className="
        fixed
        bottom-5
        right-5

        bg-[#111827]

        text-white
        font-semibold

        px-5
        py-3

        rounded-2xl

        shadow-2xl

        z-[999]
      ">

        {toast}

      </div>

    )}

  </div>

);

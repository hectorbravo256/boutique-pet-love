import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import CategoryInfoCard from "./category-detail/components/CategoryInfoCard";
import CategorySEOCard from "./category-detail/components/CategorySEOCard";
import CategoryImageCard from "./category-detail/components/CategoryImageCard";
import CategoryStats from "./category-detail/components/CategoryStats";

export default function CategoriaDetalle() {

  const { id: slug } = useParams();

  const [category, setCategory] =
    useState(null);

  const [totalProducts, setTotalProducts] =
  useState(0);

  useEffect(() => {

    cargarCategoria();

  }, [slug]);

  const cargarCategoria = async () => {

    const { data } =
      await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    setCategory(data);

    const { count } =
  await supabase
    .from("products")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("category", data.name);

setTotalProducts(count || 0);

  };

  const guardarCategoria = async () => {

  const { error } = await supabase
    .from("categories")
.update({

  name: category.name,

  slug: category.slug,

  image: category.image,

  active: category.active,

  sort_order: category.sort_order,

  seo_title: category.seo_title,

  seo_description:
    category.seo_description,

  seo_text:
    category.seo_text

})
    .eq("id", category.id);

  if (!error) {

    alert("Categoría guardada");

  }

};

const subirImagen = async (file) => {

  if (!file) return;

  const extension =
    file.name.split(".").pop();

  const fileName =
    `${Date.now()}.${extension}`;

  const filePath =
    fileName;

  const { error } =
    await supabase.storage
      .from("categories")
      .upload(
        filePath,
        file,
        {
          upsert: true
        }
      );

  if (error) {

    alert(error.message);
    return;

  }

  const { data } =
    supabase.storage
      .from("categories")
      .getPublicUrl(filePath);

  setCategory({
    ...category,
    image: data.publicUrl
  });

};

  const eliminarImagen = async () => {

  const { error } = await supabase
    .from("categories")
    .update({
      image: null
    })
    .eq("id", category.id);

  if (!error) {

    setCategory({
      ...category,
      image: null
    });

    alert("Imagen eliminada");

  }

};

  if (!category) {

    return (

      <div className="p-8">
        Cargando categoría...
      </div>

    );

  }

  return (

    <>

      <div className="
        sticky
        top-0

        z-50

        mb-6

        border
        border-white/50

        bg-white/80
        backdrop-blur-xl

        px-6
        py-4

        rounded-[24px]

        shadow-[0_10px_40px_rgba(15,23,42,0.08)]
      ">

        <div className="
          flex
          flex-wrap
          items-center
          justify-between

          gap-4
        ">

          {/* izquierda */}
          <div>

            <div className="
              text-xs

              uppercase
              tracking-[0.2em]

              font-black

              text-slate-400
            ">
              CATEGORÍA
            </div>

            <div className="
              text-2xl
              font-black

              text-slate-900
            ">
              {category.name}
            </div>

          </div>

          {/* derecha */}
          <div className="
            flex
            items-center
            gap-3
          ">

            <div className={`
              px-4
              py-2

              rounded-full

              text-sm
              font-black

              ${
                category.active
                  ? `
                    bg-emerald-50
                    text-emerald-600
                  `
                  : `
                    bg-red-50
                    text-red-600
                  `
              }
            `}>

              {category.active
                ? "● Activa"
                : "● Inactiva"}

            </div>

            <a
              href={`/categoria/${category.slug}`}
              target="_blank"
              rel="noreferrer"

              className="
                px-5
                py-3

                rounded-2xl

                bg-gradient-to-r
                from-pink-500
                to-purple-500

                text-white
                font-bold

                shadow-lg

                hover:scale-[1.02]

                transition-all
              "
            >
              👁 Ver categoría
            </a>

          </div>

        </div>

      </div>

<div className="space-y-8">

<CategoryStats
  category={category}
  totalProducts={totalProducts}
/>

    <div className="
    grid
    xl:grid-cols-[1.6fr_1fr]
    gap-8
  ">

<CategoryInfoCard
  category={category}
  setCategory={setCategory}
  guardarCategoria={guardarCategoria}
/>

<CategoryImageCard
  category={category}
  subirImagen={subirImagen}
  eliminarImagen={eliminarImagen}
/>

<CategorySEOCard
  category={category}
  setCategory={setCategory}
/>

</div>
  
</div>
      
    </>

  );

}

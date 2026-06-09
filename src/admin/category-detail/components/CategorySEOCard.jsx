import AdminCard from "../../components/AdminCard";

export default function CategorySEOCard({

  category,
  setCategory

}) {

  return (

    <AdminCard>

      <h2 className="
        text-2xl
        font-black
        text-slate-900
        mb-6
      ">
        SEO de categoría
      </h2>

      <div className="
        grid
        gap-5
      ">

        <input
          type="text"

          placeholder="SEO Title"

          value={
            category.seo_title || ""
          }

          onChange={(e) =>
            setCategory(prev => ({
              ...prev,
              seo_title: e.target.value
            }))
          }

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            px-5
            py-4
          "
        />

        <div className="
  text-xs
  text-slate-500
  text-right
">
  {(category.seo_title || "").length}
  / 60 caracteres
</div>

        <textarea

          rows={3}

          placeholder="SEO Description"

          value={
            category.seo_description || ""
          }

          onChange={(e) =>
            setCategory(prev => ({
              ...prev,
              seo_description:
                e.target.value
            }))
          }

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            px-5
            py-4
          "
        />

        <div className="
  text-xs
  text-slate-500
  text-right
">
  {(category.seo_description || "").length}
  / 160 caracteres
</div>

        <textarea

          rows={8}

          placeholder="Texto SEO"

          value={
            category.seo_text || ""
          }

          onChange={(e) =>
            setCategory(prev => ({
              ...prev,
              seo_text:
                e.target.value
            }))
          }

          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            px-5
            py-4
          "
        />

      </div>

      {/* PREVIEW GOOGLE */}

<div className="
  mt-8

  border
  border-slate-200

  rounded-3xl

  p-6

  bg-slate-50
">

  <div className="
    text-xs
    text-green-700
    mb-2
  ">
    boutiquepetlove.cl/categoria/{category.slug}
  </div>

  <div className="
    text-xl
    text-blue-700

    font-medium

    mb-2
  ">
    {
      category.seo_title ||
      "Título SEO"
    }
  </div>

  <div className="
    text-sm
    text-slate-600
    leading-6
  ">
    {
      category.seo_description ||
      "Descripción SEO"
    }
  </div>

</div>

    </AdminCard>

  );

}

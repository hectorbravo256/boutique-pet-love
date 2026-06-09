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
  md:grid-cols-3
  gap-4
  mb-6
">

  <div className="
    bg-blue-50
    border
    border-blue-100
    rounded-2xl
    p-4
  ">
    <div className="
      text-xs
      uppercase
      tracking-wider
      text-slate-500
      mb-2
    ">
      SEO Title
    </div>

    <div className="
      text-3xl
      font-black
      text-slate-900
    ">
      {(category.seo_title || "").length}
    </div>
  </div>

  <div className="
    bg-purple-50
    border
    border-purple-100
    rounded-2xl
    p-4
  ">
    <div className="
      text-xs
      uppercase
      tracking-wider
      text-slate-500
      mb-2
    ">
      Meta Description
    </div>

    <div className="
      text-3xl
      font-black
      text-slate-900
    ">
      {(category.seo_description || "").length}
    </div>
  </div>

  <div className="
    bg-emerald-50
    border
    border-emerald-100
    rounded-2xl
    p-4
  ">
    <div className="
      text-xs
      uppercase
      tracking-wider
      text-slate-500
      mb-2
    ">
      SEO Score
    </div>

    <div className="
      text-3xl
      font-black
      text-slate-900
    ">
      {
        category.seo_title &&
        category.seo_description &&
        category.seo_text
          ? "100%"
          : "60%"
      }
    </div>
  </div>

</div>

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

  rounded-[24px]

  p-6

  bg-white
shadow-sm
">

<div className="
  text-sm
  text-green-700
  mb-3
">
    boutiquepetlove.cl/categoria/{category.slug}
  </div>

  <div className="
    text-[22px]
    leading-7
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

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

    </AdminCard>

  );

}

import AdminSkeleton
from "./AdminSkeleton";

export default function DashboardSkeleton() {

  return (

    <div className="
      space-y-8
    ">

      {/* HEADER */}
      <AdminSkeleton
        className="
          h-[220px]
          w-full
        "
      />

      {/* STATS */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        {
          Array.from({
            length: 4
          }).map((_, i) => (

            <AdminSkeleton
              key={i}

              className="
                h-[140px]
              "
            />

          ))
        }

      </div>

      {/* CHART */}
      <AdminSkeleton
        className="
          h-[380px]
          w-full
        "
      />

    </div>

  );

}

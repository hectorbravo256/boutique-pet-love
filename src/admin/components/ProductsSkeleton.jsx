import AdminSkeleton
from "./AdminSkeleton";

export default function ProductsSkeleton() {

  return (

    <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-3
      gap-6
    ">

      {
        Array.from({
          length: 6
        }).map((_, i) => (

          <div
            key={i}

            className="
              rounded-[32px]

              bg-white

              p-5

              shadow-sm
            "
          >

            <AdminSkeleton
              className="
                h-[240px]
                w-full
              "
            />

            <AdminSkeleton
              className="
                h-6
                w-2/3
                mt-5
              "
            />

            <AdminSkeleton
              className="
                h-4
                w-1/2
                mt-3
              "
            />

            <AdminSkeleton
              className="
                h-12
                w-full
                mt-6
              "
            />

          </div>

        ))
      }

    </div>

  );

}

import {
  useSortable
} from "@dnd-kit/sortable";

import {
  CSS
} from "@dnd-kit/utilities";

export default function SortableImage({
  img,
  index,
  eliminarImagen
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: img.id
  });

  const style = {
    transform:
      CSS.Transform.toString(transform),

    transition
  };

  return (

<div
  ref={setNodeRef}

  style={style}

  className="
    group
    relative

    overflow-hidden

    rounded-[30px]

    border
    border-slate-100

    bg-white

    shadow-[0_10px_30px_rgba(15,23,42,0.05)]

    hover:-translate-y-1
    hover:shadow-[0_25px_60px_rgba(236,72,153,0.10)]

    transition-all
    duration-300
  "
>

      {/* drag handle */}
<div
  {...attributes}
  {...listeners}

  className="
    absolute

    top-3
    left-3

    z-20

    flex
    items-center
    justify-center

    w-11
    h-11

    rounded-2xl

    bg-white/90
    backdrop-blur-md

    border
    border-white

    shadow-lg

    cursor-grab

    text-slate-700
    font-black

    opacity-0
    group-hover:opacity-100

    transition-all
  "
>
        ⋮⋮
      </div>

      {/* imagen */}
<img
  src={img.url}

  className="
    w-full
    h-[240px]

    object-cover

    transition-all
    duration-500

    group-hover:scale-105
  "
/>

      {/* portada */}
      {index === 0 && (

<div className="
  absolute

  bottom-3
  left-3

  rounded-full

  bg-black/80
  backdrop-blur-md

  px-4
  py-2

  text-xs
  font-black

  text-white

  shadow-lg
">
          Portada
        </div>

      )}

      {/* eliminar */}
      <button
        onClick={() =>
          eliminarImagen(img.id)
        }

className="
  absolute

  top-3
  right-3

  z-20

  flex
  items-center
  justify-center

  w-11
  h-11

  rounded-2xl

  bg-white/90
  backdrop-blur-md

  border
  border-white

  shadow-lg

  text-red-500
  font-black

  opacity-0
  group-hover:opacity-100

  hover:bg-red-500
  hover:text-white

  transition-all
"
      >
        ✕
      </button>

    </div>

  );

}

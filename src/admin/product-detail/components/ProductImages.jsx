import AdminCard from "../../components/AdminCard";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy
} from "@dnd-kit/sortable";

import SortableImage from "./SortableImage";

export default function ProductImages({
  producto,
  subiendoImagen,
  subirImagen,
  handleDragEnd,
  eliminarImagen
}) {

  return (

    <>

      {/* IMÁGENES PREMIUM */}
<AdminCard className="
  mb-6

  border
  border-slate-100

  bg-white/90
  backdrop-blur-xl

  shadow-[0_10px_40px_rgba(15,23,42,0.06)]
">

  {/* título */}
<div className="
  flex
  flex-col
  md:flex-row

  md:items-center
  md:justify-between

  gap-5

  mb-6
">

    <div>

<h2 className="
  text-2xl
  font-black
  text-slate-900
">
        📸 Imágenes
      </h2>

<p className="
  mt-2

  text-slate-500

  leading-relaxed
">
        Gestiona imágenes del producto
      </p>

    </div>

    {/* subir */}
<label className="
  group

  inline-flex
  items-center
  gap-3

  rounded-[22px]

  bg-gradient-to-r
  from-pink-500
  to-purple-500

  px-6
  py-4

  text-sm
  font-black

  text-white

  cursor-pointer

  shadow-[0_12px_30px_rgba(236,72,153,0.28)]

  hover:scale-[1.02]

  transition-all
  duration-300
">

      {subiendoImagen
        ? "Subiendo..."
        : "➕ Subir imagen"}

      <input
        type="file"
        accept="image/*"

        hidden

        onChange={(e) =>
          subirImagen(
            e.target.files?.[0]
          )
        }
      />

    </label>

  </div>

  {/* grid */}
{/* grid drag */}
<DndContext
  collisionDetection={
    closestCenter
  }

  onDragEnd={handleDragEnd}
>

  <SortableContext
    items={
      producto.product_images.map(
        img => img.id
      )
    }

    strategy={
      rectSortingStrategy
    }
  >

<div className="
  grid

  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4

  gap-5
">

      {producto.product_images.map(
        (img, index) => (

          <SortableImage
            key={img.id}

            img={img}

            index={index}

            eliminarImagen={
              eliminarImagen
            }
          />

        )
      )}

  {producto.product_images.length === 0 && (

  <div className="
    col-span-full

    rounded-[32px]

    border-2
    border-dashed
    border-slate-200

    bg-slate-50/70

    p-16

    text-center
  ">

    <div className="
      text-6xl
      mb-5
    ">
      📸
    </div>

    <div className="
      text-xl
      font-black

      text-slate-800
    ">
      Aún no hay imágenes
    </div>

    <p className="
      mt-3

      text-slate-500
    ">
      Sube imágenes premium para mejorar conversión
    </p>

  </div>

)}

    </div>

  </SortableContext>

</DndContext>

</AdminCard>
      
    </>

  );

}

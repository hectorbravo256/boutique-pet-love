import { useParams, Link } from "react-router-dom";
import ProductCollections from "./product-detail/components/ProductCollections";
import ProductVariants from "./product-detail/components/ProductVariants";
import ProductImages from "./product-detail/components/ProductImages";
import ProductSEO from "./product-detail/components/ProductSEO";
import useProductDetail from "./product-detail/hooks/useProductDetail";
import ProductStats from "./product-detail/components/ProductStats";
import ProductDiscounts from "./product-detail/components/ProductDiscounts";
import ProductInfoCard from "./product-detail/components/ProductInfoCard";

export default function ProductoDetalle() {

  const { id } = useParams();

  const {

  producto,
  setProducto,

  categories,

  guardandoInfo,

  estadoGuardado,
  setEstadoGuardado,

  mostrarModal,
  setMostrarModal,

  nuevaTalla,
  setNuevaTalla,

  nuevoPrecio,
  setNuevoPrecio,

  nuevoStock,
  setNuevoStock,

  subiendoImagen,
  setSubiendoImagen,

  cargarProducto,

  actualizarProducto,

  generarSlug,

  actualizarPrecio,
  actualizarStock,

  eliminarVariante,
  agregarVariante,

  subirImagen,
  eliminarImagen,

  handleDragEnd

} = useProductDetail(id);




  if (!producto) {

    return (
      <div style={{ padding: 30 }}>
        Cargando...
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
      PRODUCTO
    </div>

    <div className="
      text-2xl
      font-black

      text-slate-900
    ">
      {producto.name}
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
        producto.active
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

      {producto.active
        ? "● Activo"
        : "● Inactivo"}

    </div>

    <a
      href={`/producto/${producto.slug}`}
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
      👁 Ver producto
    </a>

  </div>

</div>

</div>

<div className="
  p-4
  md:p-8

  min-h-screen

  bg-gradient-to-b
  from-white
  to-pink-50
">

{/* HEADER PREMIUM */}
<div className="mb-8">

  {/* volver */}
<Link
  to="/admin/productos"

  className="
    inline-flex
    items-center
    gap-2

    text-pink-500
    hover:text-pink-600

    font-bold

    transition-all
    duration-200
  "
>
  ← Volver a productos
</Link>

<ProductInfoCard

  producto={producto}

  setProducto={setProducto}

  categories={categories}

  actualizarProducto={actualizarProducto}

  guardandoInfo={guardandoInfo}

/>
  
<ProductSEO
  producto={producto}

  setProducto={setProducto}

  actualizarProducto={actualizarProducto}

  generarSlug={generarSlug}
/>
  
<ProductStats
  producto={producto}
/>

<ProductDiscounts
  producto={producto}

  setProducto={setProducto}

  actualizarProducto={actualizarProducto}
/>

<ProductImages
  producto={producto}

  subiendoImagen={subiendoImagen}

  subirImagen={subirImagen}

  handleDragEnd={handleDragEnd}

  eliminarImagen={eliminarImagen}
/>
      
<ProductVariants
  producto={producto}

  actualizarPrecio={actualizarPrecio}
  actualizarStock={actualizarStock}
  eliminarVariante={eliminarVariante}
  agregarVariante={agregarVariante}

  mostrarModal={mostrarModal}
  setMostrarModal={setMostrarModal}

  nuevaTalla={nuevaTalla}
  setNuevaTalla={setNuevaTalla}

  nuevoPrecio={nuevoPrecio}
  setNuevoPrecio={setNuevoPrecio}

  nuevoStock={nuevoStock}
  setNuevoStock={setNuevoStock}

  setProducto={setProducto}
/>
  
    </div>

  </div>

</>
        
  );

}

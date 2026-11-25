import { useEffect, useState, useRef } from "react";

import {
  useParams,
  Link
} from "react-router-dom";

import NotFound from "./NotFound";
import { supabase } from "./supabaseClient";

import {Helmet} from "react-helmet-async";
import {collections,validCollection,collectionSeo} from "../netlify/lib/collection-html.js";
let initialCollection=null;
if(typeof document!=="undefined"){
 const el=document.getElementById("bpl-collection-seed");
 try{if(el)initialCollection=JSON.parse(el.textContent);}catch{}
 el?.remove();
}
export default function Collection() {

  const { slug } = useParams();


  const [seed]=useState(()=>initialCollection?.category?.slug===slug?initialCollection:null);
  const initialRoute=useRef(seed?.category?.slug??null);
  const [products,setProducts]=useState(()=>seed?.products||[]);
  const [loading,setLoading]=useState(!seed);
  const [loadedSlug,setLoadedSlug]=useState(()=>seed?slug:null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!validCollection(slug))return;
    if(initialRoute.current===slug&&seed){initialCollection=null;return;}
    initialRoute.current=null;
    initialCollection=null;
    let cancelled=false;
    setLoading(true);setFailed(false);
    (async()=>{
      try{
        const field=collections[slug].field;
        const {data,error}=await supabase.from("products").select("id,name,slug,active,"+field+",product_variants(price),product_images(url,sort_order)").eq("active",true).eq(field,true).order("id",{ascending:true});
        if(cancelled)return;
        if(error)throw error;
        for(const p of data||[])p.product_images?.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
        setProducts(data||[]);
      }catch{if(!cancelled)setFailed(true);}
      finally{if(!cancelled){setLoadedSlug(slug);setLoading(false);}}
    })();
    return()=>{cancelled=true;};
  },[slug,seed]);
  if(!validCollection(slug))return <NotFound/>;
  if(failed&&loadedSlug===slug)return <NotFound unavailable/>;
  const seo=collectionSeo(slug,products);
  if (loading || loadedSlug!==slug) {

    return (
      <div style={{ padding: 40 }}>
        Cargando...
      </div>
    );

  }

  return (

    <div className="
  px-4
  md:px-6
  py-8
  overflow-x-hidden
">

      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description}/>
        <link rel="canonical" href={seo.url}/>
        {!products.length&&<meta name="robots" content="noindex, follow"/>}
        <meta property="og:title" content={seo.title}/>
        <meta property="og:description" content={seo.description}/>
        <meta property="og:url" content={seo.url}/>
        <meta property="og:type" content="website"/>
        <meta property="og:image" content="https://boutiquepetlove.cl/logo-google.webp"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={seo.title}/>
        <meta name="twitter:description" content={seo.description}/>
        <meta name="twitter:image" content="https://boutiquepetlove.cl/logo-google.webp"/>
        {[seo.collection,seo.list,seo.breadcrumbs].map(s=><script key={s["@type"]} type="application/ld+json">{JSON.stringify(s)}</script>)}
      </Helmet>
      {/* HEADER */}
      <div className="mb-10">

        <p className="
          text-pink-500
          uppercase
          tracking-[0.3em]
          text-sm
          font-bold
        ">
          Colección
        </p>

        <h1 className="
          text-3xl md:text-5xl
          font-black
          text-gray-900
          mt-3
        ">
          {collections[slug].name}
        </h1>
        <p className="text-gray-700 mt-2">{seo.description}</p>
        {!products.length&&<Link to="/" className="inline-block mt-4 text-pink-600 font-bold">Explorar catálogo</Link>}

      </div>

      {/* GRID */}
<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-4
  md:gap-6
">

        {products.map(product => {

          const precios =
            product.product_variants
              ?.map(v =>
                Number(v.price)
              )
              .filter(v =>
                !isNaN(v)
              ) || [];

          const precio =
            precios.length > 0
              ? Math.min(...precios)
              : 0;

          return (

            <Link
              key={product.id}

              to={`/producto/${product.slug}`}

              className="
                bg-white
                rounded-[22px] md:rounded-[30px]
                overflow-hidden
                shadow-sm
                hover:shadow-2xl
                transition-all
                duration-500
                hover:-translate-y-1
                cursor-pointer
                group
              "
            >

              {/* IMAGEN */}
              <div className="
                relative
                overflow-hidden
              ">

                <img
                  alt={product.name}
                  src={
                    product.product_images?.[0]?.url
                    || "/placeholder.png"
                  }

                  className="
                    w-full
                    aspect-square
                    object-cover
                    transition-all
                    duration-700
                    group-hover:scale-105
                  "
                />

              </div>

              {/* INFO */}
              <div className="p-3 md:p-5">

                <h3 className="
                  font-black
                  text-sm md:text-xl
                  text-gray-900
                  line-clamp-2
                ">
                  {product.name}
                </h3>

                <p className="
                  mt-4
                  text-pink-600
                  font-black
                  text-lg md:text-3xl
                ">
                  Desde $
                  {precio.toLocaleString("es-CL")}
                </p>

              </div>

            </Link>

          );

        })}

      </div>

    </div>

  );

}

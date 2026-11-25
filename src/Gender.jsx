import { useEffect, useState } from "react";

import {
  useParams,
  Link
} from "react-router-dom";

import NotFound from "./NotFound";
import { supabase } from "./supabaseClient";

import { Helmet } from "react-helmet-async";
import { genders, validGender, genderSeo } from "../netlify/lib/gender-html.js";
let initialGender=null;
if(typeof document!=="undefined"){
 const el=document.getElementById("bpl-gender-seed");
 try{if(el)initialGender=JSON.parse(el.textContent);}catch{}
 el?.remove();
}
export default function Gender() {

  const { slug } = useParams();


  const [seed] = useState(()=>initialGender?.category?.slug===slug?initialGender:null);
  const [products, setProducts] = useState(()=>seed?.products||[]);
  const [loadedSlug,setLoadedSlug]=useState(()=>seed?slug:null);
  const [failed,setFailed]=useState(false);

  const [loading, setLoading] =
    useState(!seed);

  useEffect(()=>{
    if(!validGender(slug))return;
    if(seed?.category?.slug===slug&&initialGender===seed)return;
    initialGender=null;
    let cancelled=false;
    setLoading(true);setFailed(false);
    (async()=>{
      try{
        const {data,error}=await supabase.from("products").select("id,name,slug,active,gender,product_variants(price),product_images(url,sort_order)").eq("active",true).eq("gender",slug).order("id",{ascending:true});
        if(cancelled)return;
        if(error)throw error;
        for(const p of data||[])p.product_images?.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
        setProducts(data||[]);
      }catch{if(!cancelled)setFailed(true);}
      finally{if(!cancelled){setLoadedSlug(slug);setLoading(false);}}
    })();
    return()=>{cancelled=true;};
  },[slug,seed]);
  if(!validGender(slug))return <NotFound/>;
  if(failed&&loadedSlug===slug)return <NotFound unavailable/>;
  const seo=genderSeo(slug,products);
  if (loading || loadedSlug!==slug) {

    return (

      <div
        style={{
          padding: 40
        }}
      >
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
      <div
        style={{
          marginBottom: 34
        }}
      >

        <p
          style={{
            color: "#ec4899",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 2,
            fontSize: 13
          }}
        >
          Colección
        </p>

        <h1
          className="md:text-[46px]"
          
          style={{
            marginTop: 10,
            fontSize: 32,
            fontWeight: "900",
            color: "#111827",
            textTransform: "capitalize"
          }}
        >
          {genders[slug]}
        </h1>
        <p className="text-gray-700 mt-2">{seo.description}</p>

      </div>

      {/* GRID */}
<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-4
  gap-3 md:gap-6
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

              style={{
                background: "#fff",

                borderRadius: 22,

                overflow: "hidden",

                cursor: "pointer",

                boxShadow:
                  "0 10px 35px rgba(0,0,0,0.05)",

                transition:
                  "all .3s ease"
              }}

              onMouseEnter={(e) => {

                e.currentTarget.style.transform =
                  "translateY(-4px)";

              }}

              onMouseLeave={(e) => {

                e.currentTarget.style.transform =
                  "translateY(0px)";

              }}
            >

              {/* imagen */}
              <img
                src={
                  product.product_images?.[0]?.url
                  || "/placeholder.png"
                }

                alt={product.name}

                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "cover"
                }}
              />

              {/* info */}
              <div
                style={{
                  padding: 14
                }}
              >

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#111827"
                  }}
                >
                  {product.name}
                </div>

                <div
                  style={{
                    marginTop: 12,

                    fontSize: 18,

                    fontWeight: "900",

                    color: "#ec4899"
                  }}
                >
                  Desde $
                  {precio.toLocaleString("es-CL")}
                </div>

              </div>

            </Link>

          );

        })}

      </div>

    </div>

  );

}

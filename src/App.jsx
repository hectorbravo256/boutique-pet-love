

import { ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Checkout from "./Checkout";
import './index.css';
import Admin from "./Admin";
import Login from "./Login";
import { supabase } from "./supabaseClient";
import Category from "./Category";
import Product from "./Product";
import Layout from "./Layout";
import Success from "./Success";

const WHATSAPP = "https://wa.me/56982700002";


/* ================= PRODUCTOS ================= */


/* ================= APP PRINCIPAL ================= */

function AppContent() {
  const navigate = useNavigate();

const increaseQty = (index) => {
  const updated = [...cart];
  updated[index].qty = (updated[index].qty || 1) + 1;

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const decreaseQty = (index) => {
  const updated = [...cart];

  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};


  const [selectedSizes, setSelectedSizes] = useState({});
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockDB, setStockDB] = useState([]);
  const [formData, setFormData] = useState({
  nombre: "",
  rut: "",
  direccion: "",
  comuna: "",
  region: "",
  correo: "",
  telefono: "",
  observacion: "",
});
  const [currentIndex, setCurrentIndex] = useState({});
  const touchStartRef = useRef({});
  const [zoomGallery, setZoomGallery] = useState(null);

const stockMap = useMemo(() =>
  Object.fromEntries(
    stockDB.map(s => [`${s.product_id}-${s.size}`, s.stock])
  ),
[stockDB]);

  const zoomTouchStart = useRef(0);
  const handleTouchStart = (e, productId) => {
   touchStartRef.current[productId] = e.touches[0].clientX;
};
  const handleTouchEnd = (e, product) => {
  const start = touchStartRef.current[product.id];
  if (!start) return;
  const end = e.changedTouches[0].clientX;
  const diff = start - end;
if (Math.abs(diff) > 50 && product.product_images?.length > 0) {
  setCurrentIndex((prev) => {
    const current = prev[product.id] || 0;
    const images = product.product_images?.map(i => i.url) || [];

if (images.length === 0) return prev;

const next =
  diff > 0
    ? (current + 1) % images.length
    : (current - 1 + images.length) % images.length;

    return { ...prev, [product.id]: next };
  });
}

  delete touchStartRef.current[product.id];
};
 
/* ===== CARRITO LOCAL ===== */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // 🧩 CARGAR PRODUCTOS
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("products")
        .select(`
          *,
          product_variants (*),
          product_images (*)
        `)
        .eq("active", true);

      setProducts(data || []);
    };

    cargar();
  }, []);

	useEffect(() => {
  supabase
    .from("categories")
    .select("*")
    .then(({ data }) => setCategories(data || []));
}, []);

// 🧩 CARGAR STOCK
useEffect(() => {
  const cargarStock = async () => {
    const { data } = await supabase
      .from("product_stock")
      .select("*");

    setStockDB(data || []);
  };

  cargarStock();
}, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  	}, [cart]);


  useEffect(() => {
  	document.body.style.overflow = zoomGallery ? "hidden" : "auto";
	}, [zoomGallery]);

	const AUTO_SLIDE = false; // 🔥 cambiar a true cuando quieras activarlo

  useEffect(() => {
  if (!AUTO_SLIDE) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => {
      const updated = { ...prev };

      products.forEach((product) => {
        if (product.product_images?.length > 0) {
  	  const current = prev[product.id] || 0;

  	  updated[product.id] =
    	     current === product.product_images.length - 1 ? 0 : current + 1;
	}
      });

      return updated;
    });
  }, 3000);

  return () => clearInterval(interval);
}, [products]);


 /* ===== FUNCIONES ===== */
// 🧩 FORMATEAR PRECIO
  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);

    // 🧩 AGREGAR AL CARRITO
  const addToCart = (product) => {

    const size = selectedSizes[product.id];

    if (!size) {
      window.dispatchEvent(
  new CustomEvent("toast", {
    detail: "Selecciona una talla"
  })
);
      return;
    }
 const variant = product.product_variants.find(
      (v) => v.size === size
    );

if (!variant) {
  alert("Error seleccionando producto");
  return;
}

const stock = stockMap[`${product.id}-${size}`] || 0;



if (stock === 0) {
  alert("⚠️ Producto sin stock disponible");
  return;
}

    const item = {
      id: product.id,
      name: product.name,
      size,
      price: variant?.price || 0,
      qty: 1,
      image:
  (product.product_images?.[0]?.url
    ? product.product_images[0].url + "?width=400&quality=70"
    : "/placeholder.png"),
    };

    setCart((prev) => {
  const existingIndex = prev.findIndex(
    (i) => i.id === item.id && i.size === item.size
  );

  if (existingIndex !== -1) {
    const updated = [...prev];
    updated[existingIndex].qty += 1;
    return updated;
  }

  return [...prev, item];
});
  };

const removeItem = (i) => {
  const updated = cart.filter((_, idx) => idx !== i);

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

  const total = cart.reduce(
  (acc, i) => acc + i.price * (i.qty || 1),
  0
);

  const regionesConEnvio = [
  	"Región Metropolitana de Santiago",
  	"Región de Valparaíso",
  	"Región del Libertador General Bernardo O'Higgins",
];

  const aplicaEnvio =
  	cart.length > 0 && regionesConEnvio.includes(formData.region);

  const mensajeEnvio = formData.region
  	? regionesConEnvio.includes(formData.region)
    	? "Envío $3.500 por PAKET"
    	: "Envío por pagar (Starken / Blue Express)"
  	: "Selecciona tu región para calcular envío";

  const shipping = aplicaEnvio ? 3500 : 0;

  const totalFinal = total + shipping;

  const handleMercadoPago = async () => {
	  
  	// ✅ VALIDACIÓN FORMULARIO


  try {
  const res = await fetch("/.netlify/functions/create-preference", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
 body: JSON.stringify({
  items: cart,
  formData,
}),
});

    const data = await res.json();

localStorage.setItem(
  "lastOrder",
  JSON.stringify({
    cart,
    formData,
    total: totalFinal,
    date: new Date().toISOString(),
  })
);

    window.location.href = data.init_point;
  } catch (error) {
    alert("Error al iniciar pago");
  }
};

/* ================= UI ================= */
  return (
         <div className="bg-pink-50 min-h-screen">
    
      


      {/* HERO */}
      <section className="p-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-sm flex items-center gap-2 w-fit">
 	   🐾 Boutique Pet Love
	   </span>

          <h2 className="text-6xl md:text-7xl font-extrabold mt-4 leading-tight text-gray-900">
 	 Viste a tu mascota con{" "}
  	<span className="text-pink-600">amor</span> y estilo
	</h2>

          <p className="mt-4 text-gray-500 text-lg">
            Tienda online profesional para ropa y accesorios de mascotas.
          </p>

          <div className="flex gap-3 mt-6">
            <a
              href="#catalogo"
              className="bg-pink-600 text-white px-6 py-3 rounded-xl"
            >
              Comprar ahora
            </a>

           <a
 	 href="https://instagram.com/boutique_petlove"
 	 target="_blank"
  	 className="bg-white text-purple-600 border border-purple-200 px-6 py-3 rounded-xl font-semibold hover:shadow-md transition"
	>
 	 Ver Instagram
	</a>
          </div>
        </div>

        <img
  src="/logo.png"
  loading="eager"
  className="w-96 mx-auto rounded-2xl shadow-xl"
/>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Tienda online</h2>
            <p className="text-gray-500 text-sm">
              Versión estable para Netlify.
            </p>
          </div>

          <a
            href={WHATSAPP}
            target="_blank"
            className="bg-purple-600 text-white px-5 py-2 rounded-xl"
          >
            Pedir catálogo completo
          </a>
        </div>

<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20
}}>
  {categories.map(cat => (
    <div
      key={cat.id}
      onClick={() => navigate(`/categoria/${cat.slug}`)}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}
    >
      <img
  src={`${cat.image}?width=600&quality=70`}
  loading="lazy"
  onLoad={(e) => e.target.classList.remove("opacity-0")}
  className="opacity-0 transition-opacity duration-500"
  style={{
    width: "100%",
    height: 200,
    objectFit: "cover"
  }}
/>

      <div style={{
        padding: 10,
        textAlign: "center",
        fontWeight: "bold"
      }}>
        {cat.name}
      </div>
    </div>
  ))}
</div>
</section>



{/* 🔍 ZOOM IMAGEN */}
{zoomGallery && (
  <div
  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"

  onTouchStart={(e) => {
    zoomTouchStart.current = e.touches[0].clientX;
  }}

  onTouchEnd={(e) => {
    const end = e.changedTouches[0].clientX;
    const diff = zoomTouchStart.current - end;

    if (Math.abs(diff) > 50) {
      setZoomGallery((prev) => ({
        ...prev,
        index:
          diff > 0
            ? (prev.index + 1) % prev.images.length
            : (prev.index - 1 + prev.images.length) % prev.images.length,
      }));
    }
  }}
>

 {/* FONDO CLIC PARA CERRAR */}
<div
  className="absolute inset-0 z-40"
  onClick={() => setZoomGallery(null)}
/>

<button
  onClick={() => setZoomGallery(null)}
  className="absolute top-5 right-5 text-white text-3xl z-50"
>
  ✕
</button>

<img
  src={`${zoomGallery.images[zoomGallery.index]}?width=1200&quality=80`}
  className="max-w-[90%] max-h-[90%] rounded-xl z-50 transition-opacity duration-300 opacity-0"
  onLoad={(e) => e.target.classList.remove("opacity-0")}
  onClick={(e) => e.stopPropagation()}
/>

<button
  onClick={() =>
    setZoomGallery((prev) => ({
      ...prev,
      index:
        prev.index === 0
          ? prev.images.length - 1
          : prev.index - 1,
    }))
  }
  className="absolute left-5 text-white text-3xl z-50 bg-black/40 px-3 py-1 rounded-full"
>
  ◀
</button>

<button
  onClick={() =>
    setZoomGallery((prev) => ({
      ...prev,
      index:
        prev.index === prev.images.length - 1
          ? 0
          : prev.index + 1,
    }))
  }
  className="absolute right-5 text-white text-3xl z-50 bg-black/40 px-3 py-1 rounded-full"
>
  ▶
</button>

  </div>
)}


      </div>
  );
}


/* ================= CHECKOUT WRAPPER ================= */
function CheckoutWrapper() {
  const [cart, setCart] = useState(() => {
  const stored = localStorage.getItem("cart");
  return stored ? JSON.parse(stored) : [];
});

  const [formData, setFormData] = useState({
  nombre: "",
  rut: "",
  direccion: "",
  comuna: "",
  region: "",
  correo: "",
  telefono: "",
  observacion: "",
});

// 🔥 CALCULAR TOTALES (MOVER AQUÍ)
const total = cart.reduce(
  (acc, i) => acc + i.price * (i.qty || 1),
  0
);

const regionesConEnvio = [
  "Región Metropolitana de Santiago",
  "Región de Valparaíso",
  "Región del Libertador General Bernardo O'Higgins",
];

const aplicaEnvio =
  cart.length > 0 && regionesConEnvio.includes(formData.region);

const shipping = aplicaEnvio ? 3500 : 0;

const totalFinal = total + shipping;

const handleMercadoPago = async () => {

  /* ✅ VALIDACIÓN FORMULARIO */

  if (!formData.nombre.trim()) {
    alert("Ingresa tu nombre");
    return;
  }

  if (!formData.rut.trim()) {
    alert("Ingresa tu RUT");
    return;
  }

  if (!formData.direccion.trim()) {
    alert("Ingresa tu dirección");
    return;
  }

  if (!formData.comuna.trim()) {
    alert("Ingresa tu comuna");
    return;
  }

  if (!formData.region) {
    alert("Selecciona una región");
    return;
  }

if (!formData.correo.includes("@")) {
  alert("Correo inválido");
  return;
}

if (!formData.telefono || formData.telefono.length < 8) {
  alert("Teléfono inválido");
  return;
}

/* 🛒 VALIDACIÓN CARRITO */

  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

 /* 💳 PAGO */

  try {
    const res = await fetch("/.netlify/functions/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart,
        formData,
      }),
    });

    const data = await res.json();

// 🔥 GUARDAR PEDIDO (CLAVE)
localStorage.setItem(
  "lastOrder",
  JSON.stringify({
    cart,
    formData,
    total: totalFinal,
    date: new Date().toISOString(),
  })
);

    window.location.href = data.init_point;
  } catch (error) {
    alert("Error al iniciar pago");
  }
};

const increaseQty = (index) => {
  const updated = [...cart];
  updated[index].qty = (updated[index].qty || 1) + 1;

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const decreaseQty = (index) => {
  const updated = [...cart];

  if ((updated[index].qty || 1) > 1) {
    updated[index].qty -= 1;
  }

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

const removeItem = (index) => {
  const updated = cart.filter((_, i) => i !== index);

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));

  // 🔥 sincroniza con layout / carrito flotante
  window.dispatchEvent(new Event("storage"));
};

const formatPrice = (p) =>
  p ? "$" + p.toLocaleString("es-CL") : "";


	useEffect(() => {
  const updateCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  window.addEventListener("storage", updateCart);

  return () => window.removeEventListener("storage", updateCart);
}, []);


return (
  <Checkout
  cart={cart}
  total={total}
  shipping={shipping}
  totalFinal={totalFinal}
  formData={formData}
  setFormData={setFormData}
  handleMercadoPago={handleMercadoPago}
  aplicaEnvio={aplicaEnvio}

  /* 🔥 NUEVO */
  increaseQty={increaseQty}
  decreaseQty={decreaseQty}
  removeItem={removeItem}
  formatPrice={formatPrice}
/>
  );
}


function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // 🔥 ESCUCHAR CAMBIOS DE LOGIN (CLAVE)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <p>Cargando...</p>;

  if (!session) return <Login />;

const allowedEmail = "hectorbravov@hotmail.es";

if (session?.user?.email !== allowedEmail) {
  return <p style={{ padding: 40 }}>⛔ No tienes acceso</p>;
}

return children;
}

/* ================= ROUTER ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 RUTAS CON HEADER */}
        <Route element={<Layout />}>

          <Route path="/" element={<AppContent />} />
          <Route path="/checkout" element={<CheckoutWrapper />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/producto/:id" element={<Product />} />
          <Route path="/success" element={<Success />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* 🔐 RUTAS SIN HEADER */}
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

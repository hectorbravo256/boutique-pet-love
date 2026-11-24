import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
export default function NotFound({ unavailable = false }) {
 return <main className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
 <Helmet><title>{unavailable ? "Temporalmente no disponible" : "Página no encontrada"} | Boutique Pet Love</title><meta name="robots" content="noindex, follow" /></Helmet>
 <h1 className="text-3xl font-black text-pink-600">{unavailable ? "Temporalmente no disponible" : "Página no encontrada"}</h1>
 <p>{unavailable ? "Intenta nuevamente en unos minutos." : "La página que buscas no existe o ya no está disponible."}</p>
 <Link to="/" className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold">Volver al inicio</Link>
 </main>;
}

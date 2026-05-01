import { useParams } from "react-router-dom";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq("id", id)
      .single()
      .then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <p>Cargando...</p>;

  return (
    <div>

      <img src={product.product_images?.[0]?.url} />

      <h1>{product.name}</h1>

      {/* TALLAS */}
      <select>
        {product.product_variants.map(v => (
          <option key={v.id}>
            {v.size} - ${v.price}
          </option>
        ))}
      </select>

      {/* BOTONES */}
      <button>🛒 Agregar al carrito</button>
      <button>⚡ Comprar ahora</button>

      {/* WHATSAPP */}
      <a
        href={`https://wa.me/569XXXXXXXX?text=Hola quiero ${product.name}`}
        target="_blank"
      >
        💬 Consultar por WhatsApp
      </a>

    </div>
  );
}

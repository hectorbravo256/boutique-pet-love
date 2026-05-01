import { useParams } from "react-router-dom";

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("category", slug)
      .then(({ data }) => setProducts(data || []));
  }, [slug]);

  return (
    <div>
      <h2>Categoría</h2>

      <div style={{ display: "grid", gap: 20 }}>
        {products.map(p => (
          <div
            key={p.id}
            onClick={() => navigate(`/producto/${p.id}`)}
          >
            <p>{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

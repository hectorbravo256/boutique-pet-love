import { Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div>

      {/* 🔝 HEADER GLOBAL */}
      <div style={{
        background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
        color: "#fff",
        padding: "6px 20px",
        fontSize: 13,
        textAlign: "center"
      }}>
        🚚 Envíos a todo Chile | RM, V y VI: $3.500
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 30px",
        borderBottom: "1px solid #eee"
      }}>

        {/* LOGO */}
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <h2 style={{ margin: 0 }}>BOUTIQUE PET LOVE</h2>
          <small>Moda y accesorios para mascotas</small>
        </div>

        {/* MENÚ */}
        <div style={{ display: "flex", gap: 20 }}>
          <span onClick={() => navigate("/")}>Inicio</span>
          <span onClick={() => navigate("/")}>Tienda</span>
          <span>Contacto</span>
        </div>

        {/* CARRITO */}
        <div>
          🛒 Carrito
        </div>

      </div>

      {/* 🔽 AQUÍ CAMBIAN LAS PÁGINAS */}
      <div style={{ padding: 20 }}>
        <Outlet />
      </div>

    </div>
  );
}

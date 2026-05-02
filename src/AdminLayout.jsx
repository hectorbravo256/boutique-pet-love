import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();

  const linkStyle = (path) => ({
    padding: "10px 14px",
    borderRadius: 8,
    textDecoration: "none",
    color: location.pathname === path ? "#fff" : "#ddd",
    background: location.pathname === path ? "#ec4899" : "transparent",
    fontWeight: "600"
  });

  return (
    <div style={{ display: "flex" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 240,
        height: "100vh",
        background: "#111",
        padding: 20,
        position: "fixed"
      }}>
        <h2 style={{ color: "#fff" }}>⚙️ Admin</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link to="/admin" style={linkStyle("/admin")}>📊 Dashboard</Link>
          <Link to="/admin/stock" style={linkStyle("/admin/stock")}>📦 Stock</Link>
          <Link to="/admin/productos" style={linkStyle("/admin/productos")}>🛒 Productos</Link>
          <Link to="/admin/crear" style={linkStyle("/admin/crear")}>➕ Crear</Link>
          <Link to="/admin/ventas" style={linkStyle("/admin/ventas")}>💰 Ventas</Link>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ marginLeft: 260, width: "100%", padding: 30 }}>
        <Outlet />
      </div>
    </div>
  );
}

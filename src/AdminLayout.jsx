import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 230,
        height: "100vh",
        background: "#111",
        color: "#fff",
        padding: 20,
        position: "fixed"
      }}>
        <h2 style={{ marginBottom: 20 }}>⚙️ Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/admin">📊 Dashboard</Link>
          <Link to="/admin/stock">📦 Stock</Link>
          <Link to="/admin/productos">🛒 Productos</Link>
          <Link to="/admin/crear">➕ Crear</Link>
          <Link to="/admin/ventas">💰 Ventas</Link>
        </nav>
      </div>

      {/* CONTENIDO */}
      <div style={{
        marginLeft: 250,
        width: "100%",
        padding: 30
      }}>
        <Outlet />
      </div>

    </div>
  );
}

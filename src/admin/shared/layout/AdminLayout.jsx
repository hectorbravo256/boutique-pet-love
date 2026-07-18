import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Content from "./Content";

export default function AdminLayout({
  children,
}) {
  return (
    <div className="flex h-screen bg-slate-100">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <TopBar />

        <Content>

          {children}

        </Content>

      </div>

    </div>
  );
}

export default function Content({ children }) {
  return (
    <main className="flex-1 overflow-y-auto p-8 bg-slate-50 min-h-screen">
      {children}
    </main>
  );
}

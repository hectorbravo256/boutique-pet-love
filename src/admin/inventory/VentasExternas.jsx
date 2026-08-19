import React from "react";

export default function VentasExternas() {
  return (
    <div className="min-h-screen bg-[#fff8fc] p-6">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-white shadow-lg">
          <div className="text-xs font-bold tracking-[0.35em] uppercase opacity-90">
            Boutique Pet Love ERP
          </div>

          <h1 className="mt-2 text-4xl font-black">
            💰 Ventas externas
          </h1>

          <p className="mt-2 text-white/90">
            Registra ventas presenciales y ventas realizadas por WhatsApp.
          </p>
        </div>

        {/* CONTENIDO */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-black text-slate-900">
            Nueva venta
          </h2>

          <p className="mt-1 text-slate-500">
            Selecciona el tipo de venta y agrega los productos vendidos.
          </p>

        </div>

      </div>
    </div>
  );
}

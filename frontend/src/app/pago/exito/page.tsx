import { Suspense } from "react";
import PagoExitoPageClient from "./PagoExitoPageClient";

export default function PagoExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--yass-cream)]">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </div>
      }
    >
      <PagoExitoPageClient />
    </Suspense>
  );
}

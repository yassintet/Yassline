import { Suspense } from "react";
import TransportePageClient from "./TransportePageClient";

export default function TransportePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--yass-cream)]">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </div>
      }
    >
      <TransportePageClient />
    </Suspense>
  );
}

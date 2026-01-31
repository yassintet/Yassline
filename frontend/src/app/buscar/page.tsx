import { Suspense } from "react";
import BuscarPageClient from "./BuscarPageClient";

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--yass-cream)]">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </div>
      }
    >
      <BuscarPageClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import BinancePaymentClient from "./BinancePaymentClient";

export function generateStaticParams() {
  return [{ bookingId: "placeholder" }];
}

export default function BinancePaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <BinancePaymentClient />
    </Suspense>
  );
}

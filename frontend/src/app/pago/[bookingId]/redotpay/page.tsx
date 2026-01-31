import { Suspense } from "react";
import RedotpayPaymentClient from "./RedotpayPaymentClient";

export function generateStaticParams() {
  return [{ bookingId: "placeholder" }];
}

export default function RedotpayPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <RedotpayPaymentClient />
    </Suspense>
  );
}

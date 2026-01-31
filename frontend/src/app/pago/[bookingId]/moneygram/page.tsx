import { Suspense } from "react";
import MoneyGramPaymentClient from "@/app/pago/[bookingId]/moneygram/MoneyGramPaymentClient";

export function generateStaticParams() {
  return [{ bookingId: "placeholder" }];
}

export default function MoneyGramPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <MoneyGramPaymentClient />
    </Suspense>
  );
}

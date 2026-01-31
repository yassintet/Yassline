import { Suspense } from "react";
import BankTransferPaymentClient from "./BankTransferPaymentClient";

export function generateStaticParams() {
  return [{ bookingId: "placeholder" }];
}

export default function BankTransferPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <BankTransferPaymentClient />
    </Suspense>
  );
}

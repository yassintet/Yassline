// Un placeholder para que el static export genere al menos una ruta.
// En producción (Hostinger, etc.), configurar reescritura: /pago/* -> /pago/placeholder
// para que todas las URLs de pago sirvan el mismo HTML; useParams() seguirá leyendo el ID real de la URL.
export function generateStaticParams() {
  return [{ bookingId: "placeholder" }];
}

export default function PagoBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

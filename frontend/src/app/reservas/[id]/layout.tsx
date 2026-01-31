// Placeholder para static export; en producción configurar reescritura /reservas/* -> /reservas/placeholder
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function ReservaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

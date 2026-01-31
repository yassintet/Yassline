export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function VehiculoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

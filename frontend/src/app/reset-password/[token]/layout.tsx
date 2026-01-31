export function generateStaticParams() {
  return [{ token: "placeholder" }];
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

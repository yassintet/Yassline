import { ReactNode } from 'react';

export async function generateStaticParams() {
  // Retornar al menos un parámetro placeholder (requerido por Next.js 16)
  return [{ id: '__placeholder__' }];
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

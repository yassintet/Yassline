// Componente Link personalizado que deshabilita prefetch por defecto
// Esto evita errores 403 en peticiones HEAD en Hostinger
import NextLink, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

interface CustomLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  [key: string]: any;
}

export default function Link({ prefetch = false, ...props }: CustomLinkProps) {
  return <NextLink prefetch={prefetch} {...props} />;
}

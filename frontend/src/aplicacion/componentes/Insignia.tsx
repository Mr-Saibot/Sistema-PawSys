import type { HTMLAttributes, ReactNode } from 'react';

type TonoInsignia = 'neutro' | 'primario' | 'verde' | 'exito' | 'error';

interface PropiedadesInsignia extends HTMLAttributes<HTMLSpanElement> {
  tono?: TonoInsignia;
  children: ReactNode;
}

const clasesPorTono: Record<TonoInsignia, string> = {
  neutro: 'bg-fondo text-texto-suave',
  primario: 'bg-primario-suave text-primario-oscuro',
  verde: 'bg-verde-profundo/10 text-verde-profundo',
  exito: 'bg-exito/10 text-exito',
  error: 'bg-error/10 text-error',
};

export function Insignia({
  tono = 'neutro',
  children,
  className = '',
  ...propiedades
}: PropiedadesInsignia) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1
        text-xs font-medium ${clasesPorTono[tono]} ${className}`}
      {...propiedades}
    >
      {children}
    </span>
  );
}

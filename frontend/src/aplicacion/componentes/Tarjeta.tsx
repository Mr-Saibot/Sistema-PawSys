import type { HTMLAttributes, ReactNode } from 'react';

interface PropiedadesTarjeta extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Tarjeta({
  children,
  className = '',
  ...propiedades
}: PropiedadesTarjeta) {
  return (
    <section
      className={`rounded-tarjeta border border-borde bg-superficie
        shadow-sutil ${className}`}
      {...propiedades}
    >
      {children}
    </section>
  );
}

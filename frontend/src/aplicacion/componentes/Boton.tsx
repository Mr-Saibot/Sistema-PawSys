import type { ButtonHTMLAttributes, ReactNode } from 'react';

type VarianteBoton = 'principal' | 'secundario' | 'sutil';

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  icono?: ReactNode;
}

const clasesPorVariante: Record<VarianteBoton, string> = {
  principal: 'bg-primario text-white hover:bg-primario-oscuro',
  secundario:
    'border border-borde bg-superficie text-texto hover:bg-fondo',
  sutil: 'text-texto-suave hover:bg-primario-suave hover:text-primario-oscuro',
};

export function Boton({
  children,
  variante = 'principal',
  icono,
  className = '',
  ...propiedades
}: PropiedadesBoton) {
  const clasesBase =
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-control';

  return (
    <button
      className={`${clasesBase} px-4 text-sm font-medium transition-colors
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-primario
        disabled:cursor-not-allowed disabled:opacity-50
        ${clasesPorVariante[variante]} ${className}`}
      {...propiedades}
    >
      {icono}
      {children}
    </button>
  );
}

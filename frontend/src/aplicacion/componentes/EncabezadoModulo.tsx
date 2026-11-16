import type { ReactNode } from 'react';

interface PropiedadesEncabezadoModulo {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

export function EncabezadoModulo({
  titulo,
  descripcion,
  accion,
}: PropiedadesEncabezadoModulo) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-texto">
          {titulo}
        </h1>
        <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>
      </div>
      {accion}
    </header>
  );
}

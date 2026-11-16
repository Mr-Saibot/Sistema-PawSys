import type { ReactNode } from 'react';

interface PropiedadesEstadoVacio {
  titulo: string;
  descripcion: string;
  icono?: ReactNode;
  accion?: ReactNode;
}

export function EstadoVacio({
  titulo,
  descripcion,
  icono,
  accion,
}: PropiedadesEstadoVacio) {
  return (
    <div className="grid justify-items-center gap-3 px-5 py-12 text-center">
      {icono && (
        <div
          className="grid h-12 w-12 place-items-center rounded-full
            bg-fondo text-verde-profundo"
          aria-hidden="true"
        >
          {icono}
        </div>
      )}
      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-texto">{titulo}</h3>
        <p className="mt-1 text-sm leading-6 text-texto-suave">
          {descripcion}
        </p>
      </div>
      {accion}
    </div>
  );
}

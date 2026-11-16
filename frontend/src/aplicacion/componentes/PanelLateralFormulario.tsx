import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface PropiedadesPanelLateralFormulario {
  titulo: string;
  descripcion?: string;
  alCerrar: () => void;
  children: ReactNode;
}

export function PanelLateralFormulario({
  titulo,
  descripcion,
  alCerrar,
  children,
}: PropiedadesPanelLateralFormulario) {
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-texto/25"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          alCerrar();
        }
      }}
    >
      <section
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto
          border-l border-borde bg-superficie shadow-sutil"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-panel-lateral"
      >
        <header className="flex items-start justify-between gap-4 border-b
          border-borde px-5 py-5 sm:px-7">
          <div>
            <h2
              className="text-xl font-semibold text-texto"
              id="titulo-panel-lateral"
            >
              {titulo}
            </h2>
            {descripcion && (
              <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>
            )}
          </div>
          <button
            className="rounded-control p-2 text-texto-suave hover:bg-fondo"
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar panel"
          >
            <X size={19} />
          </button>
        </header>
        <div className="flex-1 px-5 py-6 sm:px-7">{children}</div>
      </section>
    </div>
  );
}

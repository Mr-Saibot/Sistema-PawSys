import type { ReactNode } from 'react';
import { CabeceraPanelLateral } from './CabeceraPanelLateral';
import { FondoPanel } from './FondoPanel';
import { useCerrarConEscape } from '../hooks/useCerrarConEscape';

interface PropiedadesPanelLateral {
  abierto: boolean;
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
}

export function PanelLateral({
  abierto,
  titulo,
  alCerrar,
  children,
}: PropiedadesPanelLateral) {
  useCerrarConEscape(abierto, alCerrar);

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <FondoPanel alCerrar={alCerrar} />
      <section
        className="relative flex h-full w-full max-w-xl flex-col
          border-l border-borde bg-superficie shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-panel-lateral"
      >
        <CabeceraPanelLateral titulo={titulo} alCerrar={alCerrar} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </section>
    </div>
  );
}

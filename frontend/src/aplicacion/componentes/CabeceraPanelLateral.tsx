import { X } from 'lucide-react';
import { Boton } from './Boton';

interface PropiedadesCabeceraPanel {
  titulo: string;
  alCerrar: () => void;
}

export function CabeceraPanelLateral({
  titulo,
  alCerrar,
}: PropiedadesCabeceraPanel) {
  return (
    <header className="flex items-center justify-between border-b
      border-borde px-6 py-5">
      <h2
        id="titulo-panel-lateral"
        className="text-xl font-semibold text-texto"
      >
        {titulo}
      </h2>
      <Boton
        variante="sutil"
        className="px-2"
        aria-label="Cerrar"
        onClick={alCerrar}
      >
        <X size={18} aria-hidden="true" />
      </Boton>
    </header>
  );
}

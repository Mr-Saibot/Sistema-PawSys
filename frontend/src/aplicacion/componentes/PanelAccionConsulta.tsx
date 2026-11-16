import { ContenidoPanelConsulta } from './ContenidoPanelConsulta';
import { PanelLateral } from './PanelLateral';

interface PropiedadesPanelAccionConsulta {
  abierto: boolean;
  alCerrar: () => void;
}

export function PanelAccionConsulta({
  abierto,
  alCerrar,
}: PropiedadesPanelAccionConsulta) {
  return (
    <PanelLateral
      abierto={abierto}
      titulo="Nueva consulta"
      alCerrar={alCerrar}
    >
      <ContenidoPanelConsulta />
    </PanelLateral>
  );
}

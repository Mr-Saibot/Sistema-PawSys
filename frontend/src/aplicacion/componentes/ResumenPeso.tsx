import { Weight } from 'lucide-react';
import { AvisoEvolucionPeso } from './AvisoEvolucionPeso';
import { Tarjeta } from './Tarjeta';

interface PropiedadesResumenPeso {
  peso: number | null;
}

export function ResumenPeso({ peso }: PropiedadesResumenPeso) {
  const etiquetaPeso = peso ? `${peso} kg` : 'Sin dato';

  return (
    <Tarjeta className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-texto">
            Evolución del peso
          </p>
          <p className="mt-1 text-xs text-texto-suave">
            Último registro disponible
          </p>
        </div>
        <span className="rounded-control bg-primario-suave p-2
          text-primario-oscuro">
          <Weight size={17} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold text-verde-profundo">
        {etiquetaPeso}
      </p>
      <AvisoEvolucionPeso />
    </Tarjeta>
  );
}

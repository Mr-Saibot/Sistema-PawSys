import { CalendarDays } from 'lucide-react';
import { formatearFecha } from '../utilidades/fechas';

interface PropiedadesFechaVacuna {
  etiqueta: string;
  fecha: string;
}

export function FechaVacuna({
  etiqueta,
  fecha,
}: PropiedadesFechaVacuna) {
  return (
    <span className="inline-flex items-center gap-2">
      <CalendarDays size={15} aria-hidden="true" />
      {etiqueta}: {formatearFecha(fecha)}
    </span>
  );
}

import { CalendarDays } from 'lucide-react';
import { EstadoVacio } from './EstadoVacio';
import { EventoLineaTiempo } from './EventoLineaTiempo';
import type { EventoClinico } from '../tipos/evento-clinico';

interface PropiedadesLineaTiempo {
  eventos: EventoClinico[];
}

export function LineaTiempoClinica({ eventos }: PropiedadesLineaTiempo) {
  if (eventos.length === 0) {
    return (
      <EstadoVacio
        icono={<CalendarDays size={22} />}
        titulo="Todavía no hay atenciones registradas"
        descripcion="Cuando se registre una consulta o vacuna, aparecerá
          aquí en orden cronológico."
      />
    );
  }

  return (
    <ol className="relative ml-2 border-l border-borde pl-6">
      {eventos.map((evento) => (
        <EventoLineaTiempo key={evento.id} evento={evento} />
      ))}
    </ol>
  );
}

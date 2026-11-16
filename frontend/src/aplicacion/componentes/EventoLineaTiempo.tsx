import { Stethoscope, Syringe } from 'lucide-react';
import { Insignia } from './Insignia';
import { DetalleEventoClinico } from './DetalleEventoClinico';
import { formatearFecha } from '../utilidades/fechas';
import type { EventoClinico } from '../tipos/evento-clinico';

interface PropiedadesEventoLineaTiempo {
  evento: EventoClinico;
}

export function EventoLineaTiempo({
  evento,
}: PropiedadesEventoLineaTiempo) {
  const esConsulta = evento.categoria === 'consulta';
  const Icono = esConsulta ? Stethoscope : Syringe;
  const tituloCategoria = esConsulta ? 'Consulta' : 'Vacunación';

  return (
    <li className="relative pb-7 last:pb-0">
      <span className="absolute -left-[2.05rem] grid h-8 w-8
        place-items-center rounded-full border border-borde bg-superficie
        text-verde-profundo">
        <Icono size={15} aria-hidden="true" />
      </span>
      <article className="rounded-tarjeta border border-borde
        bg-superficie p-4 sm:p-5">
        <CabeceraEvento
          evento={evento}
          tituloCategoria={tituloCategoria}
          esConsulta={esConsulta}
        />
        <DetalleEventoClinico evento={evento} />
      </article>
    </li>
  );
}

function CabeceraEvento({
  evento,
  tituloCategoria,
  esConsulta,
}: {
  evento: EventoClinico;
  tituloCategoria: string;
  esConsulta: boolean;
}) {
  const tono = esConsulta ? 'verde' : 'primario';

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Insignia tono={tono}>{tituloCategoria}</Insignia>
        <h3 className="mt-2 font-semibold text-texto">{evento.titulo}</h3>
      </div>
      <time className="text-sm text-texto-suave">
        {formatearFecha(evento.fecha)}
      </time>
    </div>
  );
}

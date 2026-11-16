import type { EventoClinico } from '../tipos/evento-clinico';

interface PropiedadesDetalleEvento {
  evento: EventoClinico;
}

export function DetalleEventoClinico({
  evento,
}: PropiedadesDetalleEvento) {
  return (
    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      {evento.diagnostico && (
        <CampoDetalle etiqueta="Diagnóstico">
          {evento.diagnostico}
        </CampoDetalle>
      )}
      {evento.tratamiento && (
        <CampoDetalle etiqueta="Tratamiento o seguimiento">
          {evento.tratamiento}
        </CampoDetalle>
      )}
      <CampoDetalle etiqueta="Veterinario">
        {evento.veterinario}
      </CampoDetalle>
    </div>
  );
}

function CampoDetalle({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: string;
}) {
  return (
    <div>
      <p className="text-xs text-texto-suave">{etiqueta}</p>
      <p className="mt-1 leading-5 text-texto">{children}</p>
    </div>
  );
}

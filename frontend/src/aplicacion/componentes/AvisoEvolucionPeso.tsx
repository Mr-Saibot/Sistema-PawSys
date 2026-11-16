import { Activity } from 'lucide-react';

export function AvisoEvolucionPeso() {
  return (
    <div className="mt-4 flex gap-2 rounded-control bg-fondo p-3
      text-xs leading-5 text-texto-suave">
      <Activity
        className="mt-0.5 shrink-0 text-verde-profundo"
        size={15}
        aria-hidden="true"
      />
      <p>Aún no hay mediciones anteriores para mostrar una evolución.</p>
    </div>
  );
}

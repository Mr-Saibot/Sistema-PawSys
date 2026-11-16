import type { LucideIcon } from 'lucide-react';
import type { PestanaFicha } from '../tipos/evento-clinico';

interface PropiedadesBotonPestana {
  pestana: {
    clave: PestanaFicha;
    titulo: string;
    icono: LucideIcon;
  };
  seleccionada: PestanaFicha;
  alSeleccionar: (pestana: PestanaFicha) => void;
}

export function BotonPestanaPaciente({
  pestana,
  seleccionada,
  alSeleccionar,
}: PropiedadesBotonPestana) {
  const Icono = pestana.icono;
  const activa = pestana.clave === seleccionada;
  const estilo = activa
    ? 'border-primario font-medium text-primario-oscuro'
    : 'border-transparent text-texto-suave hover:text-texto';

  return (
    <button
      className={`inline-flex shrink-0 items-center gap-2 border-b-2
        px-3 py-3 text-sm transition-colors ${estilo}`}
      type="button"
      role="tab"
      aria-selected={activa}
      onClick={() => alSeleccionar(pestana.clave)}
    >
      <Icono size={16} strokeWidth={1.7} aria-hidden="true" />
      {pestana.titulo}
    </button>
  );
}

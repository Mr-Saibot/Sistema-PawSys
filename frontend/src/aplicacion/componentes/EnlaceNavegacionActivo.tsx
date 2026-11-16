import type { LucideIcon } from 'lucide-react';

interface PropiedadesEnlaceNavegacion {
  titulo: string;
  icono: LucideIcon;
  identificadorPaciente: number;
}

export function EnlaceNavegacionActivo({
  titulo,
  icono: Icono,
  identificadorPaciente,
}: PropiedadesEnlaceNavegacion) {
  return (
    <a
      className="flex min-h-10 items-center gap-3 rounded-control
        bg-primario-suave px-3 text-sm font-medium text-primario-oscuro"
      href={`#/pacientes/${identificadorPaciente}`}
      aria-current="page"
    >
      <Icono size={17} strokeWidth={1.7} aria-hidden="true" />
      {titulo}
    </a>
  );
}

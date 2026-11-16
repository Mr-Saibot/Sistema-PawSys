import type { LucideIcon } from 'lucide-react';
import { BotonNavegacionBloqueado } from './BotonNavegacionBloqueado';
import { EnlaceNavegacionActivo } from './EnlaceNavegacionActivo';

interface PropiedadesBotonNavegacion {
  titulo: string;
  icono: LucideIcon;
  activo: boolean;
  identificadorPaciente: number;
}

export function BotonNavegacion({
  titulo,
  icono,
  activo,
  identificadorPaciente,
}: PropiedadesBotonNavegacion) {
  if (activo) {
    return (
      <EnlaceNavegacionActivo
        titulo={titulo}
        icono={icono}
        identificadorPaciente={identificadorPaciente}
      />
    );
  }

  return <BotonNavegacionBloqueado titulo={titulo} icono={icono} />;
}

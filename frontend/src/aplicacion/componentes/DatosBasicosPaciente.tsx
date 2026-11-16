import { CalendarDays, Weight } from 'lucide-react';
import { calcularEdad } from '../utilidades/fechas';
import type { MascotaPaciente } from '../tipos/paciente';

interface PropiedadesDatosBasicos {
  paciente: MascotaPaciente;
}

export function DatosBasicosPaciente({
  paciente,
}: PropiedadesDatosBasicos) {
  const edad = calcularEdad(paciente.fechaNacimiento);
  const peso = paciente.peso ? `${paciente.peso} kg` : 'Sin dato';

  return (
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
      <DatoPaciente icono={<CalendarDays size={16} />}>
        {edad}
      </DatoPaciente>
      <DatoPaciente icono={<Weight size={16} />}>
        {peso}
      </DatoPaciente>
    </div>
  );
}

function DatoPaciente({
  icono,
  children,
}: {
  icono: React.ReactNode;
  children: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-texto">
      <span className="text-verde-profundo" aria-hidden="true">{icono}</span>
      {children}
    </span>
  );
}

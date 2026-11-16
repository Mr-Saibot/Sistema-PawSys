import { Avatar } from './Avatar';
import { DatosBasicosPaciente } from './DatosBasicosPaciente';
import { IdentidadPaciente } from './IdentidadPaciente';
import { ResponsablePaciente } from './ResponsablePaciente';
import type { MascotaPaciente } from '../tipos/paciente';

interface PropiedadesCabeceraPaciente {
  paciente: MascotaPaciente;
}

export function CabeceraPaciente({
  paciente,
}: PropiedadesCabeceraPaciente) {
  return (
    <section className="grid gap-6 rounded-tarjeta border border-borde
      bg-superficie p-5 shadow-sutil sm:grid-cols-[auto_1fr] sm:p-8">
      <Avatar
        nombre={paciente.nombre}
        foto={paciente.fotoUrl}
        tamano="grande"
      />
      <div className="min-w-0">
        <IdentidadPaciente paciente={paciente} />
        <DatosBasicosPaciente paciente={paciente} />
        <ResponsablePaciente responsable={paciente.cliente} />
      </div>
    </section>
  );
}

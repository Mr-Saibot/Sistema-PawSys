import { Avatar } from './Avatar';
import { Boton } from './Boton';
import { DatosBasicosPaciente } from './DatosBasicosPaciente';
import { IdentidadPaciente } from './IdentidadPaciente';
import { ResponsablePaciente } from './ResponsablePaciente';
import type { MascotaPaciente } from '../tipos/paciente';
import { Pencil } from 'lucide-react';

interface PropiedadesCabeceraPaciente {
  paciente: MascotaPaciente;
  alEditar: () => void;
}

export function CabeceraPaciente({
  paciente,
  alEditar,
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
        <div className="mb-3 flex justify-end">
          <Boton variante="secundario" icono={<Pencil size={15} />} onClick={alEditar}>
            Editar mascota
          </Boton>
        </div>
        <IdentidadPaciente paciente={paciente} />
        <DatosBasicosPaciente paciente={paciente} />
        <ResponsablePaciente responsable={paciente.cliente} />
      </div>
    </section>
  );
}

import { Insignia } from './Insignia';
import type { MascotaPaciente } from '../tipos/paciente';

interface PropiedadesIdentidadPaciente {
  paciente: MascotaPaciente;
}

export function IdentidadPaciente({
  paciente,
}: PropiedadesIdentidadPaciente) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-texto">
          {paciente.nombre}
        </h1>
        <Insignia tono="verde">{paciente.especie}</Insignia>
      </div>
      <p className="mt-1 text-base text-texto-suave">
        {paciente.raza || 'Raza no registrada'}
      </p>
    </div>
  );
}

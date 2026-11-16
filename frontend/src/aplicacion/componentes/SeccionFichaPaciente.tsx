import { Tarjeta } from './Tarjeta';
import { ListaVacunas } from './ListaVacunas';
import { LineaTiempoClinica } from './LineaTiempoClinica';
import { ResumenPeso } from './ResumenPeso';
import { EstadoSeccionPaciente } from './EstadoSeccionPaciente';
import type { EventoClinico, PestanaFicha } from '../tipos/evento-clinico';
import type { MascotaPaciente } from '../tipos/paciente';

interface PropiedadesSeccionFicha {
  paciente: MascotaPaciente;
  pestana: PestanaFicha;
  eventos: EventoClinico[];
}

export function SeccionFichaPaciente({
  paciente,
  pestana,
  eventos,
}: PropiedadesSeccionFicha) {
  if (pestana === 'historial') {
    return <ContenidoHistorial paciente={paciente} eventos={eventos} />;
  }

  if (pestana === 'vacunas') {
    return <ListaVacunas vacunas={paciente.historial?.vacunaciones || []} />;
  }

  return <EstadoSeccionPaciente pestana={pestana} />;
}

function ContenidoHistorial({
  paciente,
  eventos,
}: {
  paciente: MascotaPaciente;
  eventos: EventoClinico[];
}) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)
      minmax(17rem,0.8fr)]">
      <Tarjeta className="p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-texto">
            Actividad clínica
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Consultas y vacunas registradas para {paciente.nombre}.
          </p>
        </div>
        <LineaTiempoClinica eventos={eventos} />
      </Tarjeta>
      <ResumenPeso peso={paciente.peso} />
    </div>
  );
}

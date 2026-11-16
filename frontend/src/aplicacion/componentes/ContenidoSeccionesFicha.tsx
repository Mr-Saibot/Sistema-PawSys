import { DatosNoRegistrados } from './DatosNoRegistrados';
import { PestanasPaciente } from './PestanasPaciente';
import { SeccionFichaPaciente } from './SeccionFichaPaciente';
import { useEventosClinicos } from '../hooks/useEventosClinicos';
import type { PestanaFicha } from '../tipos/evento-clinico';
import type { MascotaPaciente } from '../tipos/paciente';

interface PropiedadesContenidoSecciones {
  paciente: MascotaPaciente;
  pestana: PestanaFicha;
  alSeleccionarPestana: (pestana: PestanaFicha) => void;
}

export function ContenidoSeccionesFicha({
  paciente,
  pestana,
  alSeleccionarPestana,
}: PropiedadesContenidoSecciones) {
  const eventos = useEventosClinicos(paciente.historial);

  return (
    <div className="space-y-5">
      <DatosNoRegistrados />
      <PestanasPaciente
        seleccionada={pestana}
        alSeleccionar={alSeleccionarPestana}
      />
      <section role="tabpanel">
        <SeccionFichaPaciente
          paciente={paciente}
          pestana={pestana}
          eventos={eventos}
        />
      </section>
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { EstadoPaginaFicha } from '../componentes/EstadoPaginaFicha';
import { useFichaPaciente } from '../hooks/useFichaPaciente';
import type { SesionUsuario } from '../tipos/paciente';
import { ContenidoFichaPaciente } from './ContenidoFichaPaciente';

interface PropiedadesFichaPaciente {
  sesion: SesionUsuario;
}

export function FichaPaciente({ sesion }: PropiedadesFichaPaciente) {
  const { id } = useParams();
  const identificador = Number(id);
  const identificadorValido =
    Number.isInteger(identificador) && identificador > 0;
  const estado = useFichaPaciente(
    identificador,
    sesion.token,
  );

  if (estado.cargando || !estado.paciente || estado.error) {
    return (
      <EstadoPaginaFicha
        identificadorValido={identificadorValido}
        cargando={estado.cargando && identificadorValido}
        error={estado.error}
      />
    );
  }

  return (
    <ContenidoFichaPaciente
      paciente={estado.paciente}
      sesion={sesion}
      alRecargar={estado.recargar}
    />
  );
}

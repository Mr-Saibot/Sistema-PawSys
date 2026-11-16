import { Boton } from '../componentes/Boton';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { PantallaCarga } from '../componentes/PantallaCarga';
import { useCerrarSesion } from '../hooks/useCerrarSesion';
import { usePrimerPaciente } from '../hooks/usePrimerPaciente';
import type { SesionUsuario } from '../tipos/paciente';

interface PropiedadesInicioPaciente {
  sesion: SesionUsuario;
}

export function InicioPaciente({ sesion }: PropiedadesInicioPaciente) {
  const { cargando, error } = usePrimerPaciente(sesion);
  const cerrar = useCerrarSesion();

  if (cargando) {
    return <PantallaCarga />;
  }

  return (
    <EstadoVacio
      titulo="No hay una ficha para abrir"
      descripcion={error}
      accion={<Boton variante="secundario" onClick={cerrar}>
        Volver al acceso
      </Boton>}
    />
  );
}

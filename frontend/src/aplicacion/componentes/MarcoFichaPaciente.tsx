import type { ReactNode } from 'react';
import { useCerrarSesion } from '../hooks/useCerrarSesion';
import type { SesionUsuario } from '../tipos/paciente';
import { MarcoAplicacion } from './MarcoAplicacion';

interface PropiedadesMarcoFicha {
  sesion: SesionUsuario;
  identificador: number;
  children: ReactNode;
}

export function MarcoFichaPaciente({
  sesion,
  identificador,
  children,
}: PropiedadesMarcoFicha) {
  const cerrar = useCerrarSesion();

  return (
    <MarcoAplicacion
      rol={sesion.usuario.rol}
      nombreUsuario={sesion.usuario.correo}
      alCerrarSesion={cerrar}
      identificadorPaciente={identificador}
    >
      {children}
    </MarcoAplicacion>
  );
}

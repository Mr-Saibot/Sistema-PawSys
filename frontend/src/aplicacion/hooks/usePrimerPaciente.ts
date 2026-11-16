import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { obtenerMascotas } from '../servicios/api';
import type { MascotaResumen, SesionUsuario } from '../tipos/paciente';

interface EstadoRedireccion {
  cargando: boolean;
  error: string;
}

export function usePrimerPaciente(
  sesion: SesionUsuario,
): EstadoRedireccion {
  const navegar = useNavigate();
  const [estado, establecerEstado] = useState<EstadoRedireccion>({
    cargando: true,
    error: '',
  });

  useEffect(() => {
    return cargarPrimerPaciente(sesion, navegar, establecerEstado);
  }, [navegar, sesion.token, sesion.usuario.rol]);

  return estado;
}

function cargarPrimerPaciente(
  sesion: SesionUsuario,
  navegar: NavigateFunction,
  establecerEstado: Dispatch<SetStateAction<EstadoRedireccion>>,
): () => void {
  let cancelado = false;

  obtenerMascotas(sesion.token, sesion.usuario.rol)
    .then((mascotas) =>
      procesarRespuesta(mascotas, cancelado, navegar, establecerEstado))
    .catch((causa: unknown) =>
      procesarError(causa, cancelado, establecerEstado));

  return () => {
    cancelado = true;
  };
}

function procesarRespuesta(
  mascotas: MascotaResumen[],
  cancelado: boolean,
  navegar: NavigateFunction,
  establecerEstado: Dispatch<SetStateAction<EstadoRedireccion>>,
): void {
  if (cancelado) {
    return;
  }

  const primeraMascota = mascotas[0];

  if (primeraMascota) {
    navegar(`/pacientes/${primeraMascota.id}`, { replace: true });
    return;
  }

  establecerEstado({
    cargando: false,
    error: 'Todavía no hay pacientes registrados para mostrar.',
  });
}

function procesarError(
  causa: unknown,
  cancelado: boolean,
  establecerEstado: Dispatch<SetStateAction<EstadoRedireccion>>,
): void {
  if (cancelado) {
    return;
  }

  establecerEstado({
    cargando: false,
    error: obtenerMensajeError(causa),
  });
}

function obtenerMensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }

  return 'No se pudieron cargar los pacientes.';
}

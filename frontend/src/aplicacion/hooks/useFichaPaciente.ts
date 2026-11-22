import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { obtenerFichaPaciente } from '../servicios/api';
import type { MascotaPaciente } from '../tipos/paciente';

interface EstadoFichaPaciente {
  paciente: MascotaPaciente | null;
  cargando: boolean;
  error: string;
  recargar: () => void;
}

export function useFichaPaciente(
  identificador: number,
  token: string,
): EstadoFichaPaciente {
  const [estado, establecerEstado] = useState<EstadoFichaPaciente>({
    paciente: null,
    cargando: true,
    error: '',
    recargar: () => undefined,
  });
  const [numeroRecarga, establecerNumeroRecarga] = useState(0);

  useEffect(() => {
    return cargarFicha(identificador, token, establecerEstado);
  }, [identificador, token, numeroRecarga]);

  return {
    ...estado,
    recargar: () => establecerNumeroRecarga((numero) => numero + 1),
  };
}

function cargarFicha(
  identificador: number,
  token: string,
  establecerEstado: Dispatch<SetStateAction<EstadoFichaPaciente>>,
): () => void {
  const controlador = new AbortController();
  establecerEstado((estadoActual) => ({
    ...estadoActual,
    cargando: true,
    error: '',
  }));

  obtenerFichaPaciente(identificador, token, controlador.signal)
    .then((paciente) => establecerPaciente(paciente, establecerEstado))
    .catch((causa: unknown) => {
      establecerError(causa, controlador.signal.aborted, establecerEstado);
    })
    .finally(() => finalizarCarga(controlador.signal.aborted, establecerEstado));

  return () => controlador.abort();
}

function establecerPaciente(
  paciente: MascotaPaciente,
  establecerEstado: Dispatch<SetStateAction<EstadoFichaPaciente>>,
): void {
  establecerEstado({
    paciente,
    cargando: false,
    error: '',
    recargar: () => undefined,
  });
}

function establecerError(
  causa: unknown,
  cancelado: boolean,
  establecerEstado: Dispatch<SetStateAction<EstadoFichaPaciente>>,
): void {
  if (!cancelado) {
    establecerEstado({
      paciente: null,
      cargando: false,
      error: obtenerMensajeError(causa),
      recargar: () => undefined,
    });
  }
}

function finalizarCarga(
  cancelado: boolean,
  establecerEstado: Dispatch<SetStateAction<EstadoFichaPaciente>>,
): void {
  if (!cancelado) {
    establecerEstado((estadoActual) => ({
      ...estadoActual,
      cargando: false,
    }));
  }
}

function obtenerMensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }

  return 'No se pudo cargar la ficha del paciente.';
}

import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../servicios/api';
import type { EstadoAcceso } from '../tipos/acceso';

export function useAcceso(): EstadoAcceso {
  const navegar = useNavigate();
  const [correo, establecerCorreo] = useState('');
  const [clave, establecerClave] = useState('');
  const [cargando, establecerCarga] = useState(false);
  const [error, establecerError] = useState('');
  const enviarFormulario = useCallback(
    (evento: FormEvent<HTMLFormElement>) => ejecutarAcceso(evento, {
      correo,
      clave,
      establecerCarga,
      establecerError,
      navegar,
    }),
    [correo, clave, navegar],
  );

  return {
    correo,
    clave,
    cargando,
    error,
    establecerCorreo,
    establecerClave,
    enviarFormulario,
  };
}

interface ParametrosAcceso {
  correo: string;
  clave: string;
  establecerCarga: (cargando: boolean) => void;
  establecerError: (error: string) => void;
  navegar: ReturnType<typeof useNavigate>;
}

async function ejecutarAcceso(
  evento: FormEvent<HTMLFormElement>,
  parametros: ParametrosAcceso,
): Promise<void> {
  evento.preventDefault();
  parametros.establecerCarga(true);
  parametros.establecerError('');

  try {
    await iniciarSesion(parametros.correo, parametros.clave);
    parametros.navegar('/', { replace: true });
  } catch (causa: unknown) {
    parametros.establecerError(obtenerMensajeError(causa));
  } finally {
    parametros.establecerCarga(false);
  }
}

function obtenerMensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }

  return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
}

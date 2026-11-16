import { useEffect, useState } from 'react';
import { confirmarTurno } from '../servicios/api';

type EstadoConfirmacion = 'cargando' | 'confirmado' | 'error';

interface ResultadoConfirmacion {
  estado: EstadoConfirmacion;
  mensaje: string;
}

export function useConfirmacionTurno(
  token: string,
): ResultadoConfirmacion {
  const [resultado, establecerResultado] = useState<ResultadoConfirmacion>({
    estado: 'cargando',
    mensaje: 'Estamos confirmando tu asistencia.',
  });

  useEffect(() => {
    let cancelado = false;

    if (!token) {
      establecerResultado({
        estado: 'error',
        mensaje: 'El enlace no contiene un código de confirmación.',
      });
      return () => {
        cancelado = true;
      };
    }

    confirmarTurno(token)
      .then(() => {
        if (!cancelado) {
          establecerResultado({
            estado: 'confirmado',
            mensaje: 'Tu asistencia quedó confirmada. ¡Te esperamos!',
          });
        }
      })
      .catch((causa: unknown) => {
        if (!cancelado) {
          establecerResultado({
            estado: 'error',
            mensaje: causa instanceof Error
              ? causa.message
              : 'No se pudo confirmar la asistencia.',
          });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [token]);

  return resultado;
}

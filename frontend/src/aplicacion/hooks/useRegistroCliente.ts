import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarCliente } from '../servicios/api';
import type { EstadoRegistroCliente } from '../tipos/acceso';

const VALORES_INICIALES = {
  nombre: '',
  apellido: '',
  cedulaIdentidad: '',
  correo: '',
  clave: '',
  telefono: '',
  direccion: '',
};

export function useRegistroCliente(): EstadoRegistroCliente {
  const navegar = useNavigate();
  const [valores, establecerValores] = useState(VALORES_INICIALES);
  const [cargando, establecerCarga] = useState(false);
  const [error, establecerError] = useState('');

  const cambiarCampo = useCallback((campo: keyof typeof VALORES_INICIALES,
    valor: string) => {
    establecerValores((actuales) => ({ ...actuales, [campo]: valor }));
  }, []);

  const enviarFormulario = useCallback(
    (evento: FormEvent<HTMLFormElement>) => ejecutarRegistro(evento, {
      valores,
      establecerCarga,
      establecerError,
      navegar,
    }),
    [navegar, valores],
  );

  return {
    ...valores,
    cargando,
    error,
    establecerNombre: (valor) => cambiarCampo('nombre', valor),
    establecerApellido: (valor) => cambiarCampo('apellido', valor),
    establecerCedulaIdentidad: (valor) => cambiarCampo('cedulaIdentidad', valor),
    establecerCorreo: (valor) => cambiarCampo('correo', valor),
    establecerClave: (valor) => cambiarCampo('clave', valor),
    establecerTelefono: (valor) => cambiarCampo('telefono', valor),
    establecerDireccion: (valor) => cambiarCampo('direccion', valor),
    enviarFormulario,
  };
}

interface ParametrosRegistro {
  valores: typeof VALORES_INICIALES;
  establecerCarga: (cargando: boolean) => void;
  establecerError: (error: string) => void;
  navegar: ReturnType<typeof useNavigate>;
}

async function ejecutarRegistro(
  evento: FormEvent<HTMLFormElement>,
  parametros: ParametrosRegistro,
): Promise<void> {
  evento.preventDefault();
  parametros.establecerCarga(true);
  parametros.establecerError('');

  try {
    await registrarCliente(parametros.valores);
    parametros.navegar('/login', {
      replace: true,
      state: { aviso: 'Cuenta creada. Ya podés iniciar sesión.' },
    });
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

  return 'No se pudo crear la cuenta. Intentá nuevamente.';
}

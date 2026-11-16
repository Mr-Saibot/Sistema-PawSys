import type { FormEvent } from 'react';

export interface EstadoAcceso {
  correo: string;
  clave: string;
  cargando: boolean;
  error: string;
  establecerCorreo: (correo: string) => void;
  establecerClave: (clave: string) => void;
  enviarFormulario: (evento: FormEvent<HTMLFormElement>) => Promise<void>;
}

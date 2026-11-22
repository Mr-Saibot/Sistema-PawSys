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

export interface DatosRegistroCliente {
  nombre: string;
  apellido: string;
  cedulaIdentidad: string;
  correo: string;
  clave: string;
  telefono: string;
  direccion: string;
}

export interface EstadoRegistroCliente extends DatosRegistroCliente {
  cargando: boolean;
  error: string;
  establecerNombre: (nombre: string) => void;
  establecerApellido: (apellido: string) => void;
  establecerCedulaIdentidad: (cedulaIdentidad: string) => void;
  establecerCorreo: (correo: string) => void;
  establecerClave: (clave: string) => void;
  establecerTelefono: (telefono: string) => void;
  establecerDireccion: (direccion: string) => void;
  enviarFormulario: (evento: FormEvent<HTMLFormElement>) => Promise<void>;
}

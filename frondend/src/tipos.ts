export type Rol = 'CLIENTE' | 'VETERINARIO' | 'ADMINISTRADOR';

export interface Perfil {
  nombre: string;
  apellido: string;
}

export interface Usuario {
  id: number;
  correo: string;
  rol: Rol;
  nombreDemostracion?: string;
  cliente?: Perfil;
  veterinario?: Perfil;
  administrador?: Perfil;
}

export interface Sesion {
  usuario: Usuario;
  token: string | null;
  demostracion: boolean;
}

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza?: string | null;
  peso?: number | null;
  estado?: boolean;
  foto?: string;
  cliente?: string | Perfil | null;
  clienteNombre?: string;
}

export interface Turno {
  hora?: string;
  fecha?: string;
  mascota?: string | Pick<Mascota, 'nombre'>;
  motivo?: string | null;
  persona?: string;
  veterinario?: Perfil;
  estado?: string;
}

export interface Persona extends Perfil {
  correo: string;
  telefono?: string | null;
  especialidad?: string;
}

export interface DatosRegistroCliente {
  correo: string;
  clave: string;
  cedulaIdentidad: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
}

export interface DatosPanel {
  mascotas: Mascota[];
  turnos: Turno[];
  clientes: Persona[];
  veterinarios: Persona[];
  conectado: boolean;
  errorConexion: boolean;
  demostracion?: boolean;
}
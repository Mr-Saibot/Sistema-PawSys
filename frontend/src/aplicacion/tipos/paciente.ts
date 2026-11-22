export type RolUsuario = 'CLIENTE' | 'VETERINARIO' | 'ADMINISTRADOR';

export interface UsuarioSesion {
  id: number;
  correo: string;
  rol: RolUsuario;
  cliente?: PerfilSesion;
  veterinario?: PerfilSesion;
  administrador?: PerfilSesion;
}

interface PerfilSesion {
  nombre: string;
  apellido: string;
}

export interface SesionUsuario {
  usuario: UsuarioSesion;
  token: string;
}

export interface ResponsablePaciente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
}

export interface VeterinarioAtencion {
  nombre: string;
  apellido: string;
  especialidad: string;
}

export interface ConsultaClinica {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  veterinario: VeterinarioAtencion;
}

export interface VacunaPaciente {
  id: number;
  vacuna: string;
  fecha: string;
  proximaDosis: string | null;
  veterinario: VeterinarioAtencion;
}

export interface HistorialPaciente {
  id: number;
  fechaCreacion: string;
  observaciones: string | null;
  consultas: ConsultaClinica[];
  vacunaciones: VacunaPaciente[];
}

export interface MascotaPaciente {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string | null;
  peso: number | null;
  fotoUrl: string | null;
  fechaNacimiento: string | null;
  observaciones: string | null;
  estado: boolean;
  cliente: ResponsablePaciente;
  historial: HistorialPaciente | null;
}

export interface MascotaResumen {
  id: number;
  nombre: string;
  clienteId?: number;
  sexo?: string | null;
}

export interface RespuestaAcceso {
  user: UsuarioSesion;
  access_token: string;
}

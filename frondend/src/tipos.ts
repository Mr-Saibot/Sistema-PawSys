export type Rol = 'CLIENTE' | 'VETERINARIO' | 'ADMINISTRADOR';

export interface Perfil {
  nombre: string;
  apellido: string;
}

export interface Usuario {
  id: number;
  correo: string;
  rol: Rol;
  cliente?: Perfil;
  veterinario?: Perfil;
  administrador?: Perfil;
}

export interface Sesion {
  usuario: Usuario;
  token: string;
}

export interface Mascota {
  id: number;
  clienteId?: number;
  nombre: string;
  especie: string;
  raza?: string | null;
  peso?: number | null;
  estado?: boolean;
  foto?: string;
  cliente?: string | Perfil | null;
  clienteNombre?: string;
  fechaNacimiento?: string | null;
  observaciones?: string | null;
}

export interface Turno {
  id?: number;
  mascotaId?: number;
  veterinarioId?: number;
  agendaId?: number | null;
  hora?: string;
  fecha?: string;
  mascota?: string | Pick<Mascota, 'nombre'>;
  motivo?: string | null;
  persona?: string;
  veterinario?: Perfil;
  estado?: string;
}

export interface Persona extends Perfil {
  id?: number;
  usuarioId?: number;
  cedulaIdentidad?: string;
  correo: string;
  telefono?: string | null;
  especialidad?: string;
  nroMatricula?: string;
  direccion?: string | null;
}

export interface Administrador extends Perfil {
  id?: number;
  usuarioId?: number;
  correo: string;
  telefono?: string | null;
  direccion?: string | null;
}

export interface Caja {
  id: number;
  saldoInicial: number | string;
  saldoActual: number | string;
  estado: string;
  fechaApertura: string;
}

export interface ReporteCaja {
  cajaId: number;
  estado: string;
  totalIngresos: number;
  totalEgresos: number;
  ingresos: Ingreso[];
  egresos: Egreso[];
}

export interface Ingreso {
  id: number;
  monto: number | string;
  concepto: string;
  responsable: string;
  formaPago: string;
  fecha: string;
}

export interface Egreso {
  id: number;
  monto: number | string;
  concepto: string;
  responsable: string;
  categoria: string;
  fecha: string;
}

export interface ConfiguracionPagos {
  alias: string;
  titular: string;
  qrImageUrl: string;
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
  administradores: Administrador[];
  conectado: boolean;
  errorConexion: boolean;
  cajas: Caja[];
  ingresos: Ingreso[];
  egresos: Egreso[];
  historiales: HistorialClinico[];
  consultas: Consulta[];
  vacunaciones: Vacunacion[];
  agendas: Agenda[];
  errorRecursos: string[];
}

export interface HistorialClinico {
  id: number;
  mascotaId: number;
  mascota?: Mascota;
  observaciones?: string | null;
  consultas?: Consulta[];
  vacunaciones?: Vacunacion[];
}

export interface Consulta {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico?: string | null;
  tratamiento?: string | null;
  costo: number | string;
  historialId: number;
}

export interface Vacunacion {
  id: number;
  vacuna: string;
  fecha: string;
  proximaDosis?: string | null;
  costo: number | string;
  historialId: number;
}

export interface Agenda {
  id: number;
  fecha: string;
  horario: string;
  turnos?: Turno[];
}
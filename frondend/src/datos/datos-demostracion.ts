import { fotos } from '../constantes.js';
import type { Turno, DatosPanel, Mascota, Rol, Sesion } from '../tipos.js';

export const mascotasDemo: Mascota[] = [
  { id: 1, nombre: 'Luna', especie: 'Perro', raza: 'Golden retriever', peso: 24.5, cliente: 'María Fernanda Ríos', foto: fotos.perro },
  { id: 2, nombre: 'Milo', especie: 'Gato', raza: 'Europeo de pelo corto', peso: 5.2, cliente: 'María Fernanda Ríos', foto: fotos.gato },
  { id: 3, nombre: 'Nala', especie: 'Perro', raza: 'Mestiza', peso: 12.8, cliente: 'Andrés Molina', foto: fotos.cachorro },
  { id: 4, nombre: 'Simón', especie: 'Gato', raza: 'Atigrado', peso: 4.1, cliente: 'Lucía Torres', foto: fotos.gato },
];

export const turnosDemo: Turno[] = [
  { hora: '09:00', mascota: 'Luna', motivo: 'Control anual', persona: 'Dra. Valentina Cruz', estado: 'CONFIRMADO' },
  { hora: '10:30', mascota: 'Milo', motivo: 'Vacunación', persona: 'Dr. Mateo Silva', estado: 'PENDIENTE' },
  { hora: '12:00', mascota: 'Nala', motivo: 'Consulta general', persona: 'Dra. Valentina Cruz', estado: 'CONFIRMADO' },
  { hora: '15:30', mascota: 'Simón', motivo: 'Revisión', persona: 'Dr. Mateo Silva', estado: 'PENDIENTE' },
];

const nombresDemo: Record<Rol, string> = {
  CLIENTE: 'María Fernanda Ríos',
  VETERINARIO: 'Valentina Cruz',
  ADMINISTRADOR: 'Camila Herrera',
};

export function crearSesionDemo(rol: Rol): Sesion {
  return {
    usuario: { id: 0, correo: `${rol.toLowerCase()}@pawsys.demo`, rol: rol, nombreDemostracion: nombresDemo[rol] },
    token: null,
    demostracion: true,
  };
}

export function crearDatosDemo(): DatosPanel {
  return {
    mascotas: mascotasDemo,
    turnos: turnosDemo,
    clientes: [],
    veterinarios: [],
    conectado: false,
    errorConexion: false,
  };
}

export function crearDatosVacios(): DatosPanel {
  return {
    mascotas: [],
    turnos: [],
    clientes: [],
    veterinarios: [],
    conectado: false,
    errorConexion: false,
  };
}
import type { DatosPanel } from '../tipos.js';

export function crearDatosVacios(): DatosPanel {
  return {
    mascotas: [],
    turnos: [],
    clientes: [],
    veterinarios: [],
    administradores: [],
    conectado: false,
    errorConexion: false,
    cajas: [],
    ingresos: [],
    egresos: [],
    historiales: [],
    consultas: [],
    vacunaciones: [],
    agendas: [],
    errorRecursos: [],
  };
}

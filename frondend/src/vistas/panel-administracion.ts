import { renderizarInicioPanel } from '../componentes/panel.js';
import type { DatosPanel } from '../tipos.js';

export function renderizarPanelAdministracion(nombre: string, datos: DatosPanel): string {
  return renderizarInicioPanel(
    'Panel de administración',
    'Vista general de la operación de la clínica.',
    `Hola, ${nombre.split(' ')[0]}`,
    'Consulta los registros y gestiona la actividad de la clínica.',
    [
      ['Pacientes', String(datos.mascotas.length), 'Registros de mascotas', '✚'],
      ['Clientes', String(datos.clientes.length), 'Cuentas activas', '♙'],
      ['Veterinarios', String(datos.veterinarios.length), 'Equipo clínico', '＋'],
      ['Turnos', String(datos.turnos.filter((turno) => turno.estado !== 'CANCELADO').length), 'En agenda', '◷'],
    ],
    datos,
  );
}

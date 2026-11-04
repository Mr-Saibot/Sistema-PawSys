import { turnosDemo, mascotasDemo } from '../datos/datos-demostracion.js';
import { renderizarInicioPanel } from '../componentes/panel.js';
import type { DatosPanel } from '../tipos.js';

export function renderizarPanelAdministracion(nombre: string, datos: DatosPanel): string {
  const mascotas = datos.mascotas.length ? datos.mascotas : datos.demostracion ? mascotasDemo : [];
  const clientes = datos.clientes.length || (datos.demostracion ? 28 : 0);
  const veterinarios = datos.veterinarios.length || (datos.demostracion ? 4 : 0);
  const turnos = datos.turnos.length || (datos.demostracion ? turnosDemo.length : 0);
  return renderizarInicioPanel(
    'Panel de administración',
    'Una vista general de la operación de la clínica.',
    `Hola, ${nombre.split(' ')[0]}`,
    'Aquí tienes el resumen de actividad de la clínica.',
    [
      ['Pacientes', String(mascotas.length), 'Registros de mascotas', '✚'],
      ['Clientes', String(clientes), 'Cuentas registradas', '♙'],
      ['Veterinarios', String(veterinarios), 'Equipo clínico', '＋'],
      ['Turnos hoy', String(turnos), 'En toda la clínica', '◷'],
    ],
    datos,
  );
}
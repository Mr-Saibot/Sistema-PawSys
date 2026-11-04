import { turnosDemo, mascotasDemo } from '../datos/datos-demostracion.js';
import { renderizarInicioPanel } from '../componentes/panel.js';
import type { DatosPanel } from '../tipos.js';

export function renderizarPanelVeterinario(nombre: string, datos: DatosPanel): string {
  const mascotas = datos.mascotas.length ? datos.mascotas : datos.demostracion ? mascotasDemo : [];
  const turnos = datos.turnos.length || (datos.demostracion ? turnosDemo.length : 0);
  return renderizarInicioPanel(
    'Panel veterinario',
    'Resumen de tu jornada y tus pacientes.',
    `Buen día, ${nombre.split(' ')[0]}`,
    'Tu equipo y tus pacientes están listos para hoy.',
    [
      ['Pacientes', String(mascotas.length), datos.demostracion ? 'En seguimiento' : 'Registros disponibles', '✚'],
      ['Turnos de hoy', String(turnos), 'Agenda clínica', '◷'],
      ['Historias clínicas', datos.demostracion ? String(Math.max(mascotas.length - 1, 0)) : '—', datos.demostracion ? 'Registros activos' : 'Sin datos disponibles', '▤'],
      ['Vacunas próximas', datos.demostracion ? '3' : '—', datos.demostracion ? 'En los próximos 7 días' : 'Sin datos disponibles', '＋'],
    ],
    datos,
  );
}
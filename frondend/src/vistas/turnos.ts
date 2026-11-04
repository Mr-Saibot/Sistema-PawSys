import { renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { turnosMostrados, renderizarListaTurnos } from '../componentes/turnos.js';
import type { DatosPanel, Sesion } from '../tipos.js';

export function renderizarPaginaTurnos(pagina: string, datos: DatosPanel, sesion: Sesion): string {
  const turnos = turnosMostrados(datos.turnos, sesion.demostracion);
  const confirmados = turnos.filter((turno) => (turno.estado || '').toUpperCase() === 'CONFIRMADO').length;
  const pendientes = turnos.filter((turno) => (turno.estado || '').toUpperCase() === 'PENDIENTE').length;
  return `${renderizarEncabezado(pagina === 'Mis turnos' ? 'Mis turnos' : 'Agenda clínica', 'Consulta las citas programadas y su estado.')}${renderizarIndicadores([['Turnos de hoy', String(turnos.length), 'En agenda', '◷'], ['Confirmados', String(confirmados), 'Listos para atender', '✓'], ['Pendientes', String(pendientes), 'Por confirmar', '…'], ['Disponibilidad', '08–18 h', 'Horario de clínica', '＋']])}<section class="section-block"><div class="section-heading"><div><h2>Agenda de hoy</h2><p>Turnos y pacientes programados</p></div><span class="demo-label">Solo lectura</span></div><div class="appointment-list">${renderizarListaTurnos(datos.turnos, sesion.demostracion)}</div></section>`;
}
import { renderizarAgendaSemanal } from '../componentes/agenda-semanal.js';
import { renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { renderizarListaTurnos, turnosMostrados } from '../componentes/turnos.js';
import type { DatosPanel, Sesion } from '../tipos.js';

function descripcionAgenda(rol: Sesion['usuario']['rol']): string {
  if (rol === 'CLIENTE') {
    return 'Elige un horario disponible para reservar la consulta.';
  }
  return 'Organiza los turnos y publica horarios de atención.';
}

function renderizarResumen(datos: DatosPanel): string {
  const turnos = turnosMostrados(datos.turnos);
  const confirmados = turnos.filter(
    (turno) => turno.estado?.toUpperCase() === 'CONFIRMADO',
  ).length;
  const pendientes = turnos.filter(
    (turno) => turno.estado?.toUpperCase() === 'PENDIENTE',
  ).length;

  return renderizarIndicadores([
    ['Turnos', String(turnos.length), 'En agenda', '◷'],
    ['Confirmados', String(confirmados), 'Listos para atender', '✓'],
    ['Pendientes', String(pendientes), 'Por confirmar', '…'],
    [
      'Horarios disponibles',
      String(datos.agendas.length),
      'En el calendario',
      '＋',
    ],
  ]);
}

function renderizarTurnosReservados(
  datos: DatosPanel,
  sesion: Sesion,
): string {
  const turnos = renderizarListaTurnos(
    datos.turnos,
    true,
    sesion.usuario.rol,
    datos,
  );

  return `
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>Turnos reservados</h2>
          <p>Consultas programadas para tus pacientes.</p>
        </div>
      </div>
      <div class="appointment-list">${turnos}</div>
    </section>
  `;
}

export function renderizarPaginaTurnos(
  pagina: string,
  datos: DatosPanel,
  sesion: Sesion,
  desplazamientoSemana = 0,
): string {
  const titulo = pagina === 'Mis turnos' ? 'Mis turnos' : 'Agenda clínica';
  const descripcion = descripcionAgenda(sesion.usuario.rol);
  const agenda = renderizarAgendaSemanal(
    datos.agendas,
    turnosMostrados(datos.turnos),
    datos,
    sesion.usuario.rol,
    desplazamientoSemana,
  );

  return `
    ${renderizarEncabezado(titulo, descripcion)}
    ${renderizarResumen(datos)}
    ${agenda}
    ${renderizarTurnosReservados(datos, sesion)}
  `;
}

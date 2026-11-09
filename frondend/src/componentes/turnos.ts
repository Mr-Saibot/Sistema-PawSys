import { escaparHtml } from '../utilidades/formato-html.js';
import { botonDetalle } from './detalle-registro.js';
import type { DatosPanel, Rol, Turno } from '../tipos.js';

function filasTurnos(turnos: Turno[]): string {
  const filas = turnos;
  if (!filas.length) return '<div class="empty-state">No hay turnos disponibles.</div>';
  return filas.map((turno) => {
    const hora = turno.hora || (turno.fecha ? new Date(turno.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '—');
    const nombreMascota = typeof turno.mascota === 'string' ? turno.mascota : turno.mascota?.nombre || 'Paciente';
    const persona = turno.persona || (turno.veterinario ? `Dr. ${turno.veterinario.nombre} ${turno.veterinario.apellido}` : 'Equipo veterinario');
    return `<div class="appointment-item"><div class="time-box">${escaparHtml(hora)}</div><div class="appointment-detail"><strong>${escaparHtml(nombreMascota)} · ${escaparHtml(turno.motivo || 'Consulta')}</strong><span>${escaparHtml(persona)}</span></div><span class="tag ${turno.estado === 'PENDIENTE' ? 'orange' : ''}">${escaparHtml(turno.estado || 'PENDIENTE')}</span></div>`;
  }).join('');
}

export function renderizarSeccionTurnos(turnos: Turno[], titulo = 'Próximos turnos'): string {
  return `<section class="section-block"><div class="section-heading"><div><h2>${escaparHtml(titulo)}</h2><p>Agenda de atención</p></div><button class="section-link" data-pagina="Agenda">Ver agenda</button></div><div class="appointment-list">${filasTurnos(turnos)}</div></section>`;
}

export function renderizarListaTurnos(
  turnos: Turno[],
  puedeCancelar = false,
  rol?: Rol,
  datos?: DatosPanel,
): string {
  const filas = turnos;
  if (!filas.length) return '<div class="empty-state">No hay turnos disponibles.</div>';
  return filas.map((turno) => {
    const hora = turno.hora || (turno.fecha ? new Date(turno.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '—');
    const nombreMascota = typeof turno.mascota === 'string' ? turno.mascota : turno.mascota?.nombre || 'Paciente';
    const persona = turno.persona || (turno.veterinario ? `Dr. ${turno.veterinario.nombre} ${turno.veterinario.apellido}` : 'Equipo veterinario');
    const camposAdmin = rol === 'ADMINISTRADOR' && datos
      ? `<label class="field">Veterinario<select name="veterinarioId" required>${datos.veterinarios.map((veterinario) => `<option value="${veterinario.id}" ${veterinario.id === turno.veterinarioId ? 'selected' : ''}>${escaparHtml(veterinario.nombre)} ${escaparHtml(veterinario.apellido)}</option>`).join('')}</select></label><label class="field">Horario disponible<select name="agendaId"><option value="">Sin cambios</option>${datos.agendas.map((agenda) => `<option value="${agenda.id}" ${agenda.id === turno.agendaId ? 'selected' : ''}>${new Date(agenda.fecha).toLocaleDateString('es-PY')} · ${escaparHtml(agenda.horario)}</option>`).join('')}</select></label>`
      : '';
    const editar = turno.id && rol && rol !== 'CLIENTE'
      ? `<details class="record-editor"><summary class="text-button">Editar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/turnos/${turno.id}" data-method="PATCH"><label class="field">Mascota<select name="mascotaId" required>${(datos?.mascotas || []).map((mascota) => `<option value="${mascota.id}" ${mascota.id === turno.mascotaId ? 'selected' : ''}>${escaparHtml(mascota.nombre)}</option>`).join('')}</select></label>${camposAdmin}<label class="field">Fecha<input name="fecha" type="date" value="${escaparHtml(turno.fecha?.slice(0, 10) || '')}" required /></label><label class="field">Hora<input name="hora" type="time" value="${escaparHtml(turno.hora || '')}" required /></label><label class="field">Motivo<input name="motivo" data-nullable value="${escaparHtml(turno.motivo || '')}" /></label><button class="primary-button" type="submit">Guardar cambios</button><div class="login-error" role="alert"></div></form></details>`
      : turno.id && rol === 'CLIENTE' && turno.estado !== 'CANCELADO'
        ? `<details class="record-editor"><summary class="text-button">Reprogramar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/turnos/${turno.id}/reprogramar" data-method="PATCH"><label class="field">Nueva fecha<input name="fecha" type="date" min="${new Date().toISOString().slice(0, 10)}" required /></label><label class="field">Nueva hora<input name="hora" type="time" required /></label><button class="primary-button" type="submit">Reprogramar</button><div class="login-error" role="alert"></div></form></details>`
        : '';
    const cancelar = puedeCancelar && turno.id && turno.estado !== 'CANCELADO' ? `<button class="text-button" type="button" data-cancelar-turno="${turno.id}">Cancelar</button>` : '';
    const eliminar = rol === 'ADMINISTRADOR' && turno.id ? `<button class="text-button danger-button" type="button" data-api-delete="/turnos/${turno.id}" data-confirm="¿Eliminar permanentemente el turno de ${escaparHtml(nombreMascota)}?">Eliminar</button>` : '';
    const detalle = turno.id ? botonDetalle(`/turnos/${turno.id}`, `Detalle de turno de ${nombreMascota}`) : '';
    const acciones = `<div class="record-actions">${detalle}${editar}${cancelar}${eliminar}</div>`;
    return `<div class="appointment-item"><div class="time-box">${escaparHtml(hora)}</div><div class="appointment-detail"><strong>${escaparHtml(nombreMascota)} · ${escaparHtml(turno.motivo || 'Consulta')}</strong><span>${escaparHtml(persona)}</span><span>${escaparHtml(turno.fecha ? new Date(turno.fecha).toLocaleDateString('es-PY') : '')}</span></div><span class="tag ${turno.estado === 'PENDIENTE' ? 'orange' : ''}">${escaparHtml(turno.estado || 'PENDIENTE')}</span>${acciones}</div>`;
  }).join('');
}

export function turnosMostrados(turnos: Turno[]): Turno[] {
  return turnos;
}
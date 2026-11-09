import { renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { turnosMostrados, renderizarListaTurnos } from '../componentes/turnos.js';
import { botonDetalle } from '../componentes/detalle-registro.js';
import type { Agenda, DatosPanel, Sesion } from '../tipos.js';

function renderizarAgendas(datos: DatosPanel, sesion: Sesion): string {
  const puedeEditar = sesion.usuario.rol === 'ADMINISTRADOR';
  const nuevaAgenda = puedeEditar
    ? '<form class="form-grid" data-api-form data-endpoint="/agendas" data-method="POST"><label class="field">Fecha<input name="fecha" type="date" min="' + new Date().toISOString().slice(0, 10) + '" required /></label><label class="field">Horario<input name="horario" type="time" required /></label><button class="primary-button" type="submit">Agregar horario</button><div class="login-error" role="alert"></div></form>'
    : '';
  const filas = datos.agendas.length
    ? datos.agendas.map((agenda: Agenda) => `<tr><td>${new Date(agenda.fecha).toLocaleDateString('es-PY')}</td><td>${agenda.horario}</td><td>${agenda.turnos?.length || 0}</td><td>${botonDetalle(`/agendas/${agenda.id}`, 'Detalle del horario')}${puedeEditar ? `<details class="record-editor"><summary class="text-button">Editar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/agendas/${agenda.id}" data-method="PATCH"><label class="field">Fecha<input name="fecha" type="date" value="${agenda.fecha.slice(0, 10)}" required /></label><label class="field">Horario<input name="horario" type="time" value="${agenda.horario}" required /></label><button class="primary-button" type="submit">Guardar cambios</button><div class="login-error" role="alert"></div></form></details><button class="text-button danger-button" type="button" data-api-delete="/agendas/${agenda.id}" data-confirm="¿Eliminar el horario del ${new Date(agenda.fecha).toLocaleDateString('es-PY')}?">Eliminar</button>` : ''}</td></tr>`).join('')
    : `<tr><td colspan="${puedeEditar ? 4 : 3}"><div class="empty-state">No hay horarios cargados.</div></td></tr>`;
  return `<section class="section-block"><div class="section-heading"><div><h2>Horarios disponibles</h2><p>Los horarios se mantienen por separado de las reservas.</p></div></div>${nuevaAgenda}<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Horario</th><th>Turnos asociados</th><th>Acciones</th></tr></thead><tbody>${filas}</tbody></table></div></section>`;
}

export function renderizarPaginaTurnos(pagina: string, datos: DatosPanel, sesion: Sesion): string {
  const turnos = turnosMostrados(datos.turnos);
  const confirmados = turnos.filter((turno) => (turno.estado || '').toUpperCase() === 'CONFIRMADO').length;
  const pendientes = turnos.filter((turno) => (turno.estado || '').toUpperCase() === 'PENDIENTE').length;
  const formulario = datos.mascotas.length === 0
      ? '<div class="notice">Primero registra una mascota para solicitar un turno.</div>'
      : `<section class="section-block"><div class="section-heading"><div><h2>Solicitar turno</h2><p>La clínica confirmará la disponibilidad.</p></div></div><form id="turno-form" class="form-grid"><label class="field">Mascota<select name="mascotaId" required>${datos.mascotas.map((mascota) => `<option value="${mascota.id}">${mascota.nombre}</option>`).join('')}</select></label>${sesion.usuario.rol === 'VETERINARIO' ? '' : `<label class="field">Veterinario<select name="veterinarioId" required>${datos.veterinarios.map((veterinario) => `<option value="${veterinario.id}">${veterinario.nombre} ${veterinario.apellido} · ${veterinario.especialidad || 'General'}</option>`).join('')}</select></label>`}<label class="field">Fecha<input name="fecha" type="date" min="${new Date().toISOString().slice(0, 10)}" required /></label><label class="field">Hora<input name="hora" type="time" required /></label><label class="field">Motivo<input name="motivo" maxlength="160" /></label><button class="primary-button" type="submit">Solicitar turno</button><div class="login-error" role="alert"></div></form></section>`;
  const turnosSection = `<section class="section-block"><div class="section-heading"><div><h2>Agenda</h2><p>Turnos y pacientes programados</p></div></div><div class="appointment-list">${renderizarListaTurnos(datos.turnos, true, sesion.usuario.rol, datos)}</div></section>`;
  return `${renderizarEncabezado(pagina === 'Mis turnos' ? 'Mis turnos' : 'Agenda clínica', 'Consulta y gestiona las citas programadas.')}${renderizarIndicadores([['Turnos', String(turnos.length), 'En agenda', '◷'], ['Confirmados', String(confirmados), 'Listos para atender', '✓'], ['Pendientes', String(pendientes), 'Por confirmar', '…'], ['Disponibilidad', '08–18 h', 'Horario de clínica', '＋']])}${formulario}${turnosSection}${pagina === 'Agenda' ? renderizarAgendas(datos, sesion) : ''}`;
}
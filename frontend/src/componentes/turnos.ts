import { escaparHtml } from '../utilidades/formato-html.js';
import { botonDetalle } from './detalle-registro.js';
import type { DatosPanel, Rol, Turno } from '../tipos.js';

function nombreMascota(turno: Turno): string {
  if (typeof turno.mascota === 'string') {
    return turno.mascota;
  }
  return turno.mascota?.nombre || 'Paciente';
}

function nombreVeterinario(turno: Turno): string {
  if (!turno.veterinario) {
    return 'Equipo veterinario';
  }
  return `Dr. ${turno.veterinario.nombre} ${turno.veterinario.apellido}`;
}

function fechaTurno(turno: Turno): string {
  if (!turno.fecha) {
    return '';
  }
  return new Date(turno.fecha).toLocaleDateString('es-PY', {
    timeZone: 'UTC',
  });
}

function opcionesMascotas(turno: Turno, datos: DatosPanel): string {
  return datos.mascotas.map((mascota) => {
    const seleccionada = mascota.id === turno.mascotaId
      ? 'selected'
      : '';
    return `
      <option value="${mascota.id}" ${seleccionada}>
        ${escaparHtml(mascota.nombre)}
      </option>
    `;
  }).join('');
}

function formularioEdicion(
  turno: Turno,
  datos: DatosPanel,
): string {
  if (!turno.id) {
    return '';
  }

  const mascotas = opcionesMascotas(turno, datos);
  const fecha = escaparHtml(turno.fecha?.slice(0, 10) || '');
  const hora = escaparHtml(turno.hora || '');
  const motivo = escaparHtml(turno.motivo || '');

  return `
    <details class="record-editor">
      <summary class="text-button">Editar</summary>
      <form
        class="form-grid compact-form"
        data-api-form
        data-endpoint="/turnos/${turno.id}"
        data-method="PATCH"
      >
        <label class="field">
          Mascota
          <select name="mascotaId" required>${mascotas}</select>
        </label>
        <label class="field">
          Fecha
          <input name="fecha" type="date" value="${fecha}" required />
        </label>
        <label class="field">
          Hora
          <input name="hora" type="time" value="${hora}" required />
        </label>
        <label class="field">
          Motivo
          <input name="motivo" data-nullable value="${motivo}" />
        </label>
        <button class="primary-button" type="submit">
          Guardar cambios
        </button>
        <div class="login-error" role="alert"></div>
      </form>
    </details>
  `;
}

function botonCancelacion(turno: Turno): string {
  return `
    <button
      class="text-button"
      type="button"
      data-cancelar-turno="${turno.id}"
    >
      Cancelar
    </button>
  `;
}

function botonEliminacion(turno: Turno): string {
  const mascota = escaparHtml(nombreMascota(turno));
  return `
    <button
      class="text-button danger-button"
      type="button"
      data-api-delete="/turnos/${turno.id}"
      data-confirm="¿Eliminar permanentemente el turno de ${mascota}?"
    >
      Eliminar
    </button>
  `;
}

function accionesTurno(
  turno: Turno,
  puedeCancelar: boolean,
  rol?: Rol,
  datos?: DatosPanel,
): string {
  if (!turno.id) {
    return '';
  }

  const detalle = botonDetalle(
    `/turnos/${turno.id}`,
    `Detalle de turno de ${nombreMascota(turno)}`,
  );
  const edicion = rol !== 'CLIENTE' && datos
    ? formularioEdicion(turno, datos)
    : '';
  const cancelacion = puedeCancelar && turno.estado !== 'CANCELADO'
    ? botonCancelacion(turno)
    : '';
  const eliminacion = rol === 'ADMINISTRADOR'
    ? botonEliminacion(turno)
    : '';

  return `
    <div class="record-actions">
      ${detalle}
      ${edicion}
      ${cancelacion}
      ${eliminacion}
    </div>
  `;
}

function renderizarFila(turno: Turno, acciones = ''): string {
  const mascota = escaparHtml(nombreMascota(turno));
  const motivo = escaparHtml(turno.motivo || 'Consulta');
  const veterinario = escaparHtml(nombreVeterinario(turno));
  const fecha = escaparHtml(fechaTurno(turno));
  const hora = escaparHtml(turno.hora || '—');
  const estado = escaparHtml(turno.estado || 'PENDIENTE');
  const claseEstado = turno.estado === 'PENDIENTE' ? 'orange' : '';

  return `
    <div class="appointment-item">
      <div class="time-box">${hora}</div>
      <div class="appointment-detail">
        <strong>${mascota} · ${motivo}</strong>
        <span>${veterinario}</span>
        <span>${fecha}</span>
      </div>
      <span class="tag ${claseEstado}">${estado}</span>
      ${acciones}
    </div>
  `;
}

function filasTurnos(turnos: Turno[]): string {
  if (!turnos.length) {
    return '<div class="empty-state">No hay turnos disponibles.</div>';
  }
  return turnos.map((turno) => renderizarFila(turno)).join('');
}

export function renderizarSeccionTurnos(
  turnos: Turno[],
  titulo = 'Próximos turnos',
): string {
  const contenido = filasTurnos(turnos);

  return `
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>${escaparHtml(titulo)}</h2>
          <p>Agenda de atención</p>
        </div>
        <button class="section-link" data-pagina="Agenda">
          Ver agenda
        </button>
      </div>
      <div class="appointment-list">${contenido}</div>
    </section>
  `;
}

export function renderizarListaTurnos(
  turnos: Turno[],
  puedeCancelar = false,
  rol?: Rol,
  datos?: DatosPanel,
): string {
  if (!turnos.length) {
    return '<div class="empty-state">No hay turnos disponibles.</div>';
  }

  return turnos.map((turno) => {
    const acciones = accionesTurno(
      turno,
      puedeCancelar,
      rol,
      datos,
    );
    return renderizarFila(turno, acciones);
  }).join('');
}

export function turnosMostrados(turnos: Turno[]): Turno[] {
  return [...turnos].sort((primero, segundo) => {
    const fechaPrimero = `${primero.fecha || ''}T${primero.hora || ''}`;
    const fechaSegundo = `${segundo.fecha || ''}T${segundo.hora || ''}`;
    return fechaPrimero.localeCompare(fechaSegundo);
  });
}

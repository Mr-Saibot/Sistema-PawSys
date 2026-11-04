import { turnosDemo } from '../datos/datos-demostracion.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type { Turno } from '../tipos.js';

function listaTurnos(turnos: Turno[], demostracion: boolean): Turno[] {
  return turnos.length ? turnos : demostracion ? turnosDemo : [];
}

function filasTurnos(turnos: Turno[], demostracion: boolean): string {
  const filas = listaTurnos(turnos, demostracion);
  if (!filas.length) return '<div class="empty-state">No hay turnos disponibles.</div>';
  return filas.map((turno) => {
    const hora = turno.hora || (turno.fecha ? new Date(turno.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '—');
    const nombreMascota = typeof turno.mascota === 'string' ? turno.mascota : turno.mascota?.nombre || 'Paciente';
    const persona = turno.persona || (turno.veterinario ? `Dr. ${turno.veterinario.nombre} ${turno.veterinario.apellido}` : 'Equipo veterinario');
    return `<div class="appointment-item"><div class="time-box">${escaparHtml(hora)}</div><div class="appointment-detail"><strong>${escaparHtml(nombreMascota)} · ${escaparHtml(turno.motivo || 'Consulta')}</strong><span>${escaparHtml(persona)}</span></div><span class="tag ${turno.estado === 'PENDIENTE' ? 'orange' : ''}">${escaparHtml(turno.estado || 'PENDIENTE')}</span></div>`;
  }).join('');
}

export function renderizarSeccionTurnos(turnos: Turno[], demostracion: boolean, titulo = 'Próximos turnos'): string {
  return `<section class="section-block"><div class="section-heading"><div><h2>${escaparHtml(titulo)}</h2><p>Agenda de atención de hoy</p></div><button class="section-link" data-pagina="Agenda">Ver agenda</button></div><div class="appointment-list">${filasTurnos(turnos, demostracion)}</div></section>`;
}

export function renderizarListaTurnos(turnos: Turno[], demostracion: boolean): string {
  return filasTurnos(turnos, demostracion);
}

export function turnosMostrados(turnos: Turno[], demostracion: boolean): Turno[] {
  return listaTurnos(turnos, demostracion);
}
import { turnosDemo } from '../datos/datos-demostracion.js';
import { renderizarBanner, renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { mascotasDemoCliente, renderizarTarjetasMascotas } from '../componentes/mascotas.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type { DatosPanel, Sesion } from '../tipos.js';

export function renderizarPanelCliente(nombre: string, datos: DatosPanel, sesion: Sesion): string {
  const mascotas = sesion.demostracion ? mascotasDemoCliente(nombre) : datos.mascotas;
  const turno = sesion.demostracion ? turnosDemo[0] : null;
  const mensajeMascotas = datos.errorConexion ? 'No se pudieron cargar tus mascotas. Comprueba la conexión e inténtalo de nuevo.' : 'Todavía no hay mascotas vinculadas a tu cuenta.';
  const contenidoTurno = turno
    ? `<div class="appointment-list"><div class="appointment-item"><div class="time-box">${turno.hora}</div><div class="appointment-detail"><strong>${escaparHtml(String(turno.mascota))} · ${escaparHtml(turno.motivo)}</strong><span>${escaparHtml(turno.persona)}</span></div></div></div>`
    : '<div class="empty-state">La consulta de turnos propios aún no está disponible.</div>';

  return `${renderizarEncabezado('Mi espacio', 'La salud de tus compañeros, organizada en un solo lugar.')}${renderizarBanner(`Hola, ${nombre.split(' ')[0]}`, 'Revisa los datos y cuidados de tus mascotas.')}${renderizarIndicadores([['Mis mascotas', String(mascotas.length), 'En tu familia', '♡'], ['Próxima cita', turno ? `${turno.hora} · Hoy` : 'Sin datos', turno?.motivo || 'Consulta con la clínica', '◷'], ['Vacunas al día', sesion.demostracion ? '1 de 2' : '—', sesion.demostracion ? 'Revisa el calendario' : 'Sin datos disponibles', '＋'], ['Última visita', sesion.demostracion ? '12 sep' : '—', sesion.demostracion ? 'Consulta general' : 'Sin datos disponibles', '▤']])}<div class="content-grid"><section class="section-block"><div class="section-heading"><div><h2>Mis mascotas</h2><p>Información y cuidados</p></div></div>${mascotas.length ? `<div class="pet-grid">${renderizarTarjetasMascotas(mascotas)}</div>` : `<div class="empty-state">${escaparHtml(mensajeMascotas)}</div>`}${sesion.demostracion ? '<div class="notice">Los datos de esta pantalla son de demostración.</div>' : ''}</section><section class="section-block"><div class="section-heading"><div><h2>Próxima cita</h2><p>Tu agenda veterinaria</p></div></div>${contenidoTurno}<div class="notice">Para solicitar o cambiar un turno, comunícate con la clínica.</div></section></div>`;
}
import { renderizarBanner, renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { renderizarTarjetasMascotas } from '../componentes/mascotas.js';
import { renderizarListaTurnos } from '../componentes/turnos.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type { DatosPanel, Sesion } from '../tipos.js';

export function renderizarPanelCliente(nombre: string, datos: DatosPanel, sesion: Sesion): string {
  const siguienteTurno = datos.turnos
    .filter((turno) => turno.estado !== 'CANCELADO')
    .sort((a, b) => new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime())[0];
  const mascotas = datos.mascotas;
  const mensajeMascotas = datos.errorConexion
    ? 'No se pudieron cargar tus mascotas. Comprueba la conexión e inténtalo de nuevo.'
    : 'Todavía no hay mascotas vinculadas a tu cuenta.';

  return `${renderizarEncabezado('Mi espacio', 'La salud de tus compañeros, organizada en un solo lugar.')}${renderizarBanner(`Hola, ${nombre.split(' ')[0]}`, 'Revisa tus mascotas y los turnos de atención.')}${renderizarIndicadores([
    ['Mis mascotas', String(mascotas.length), 'En tu familia', '♡'],
    ['Próxima cita', siguienteTurno ? new Date(siguienteTurno.fecha || '').toLocaleDateString('es-PY') : 'Sin turnos', siguienteTurno?.hora || 'Agenda una visita', '◷'],
    ['Turnos activos', String(datos.turnos.filter((turno) => turno.estado !== 'CANCELADO').length), 'En tu agenda', '＋'],
    ['Historias clínicas', 'Consulta en clínica', 'Tu veterinario tiene los detalles', '▤'],
  ])}<div class="content-grid"><section class="section-block"><div class="section-heading"><div><h2>Mis mascotas</h2><p>Información y cuidados</p></div><button class="section-link" data-pagina="Mis mascotas">Ver mascotas</button></div>${mascotas.length ? `<div class="pet-grid">${renderizarTarjetasMascotas(mascotas)}</div>` : `<div class="empty-state">${escaparHtml(mensajeMascotas)}</div>`}</section><section class="section-block"><div class="section-heading"><div><h2>Mis próximos turnos</h2><p>Agenda de atención</p></div><button class="section-link" data-pagina="Mis turnos">Ver turnos</button></div>${datos.turnos.length ? `<div class="appointment-list">${renderizarListaTurnos(datos.turnos, true, 'CLIENTE', datos)}</div>` : '<div class="empty-state">Todavía no tenés turnos. Elegí “Mis turnos” para solicitar uno.</div>'}</section></div>`;
}

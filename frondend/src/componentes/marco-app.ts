import { nombresRoles } from '../constantes.js';
import { escaparHtml, iniciales } from '../utilidades/formato-html.js';
import type { DatosPanel, Rol } from '../tipos.js';

const navegacionRoles: Record<Rol, [string, string][]> = {
  CLIENTE: [['Inicio', '⌂'], ['Mis mascotas', '♡'], ['Mis turnos', '◷'], ['Pagos', '$']],
  VETERINARIO: [['Inicio', '⌂'], ['Pacientes', '✚'], ['Agenda', '◷'], ['Historias clínicas', '▤']],
  ADMINISTRADOR: [['Inicio', '⌂'], ['Pacientes', '✚'], ['Agenda', '◷'], ['Historias clínicas', '▤'], ['Clientes', '♙'], ['Equipo', '＋'], ['Administradores', '⚙'], ['Caja', '$']],
};

export function paginaDisponibleParaRol(rol: Rol, pagina: string): boolean {
  return navegacionRoles[rol].some(([etiqueta]) => etiqueta === pagina);
}

export function renderizarMarcoApp(rol: Rol, nombre: string, pagina: string, datos: DatosPanel, contenido: string): string {
  const navegacion = navegacionRoles[rol].map(([etiqueta, simbolo]) => `<button class="nav-item ${pagina === etiqueta ? 'active' : ''}" data-pagina="${escaparHtml(etiqueta)}"><span class="nav-symbol" aria-hidden="true">${simbolo}</span>${escaparHtml(etiqueta)}</button>`).join('');
  const etiquetaConexion = datos.errorConexion ? 'Datos incompletos' : datos.conectado ? 'Conectado al backend' : 'API sin datos';
  const avisoConexion = datos.errorRecursos.length
    ? `<div class="notice notice-error">No se cargaron algunos datos: ${escaparHtml(datos.errorRecursos.join(' · '))}</div>`
    : '';
  return `<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>PawSys</span></div><p class="nav-caption">Menú principal</p><nav class="nav-list" aria-label="Navegación principal">${navegacion}</nav><div class="sidebar-bottom"><div class="clinic-card"><strong>Clínica PawSys</strong><span>Atención de lunes a sábado<br />08:00 – 18:00</span></div><div class="profile-row"><div class="avatar">${escaparHtml(iniciales(nombre))}</div><div class="profile-copy"><strong>${escaparHtml(nombre)}</strong><span>${nombresRoles[rol]}</span></div><button class="logout-button" data-accion="logout" title="Cerrar sesión" aria-label="Cerrar sesión">Salir</button></div></div></aside><section class="main-area"><header class="topbar"><div class="topbar-actions"><button class="icon-button mobile-menu" data-accion="menu" aria-label="Abrir menú">☰</button><span class="breadcrumb">PawSys <span> / ${escaparHtml(pagina)}</span></span></div><div class="topbar-actions"><span class="connection-status"><i class="status-dot ${datos.conectado && !datos.errorConexion ? 'online' : ''}"></i>${etiquetaConexion}</span><button class="icon-button" data-accion="refresh" title="Actualizar datos" aria-label="Actualizar datos">↻</button></div></header>${avisoConexion}<div id="page-content" class="fade-in">${contenido}</div></section><dialog id="detail-dialog" class="record-dialog" aria-labelledby="detail-title"><div class="section-heading"><h2 id="detail-title">Detalle del registro</h2><button class="icon-button" type="button" data-accion="cerrar-detalle" aria-label="Cerrar detalle">×</button></div><div id="detail-content" class="detail-content"></div></dialog></div>`;
}
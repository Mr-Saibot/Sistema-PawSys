import { renderizarEncabezado } from '../componentes/panel.js';
import { renderizarFilasMascotas } from '../componentes/mascotas.js';
import type { DatosPanel, Rol, Sesion } from '../tipos.js';

export function renderizarPaginaMascotas(rol: Rol, datos: DatosPanel, sesion: Sesion): string {
  const mascotas = rol === 'CLIENTE' && sesion.demostracion
    ? datos.mascotas.filter((mascota) => typeof mascota.cliente === 'string' && mascota.cliente === sesion.usuario.nombreDemostracion)
    : datos.mascotas.length ? datos.mascotas : sesion.demostracion ? datos.mascotas : [];
  const titulo = rol === 'CLIENTE' ? 'Mis mascotas' : 'Pacientes';
  const mensajeVacio = datos.errorConexion
    ? 'No se pudieron cargar tus mascotas. Comprueba la conexión e inténtalo de nuevo.'
    : 'No hay datos disponibles. Comprueba la conexión con el backend.';

  return `${renderizarEncabezado(titulo, 'Consulta la información registrada de cada paciente.', '<span class="demo-label">Solo lectura</span>')}<section class="section-block"><div class="section-heading"><div><h2>Directorio de pacientes</h2><p>${mascotas.length} registros disponibles</p></div><input id="patient-search" class="search-field" type="search" placeholder="Buscar paciente…" aria-label="Buscar paciente" /></div><div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Especie</th><th>Peso</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>${renderizarFilasMascotas(mascotas)}</tbody></table></div>${!sesion.demostracion && !mascotas.length ? `<div class="empty-state">${mensajeVacio}</div>` : ''}</section>`;
}
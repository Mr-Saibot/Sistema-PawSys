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

  const puedeGestionar = rol === 'ADMINISTRADOR' || rol === 'VETERINARIO';
  const puedeEditar = !sesion.demostracion;
  const selectorResponsable = rol === 'CLIENTE'
    ? ''
    : `<label class="field">Responsable<select id="mascota-cliente" required>${datos.clientes.map((cliente) => `<option value="${cliente.id}">${cliente.nombre} ${cliente.apellido}</option>`).join('')}</select></label>`;
  const formulario = sesion.demostracion ? '<div class="notice">El modo demostración es de solo lectura.</div>' : `<section class="section-block"><div class="section-heading"><div><h2>Registrar mascota</h2><p>Agrega un paciente a la ficha de su responsable.</p></div></div>${puedeGestionar && !datos.clientes.length ? '<div class="empty-state">Registra primero un cliente para poder asignarle una mascota.</div>' : `<form id="mascota-form" class="form-grid">${selectorResponsable}<label class="field">Nombre<input name="nombre" required maxlength="80" /></label><label class="field">Especie<input name="especie" required maxlength="40" placeholder="Perro, gato…" /></label><label class="field">Raza<input name="raza" maxlength="80" /></label><label class="field">Peso (kg)<input name="peso" type="number" min="0" step="0.1" /></label><label class="field">Fecha de nacimiento<input name="fechaNacimiento" type="date" /></label><label class="field">Observaciones<input name="observaciones" maxlength="500" /></label><button class="primary-button" type="submit">Guardar mascota</button><div class="login-error" role="alert"></div></form>`}</section>`;
  const columnas = puedeEditar ? '<th>Acciones</th>' : '';
  return `${renderizarEncabezado(titulo, 'Consulta y gestiona la información de cada paciente.')}${formulario}<section class="section-block"><div class="section-heading"><div><h2>Directorio de pacientes</h2><p>${mascotas.length} registros disponibles</p></div><input id="patient-search" class="search-field" type="search" placeholder="Buscar paciente…" aria-label="Buscar paciente" /></div><div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Especie</th><th>Peso</th><th>Responsable</th><th>Estado</th>${columnas}</tr></thead><tbody>${renderizarFilasMascotas(mascotas, puedeGestionar && puedeEditar, datos.clientes, puedeEditar)}</tbody></table></div>${!sesion.demostracion && !mascotas.length ? `<div class="empty-state">${mensajeVacio}</div>` : ''}</section>`;
}
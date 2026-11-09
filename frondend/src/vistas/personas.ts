import { escaparHtml } from '../utilidades/formato-html.js';
import { renderizarEncabezado } from '../componentes/panel.js';
import { botonDetalle } from '../componentes/detalle-registro.js';
import type { Administrador, Persona, Sesion } from '../tipos.js';

function formularioPersonal(titulo: string): string {
  const soloAdministrador = titulo === 'Administradores';
  return `<section class="section-block"><div class="section-heading"><div><h2>Crear cuenta del equipo</h2><p>El alta genera el usuario y el perfil en una sola operación.</p></div></div><form id="staff-form" class="form-grid">${soloAdministrador ? '<input type="hidden" name="rol" value="ADMINISTRADOR" />' : '<label class="field">Tipo de cuenta<select name="rol"><option value="VETERINARIO">Veterinario</option><option value="ADMINISTRADOR">Administrador</option></select></label>'}<label class="field">Nombre<input name="nombre" required minlength="2" /></label><label class="field">Apellido<input name="apellido" required minlength="2" /></label><label class="field">Correo<input name="correo" type="email" required /></label><label class="field">Contraseña temporal<input name="password" type="password" minlength="8" required /></label><label class="field">Teléfono<input name="telefono" /></label><label class="field">Dirección<input name="direccion" /></label>${soloAdministrador ? '' : '<label class="field">Especialidad<input name="especialidad" /></label><label class="field">Matrícula<input name="nroMatricula" /></label>'}<button class="primary-button" type="submit">Crear cuenta</button><div class="login-error" role="alert"></div></form></section>`;
}

function formularioNuevoCliente(): string {
  return `<section class="section-block"><div class="section-heading"><div><h2>Registrar cliente</h2><p>Se crea el acceso y el perfil del cliente en el mismo registro.</p></div></div><form id="cliente-admin-form" class="form-grid"><label class="field">Cédula<input name="cedulaIdentidad" required /></label><label class="field">Nombre<input name="nombre" required /></label><label class="field">Apellido<input name="apellido" required /></label><label class="field">Correo<input name="correo" type="email" required /></label><label class="field">Contraseña temporal<input name="password" type="password" minlength="8" required /></label><label class="field">Teléfono<input name="telefono" /></label><label class="field">Dirección<input name="direccion" /></label><button class="primary-button" type="submit">Crear cliente</button><div class="login-error" role="alert"></div></form></section>`;
}

function formularioEdicionCliente(persona: Persona): string {
  if (!persona.id) return '';
  return `<details class="record-editor"><summary class="text-button">Editar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/clientes/${persona.id}" data-method="PATCH"><label class="field">Cédula<input name="cedulaIdentidad" value="${escaparHtml(persona.cedulaIdentidad || '')}" required /></label><label class="field">Nombre<input name="nombre" value="${escaparHtml(persona.nombre)}" required /></label><label class="field">Apellido<input name="apellido" value="${escaparHtml(persona.apellido)}" required /></label><label class="field">Teléfono<input name="telefono" data-nullable value="${escaparHtml(persona.telefono || '')}" /></label><label class="field">Dirección<input name="direccion" data-nullable value="${escaparHtml(persona.direccion || '')}" /></label><button class="primary-button" type="submit">Guardar cambios</button><div class="login-error" role="alert"></div></form></details><button class="text-button danger-button" type="button" data-api-delete="/clientes/${persona.id}" data-confirm="¿Desactivar la cuenta de ${escaparHtml(persona.nombre)} ${escaparHtml(persona.apellido)}? No podrá volver a iniciar sesión.">Desactivar cuenta</button>`;
}

function formularioEdicionVeterinario(persona: Persona): string {
  if (!persona.id) return '';
  return `<details class="record-editor"><summary class="text-button">Editar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/veterinarios/${persona.id}" data-method="PATCH"><label class="field">Nombre<input name="nombre" value="${escaparHtml(persona.nombre)}" required /></label><label class="field">Apellido<input name="apellido" value="${escaparHtml(persona.apellido)}" required /></label><label class="field">Especialidad<input name="especialidad" value="${escaparHtml(persona.especialidad || '')}" required /></label><label class="field">Matrícula<input name="nroMatricula" value="${escaparHtml(persona.nroMatricula || '')}" required /></label><label class="field">Teléfono<input name="telefono" data-nullable value="${escaparHtml(persona.telefono || '')}" /></label><label class="field">Dirección<input name="direccion" data-nullable value="${escaparHtml(persona.direccion || '')}" /></label><button class="primary-button" type="submit">Guardar cambios</button><div class="login-error" role="alert"></div></form></details><button class="text-button danger-button" type="button" data-api-delete="/veterinarios/${persona.id}" data-confirm="¿Desactivar la cuenta de ${escaparHtml(persona.nombre)} ${escaparHtml(persona.apellido)}? No podrá volver a iniciar sesión.">Desactivar cuenta</button>`;
}

function formularioEdicionAdministrador(persona: Administrador, sesion: Sesion): string {
  if (!persona.id) return '';
  const puedeDesactivar = persona.usuarioId !== sesion.usuario.id;
  return `<details class="record-editor"><summary class="text-button">Editar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/administradores/${persona.id}" data-method="PATCH"><label class="field">Nombre<input name="nombre" value="${escaparHtml(persona.nombre)}" required /></label><label class="field">Apellido<input name="apellido" value="${escaparHtml(persona.apellido)}" required /></label><label class="field">Teléfono<input name="telefono" data-nullable value="${escaparHtml(persona.telefono || '')}" /></label><label class="field">Dirección<input name="direccion" data-nullable value="${escaparHtml(persona.direccion || '')}" /></label><button class="primary-button" type="submit">Guardar cambios</button><div class="login-error" role="alert"></div></form></details>${puedeDesactivar ? `<button class="text-button danger-button" type="button" data-api-delete="/administradores/${persona.id}" data-confirm="¿Desactivar la cuenta de ${escaparHtml(persona.nombre)} ${escaparHtml(persona.apellido)}? No podrá volver a iniciar sesión.">Desactivar cuenta</button>` : ''}`;
}

export function renderizarPaginaPersonas(titulo: string, personas: Persona[] | Administrador[], vacio: string, sesion: Sesion): string {
  const esCliente = titulo === 'Clientes';
  const esVeterinario = titulo === 'Equipo veterinario';
  const esAdministrador = titulo === 'Administradores';
  const filas = personas;
  const puedeEditar = sesion.usuario.rol === 'ADMINISTRADOR';
  const contenido = filas.length
    ? filas.map((persona) => {
      const email = escaparHtml(persona.correo);
      const especialidad = esVeterinario ? (persona as Persona).especialidad || '—' : email;
      const acciones = puedeEditar
        ? esCliente
          ? formularioEdicionCliente(persona as Persona)
          : esVeterinario
            ? formularioEdicionVeterinario(persona as Persona)
            : formularioEdicionAdministrador(persona as Administrador, sesion)
        : '';
      const recurso = esCliente ? 'clientes' : esVeterinario ? 'veterinarios' : 'administradores';
      const detalle = persona.id ? botonDetalle(`/${recurso}/${persona.id}`, 'Detalle del perfil') : '';
      return `<tr><td><div class="cell-primary">${escaparHtml(persona.nombre)} ${escaparHtml(persona.apellido)}</div><div class="cell-secondary">${email}</div></td><td>${escaparHtml(especialidad)}</td><td>${escaparHtml(persona.telefono || '—')}</td><td><span class="tag">Activo</span></td><td>${detalle}${acciones}</td></tr>`;
    }).join('')
    : `<tr><td colspan="${puedeEditar ? 5 : 4}"><div class="empty-state">${escaparHtml(vacio)}</div></td></tr>`;
  const altaCliente = puedeEditar && esCliente ? formularioNuevoCliente() : '';
  const altaPersonal = puedeEditar && (esVeterinario || esAdministrador) ? formularioPersonal(titulo) : '';
  const columnas = '<th>Acciones</th>';
  const encabezado = esAdministrador ? 'Administradores' : titulo;
  return `${renderizarEncabezado(encabezado, 'Directorio de personas registradas en la clínica.')}${altaCliente}${altaPersonal}<section class="section-block"><div class="section-heading"><div><h2>${escaparHtml(encabezado)}</h2><p>${filas.length} registros</p></div></div><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>${esVeterinario ? 'Especialidad' : 'Correo'}</th><th>Teléfono</th><th>Estado</th>${columnas}</tr></thead><tbody>${contenido}</tbody></table></div></section>`;
}

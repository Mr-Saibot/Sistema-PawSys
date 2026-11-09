import { fotos } from '../constantes.js';
import { botonDetalle } from './detalle-registro.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type { HistorialClinico, Mascota, Persona } from '../tipos.js';

function fotoMascota(mascota: Mascota): string {
  return mascota.foto || fotos[mascota.especie.toLowerCase() as keyof typeof fotos] || fotos.perro;
}

function nombreResponsable(mascota: Mascota): string {
  if (typeof mascota.cliente === 'string') return mascota.cliente;
  if (mascota.cliente) return `${mascota.cliente.nombre} ${mascota.cliente.apellido}`;
  return mascota.clienteNombre || '—';
}

export function renderizarFilasMascotas(
  mascotas: Mascota[],
  puedeGestionar = false,
  clientes: Persona[] = [],
  puedeEditar = false,
  historiales: HistorialClinico[] = [],
): string {
  if (!mascotas.length) return '<tr><td colspan="5"><div class="empty-state">Aún no hay pacientes registrados.</div></td></tr>';
  return mascotas.map((mascota) => {
    const responsable = nombreResponsable(mascota);
    const busqueda = `${mascota.nombre} ${mascota.especie} ${mascota.raza || ''} ${responsable}`.toLocaleLowerCase('es');
    const peso = mascota.peso ? `${mascota.peso} kg` : '—';
    const edicion = puedeEditar ? `<details class="record-editor"><summary class="text-button">Editar</summary><form class="form-grid compact-form" data-api-form data-endpoint="/mascotas/${mascota.id}" data-method="PATCH">${puedeGestionar ? `<label class="field">Responsable<select name="clienteId" required>${clientes.map((cliente) => `<option value="${cliente.id}" ${cliente.id === mascota.clienteId ? 'selected' : ''}>${escaparHtml(cliente.nombre)} ${escaparHtml(cliente.apellido)}</option>`).join('')}</select></label>` : ''}<label class="field">Nombre<input name="nombre" value="${escaparHtml(mascota.nombre)}" required /></label><label class="field">Especie<input name="especie" value="${escaparHtml(mascota.especie)}" required /></label><label class="field">Raza<input name="raza" data-nullable value="${escaparHtml(mascota.raza || '')}" /></label><label class="field">Peso (kg)<input name="peso" data-nullable type="number" min="0" step="0.1" value="${mascota.peso ?? ''}" /></label><label class="field">Fecha de nacimiento<input name="fechaNacimiento" type="date" value="${escaparHtml(mascota.fechaNacimiento?.slice(0, 10) || '')}" /></label><label class="field">Observaciones<input name="observaciones" data-nullable value="${escaparHtml(mascota.observaciones || '')}" /></label><button class="primary-button" type="submit">Guardar cambios</button><div class="login-error" role="alert"></div></form></details>` : '';
    const baja = puedeGestionar ? `<button class="text-button danger-button" type="button" data-eliminar-mascota="${mascota.id}">Dar de baja</button>` : '';
    const historia = historiales.find((item) => item.mascotaId === mascota.id);
    const detalleHistoria = historia ? botonDetalle(`/historiales-clinicos/mascota/${mascota.id}`, 'Historia clínica') : '';
    const acciones = `<td>${botonDetalle(`/mascotas/${mascota.id}`, `Detalle de ${mascota.nombre}`)}${detalleHistoria}${edicion}${baja}</td>`;
    return `<tr data-busqueda="${escaparHtml(busqueda)}"><td><div class="person-cell"><img class="pet-thumb" src="${escaparHtml(fotoMascota(mascota))}" alt="" onerror="this.style.visibility='hidden'" /><div><div class="cell-primary">${escaparHtml(mascota.nombre)}</div><div class="cell-secondary">${escaparHtml(mascota.raza || mascota.especie)}</div></div></div></td><td>${escaparHtml(mascota.especie)}</td><td>${escaparHtml(peso)}</td><td>${escaparHtml(responsable)}</td><td><span class="tag">${mascota.estado === false ? 'Inactivo' : 'Activo'}</span></td>${acciones}</tr>`;
  }).join('');
}

export function renderizarSeccionMascotas(mascotas: Mascota[], titulo = 'Pacientes recientes', compact = false): string {
  const filas = renderizarFilasMascotas(mascotas);
  return `<section class="section-block"><div class="section-heading"><div><h2>${escaparHtml(titulo)}</h2><p>Registro y seguimiento de pacientes</p></div>${compact ? '<button class="section-link" data-pagina="Pacientes">Ver todos</button>' : ''}</div><div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Especie</th><th>Peso</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>${filas}</tbody></table></div></section>`;
}

export function renderizarTarjetasMascotas(mascotas: Mascota[]): string {
  return mascotas.map((mascota) => `<article class="pet-card"><img src="${escaparHtml(fotoMascota(mascota))}" alt="${escaparHtml(mascota.nombre)}" onerror="this.style.visibility='hidden'" /><div class="pet-card-copy"><h3>${escaparHtml(mascota.nombre)}</h3><p>${escaparHtml(mascota.raza || mascota.especie)}${mascota.peso ? ` · ${escaparHtml(String(mascota.peso))} kg` : ''}</p><span class="tag">${mascota.estado === false ? 'Inactivo' : 'Activo'}</span></div></article>`).join('');
}

import { fotos } from '../constantes.js';
import { mascotasDemo } from '../datos/datos-demostracion.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type { Mascota } from '../tipos.js';

function fotoMascota(mascota: Mascota): string {
  return mascota.foto || fotos[mascota.especie.toLowerCase() as keyof typeof fotos] || fotos.perro;
}

function nombreResponsable(mascota: Mascota): string {
  if (typeof mascota.cliente === 'string') return mascota.cliente;
  if (mascota.cliente) return `${mascota.cliente.nombre} ${mascota.cliente.apellido}`;
  return mascota.clienteNombre || '—';
}

export function renderizarFilasMascotas(mascotas: Mascota[]): string {
  if (!mascotas.length) return '<tr><td colspan="5"><div class="empty-state">Aún no hay pacientes registrados.</div></td></tr>';
  return mascotas.map((mascota) => {
    const responsable = nombreResponsable(mascota);
    const busqueda = `${mascota.nombre} ${mascota.especie} ${mascota.raza || ''} ${responsable}`.toLocaleLowerCase('es');
    const peso = mascota.peso ? `${mascota.peso} kg` : '—';
    return `<tr data-busqueda="${escaparHtml(busqueda)}"><td><div class="person-cell"><img class="pet-thumb" src="${escaparHtml(fotoMascota(mascota))}" alt="" onerror="this.style.visibility='hidden'" /><div><div class="cell-primary">${escaparHtml(mascota.nombre)}</div><div class="cell-secondary">${escaparHtml(mascota.raza || mascota.especie)}</div></div></div></td><td>${escaparHtml(mascota.especie)}</td><td>${escaparHtml(peso)}</td><td>${escaparHtml(responsable)}</td><td><span class="tag">${mascota.estado === false ? 'Inactivo' : 'Activo'}</span></td></tr>`;
  }).join('');
}

export function renderizarSeccionMascotas(mascotas: Mascota[], titulo = 'Pacientes recientes', compact = false): string {
  const filas = renderizarFilasMascotas(mascotas);
  return `<section class="section-block"><div class="section-heading"><div><h2>${escaparHtml(titulo)}</h2><p>Registro y seguimiento de pacientes</p></div>${compact ? '<button class="section-link" data-pagina="Pacientes">Ver todos</button>' : ''}</div><div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Especie</th><th>Peso</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>${filas}</tbody></table></div></section>`;
}

export function renderizarTarjetasMascotas(mascotas: Mascota[]): string {
  return mascotas.map((mascota) => `<article class="pet-card"><img src="${escaparHtml(fotoMascota(mascota))}" alt="${escaparHtml(mascota.nombre)}" onerror="this.style.visibility='hidden'" /><div class="pet-card-copy"><h3>${escaparHtml(mascota.nombre)}</h3><p>${escaparHtml(mascota.raza || mascota.especie)}${mascota.peso ? ` · ${escaparHtml(String(mascota.peso))} kg` : ''}</p><span class="tag">${mascota.estado === false ? 'Inactivo' : 'Activo'}</span></div></article>`).join('');
}

export function mascotasDemoCliente(nombre: string): Mascota[] {
  return mascotasDemo.filter((mascota) => mascota.cliente === nombre);
}
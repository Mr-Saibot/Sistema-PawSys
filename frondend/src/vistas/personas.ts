import { escaparHtml } from '../utilidades/formato-html.js';
import { renderizarEncabezado } from '../componentes/panel.js';
import type { Persona } from '../tipos.js';

const clientesDemo: Persona[] = [
  { nombre: 'María Fernanda', apellido: 'Ríos', correo: 'maria.rios@correo.com', telefono: '+56 9 6123 4567' },
  { nombre: 'Andrés', apellido: 'Molina', correo: 'andres.molina@correo.com', telefono: '+56 9 7456 1234' },
];

const veterinariosDemo: Persona[] = [
  { nombre: 'Valentina', apellido: 'Cruz', especialidad: 'Medicina general', correo: 'v.cruz@pawsys.demo' },
  { nombre: 'Mateo', apellido: 'Silva', especialidad: 'Cirugía veterinaria', correo: 'm.silva@pawsys.demo' },
];

export function renderizarPaginaPersonas(titulo: string, personas: Persona[], vacio: string, demostracion: boolean): string {
  const esCliente = titulo === 'Clientes';
  const filas = personas.length ? personas : demostracion ? esCliente ? clientesDemo : veterinariosDemo : [];
  const contenido = filas.length
    ? filas.map((persona) => `<tr><td><div class="cell-primary">${escaparHtml(persona.nombre)} ${escaparHtml(persona.apellido)}</div><div class="cell-secondary">${escaparHtml(persona.correo)}</div></td><td>${escaparHtml(esCliente ? persona.correo : persona.especialidad || '—')}</td><td>${escaparHtml(persona.telefono || '—')}</td><td><span class="tag">Activo</span></td></tr>`).join('')
    : `<tr><td colspan="4"><div class="empty-state">${escaparHtml(vacio)}</div></td></tr>`;
  return `${renderizarEncabezado(titulo, 'Directorio de personas registradas en la clínica.')}<section class="section-block"><div class="section-heading"><div><h2>${escaparHtml(titulo)}</h2><p>${filas.length} registros</p></div><span class="demo-label">Solo lectura</span></div><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>${esCliente ? 'Correo' : 'Especialidad'}</th><th>Teléfono</th><th>Estado</th></tr></thead><tbody>${contenido}</tbody></table></div></section>`;
}
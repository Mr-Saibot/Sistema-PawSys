import { escaparHtml } from '../utilidades/formato-html.js';
import { renderizarSeccionTurnos } from './turnos.js';
import { renderizarSeccionMascotas } from './mascotas.js';
import type { DatosPanel } from '../tipos.js';

export function renderizarEncabezado(titulo: string, subtitulo: string, accion = ''): string {
  const fecha = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return `<div class="page-heading"><div><h1>${escaparHtml(titulo)}</h1><p>${escaparHtml(subtitulo)}</p></div><span class="date-label">${escaparHtml(fecha)}</span>${accion}</div>`;
}

export function renderizarBanner(saludo: string, mensaje: string): string {
  const ahora = new Date();
  const mes = new Intl.DateTimeFormat('es', { month: 'short' }).format(ahora).replace('.', '');
  const diaSemana = new Intl.DateTimeFormat('es', { weekday: 'long' }).format(ahora);
  return `<section class="welcome-banner"><div class="welcome-copy"><span>Clínica PawSys · ${escaparHtml(diaSemana)}</span><h2>${escaparHtml(saludo)}</h2><p>${escaparHtml(mensaje)}</p></div><div class="banner-date"><strong>${ahora.getDate()}</strong><span>${escaparHtml(mes)}</span></div></section>`;
}

export function renderizarIndicadores(elementos: [string, string, string, string][]): string {
  return `<section class="stats-grid">${elementos.map(([etiqueta, valor, nota, simbolo]) => `<article class="stat-card"><div class="stat-top"><span>${escaparHtml(etiqueta)}</span><span class="stat-icon">${simbolo}</span></div><div class="stat-value">${escaparHtml(valor)}</div><div class="stat-note">${escaparHtml(nota)}</div></article>`).join('')}</section>`;
}

export function renderizarInicioPanel(
  titulo: string,
  subtitulo: string,
  bienvenida: string,
  mensaje: string,
  indicadores: [string, string, string, string][],
  datos: DatosPanel,
): string {
  return `${renderizarEncabezado(titulo, subtitulo)}${renderizarBanner(bienvenida, mensaje)}${renderizarIndicadores(indicadores)}<div class="content-grid"><div>${renderizarSeccionMascotas(datos.mascotas.slice(0, 4), 'Pacientes recientes', true)}</div><div>${renderizarSeccionTurnos(datos.turnos, datos.demostracion ?? false)}</div></div>`;
}
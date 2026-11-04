import type { DatosPanel, Rol, Sesion } from '../tipos.js';
import { renderizarPanelAdministracion } from './panel-administracion.js';
import { renderizarPaginaTurnos } from './turnos.js';
import { renderizarCaja } from './caja.js';
import { renderizarPanelCliente } from './panel-cliente.js';
import { renderizarPaginaMascotas } from './mascotas.js';
import { renderizarPaginaPersonas } from './personas.js';
import { renderizarHistoriasClinicas } from './historias-clinicas.js';
import { renderizarPanelVeterinario } from './panel-veterinario.js';

export function renderizarContenidoPanel(rol: Rol, nombre: string, pagina: string, datos: DatosPanel, sesion: Sesion): string {
  if (pagina === 'Pacientes' || pagina === 'Mis mascotas') return renderizarPaginaMascotas(rol, datos, sesion);
  if (pagina === 'Agenda' || pagina === 'Mis turnos') return renderizarPaginaTurnos(pagina, datos, sesion);
  if (pagina === 'Historias clínicas') return renderizarHistoriasClinicas();
  if (pagina === 'Clientes') return renderizarPaginaPersonas('Clientes', datos.clientes, 'No hay clientes disponibles.', sesion.demostracion);
  if (pagina === 'Equipo') return renderizarPaginaPersonas('Equipo veterinario', datos.veterinarios, 'No hay profesionales disponibles.', sesion.demostracion);
  if (pagina === 'Caja') return renderizarCaja();
  if (rol === 'CLIENTE') return renderizarPanelCliente(nombre, datos, sesion);
  if (rol === 'VETERINARIO') return renderizarPanelVeterinario(nombre, { ...datos, demostracion: sesion.demostracion });
  return renderizarPanelAdministracion(nombre, { ...datos, demostracion: sesion.demostracion });
}
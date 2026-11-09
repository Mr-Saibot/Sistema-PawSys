import type { DatosPanel, Rol, Sesion } from '../tipos.js';
import { renderizarPanelAdministracion } from './panel-administracion.js';
import { renderizarPaginaTurnos } from './turnos.js';
import { renderizarCaja } from './caja.js';
import { renderizarPanelCliente } from './panel-cliente.js';
import { renderizarPaginaMascotas } from './mascotas.js';
import { renderizarPaginaPersonas } from './personas.js';
import { renderizarHistoriasClinicas } from './historias-clinicas.js';
import { renderizarPanelVeterinario } from './panel-veterinario.js';
import { renderizarPaginaPagos } from './pagos.js';
import type { ConfiguracionPagos, ReporteCaja } from '../tipos.js';
import { paginaDisponibleParaRol } from '../componentes/marco-app.js';

export function renderizarContenidoPanel(rol: Rol, nombre: string, pagina: string, datos: DatosPanel, sesion: Sesion, configuracionPagos?: ConfiguracionPagos | null, errorPagos = '', reporteCaja?: ReporteCaja | null): string {
  if (!paginaDisponibleParaRol(rol, pagina)) {
    pagina = 'Inicio';
  }
  if (pagina === 'Pacientes' || pagina === 'Mis mascotas') return renderizarPaginaMascotas(rol, datos, sesion);
  if (pagina === 'Agenda' || pagina === 'Mis turnos') return renderizarPaginaTurnos(pagina, datos, sesion);
  if (pagina === 'Historias clínicas') return renderizarHistoriasClinicas(datos, sesion);
  if (pagina === 'Clientes') return renderizarPaginaPersonas('Clientes', datos.clientes, 'No hay clientes disponibles.', sesion);
  if (pagina === 'Equipo') return renderizarPaginaPersonas('Equipo veterinario', datos.veterinarios, 'No hay profesionales disponibles.', sesion);
  if (pagina === 'Administradores') return renderizarPaginaPersonas('Administradores', datos.administradores, 'No hay administradores disponibles.', sesion);
  if (pagina === 'Caja') return renderizarCaja(datos, configuracionPagos, errorPagos, reporteCaja);
  if (pagina === 'Pagos') return renderizarPaginaPagos(configuracionPagos, errorPagos);
  if (rol === 'CLIENTE') return renderizarPanelCliente(nombre, datos, sesion);
  if (rol === 'VETERINARIO') return renderizarPanelVeterinario(nombre, datos);
  return renderizarPanelAdministracion(nombre, datos);
}
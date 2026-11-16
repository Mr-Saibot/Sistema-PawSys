import { escaparHtml } from '../utilidades/formato-html.js';

const etiquetas: Record<string, string> = {
  id: 'Identificador',
  correo: 'Correo',
  rol: 'Rol',
  estado: 'Estado',
  nombre: 'Nombre',
  apellido: 'Apellido',
  cedulaIdentidad: 'Cédula',
  telefono: 'Teléfono',
  direccion: 'Dirección',
  especialidad: 'Especialidad',
  nroMatricula: 'Matrícula',
  fecha: 'Fecha',
  fechaCreacion: 'Fecha de creación',
  fechaApertura: 'Apertura',
  fechaCierre: 'Cierre',
  fechaNacimiento: 'Fecha de nacimiento',
  especie: 'Especie',
  raza: 'Raza',
  peso: 'Peso',
  observaciones: 'Observaciones',
  hora: 'Hora',
  horario: 'Horario',
  motivo: 'Motivo',
  diagnostico: 'Diagnóstico',
  tratamiento: 'Tratamiento',
  costo: 'Costo',
  vacuna: 'Vacuna',
  proximaDosis: 'Próxima dosis',
  saldoInicial: 'Saldo inicial',
  saldoActual: 'Saldo actual',
  formaPago: 'Forma de pago',
  origen: 'Origen',
  concepto: 'Concepto',
  categoria: 'Categoría',
  proveedor: 'Proveedor',
  usuarioId: 'ID de usuario',
  clienteId: 'ID de cliente',
  veterinarioId: 'ID de veterinario',
  mascotaId: 'ID de mascota',
  agendaId: 'ID de agenda',
};

export function botonDetalle(ruta: string, titulo: string): string {
  return `<button class="text-button" type="button" data-api-detail="${escaparHtml(ruta)}" data-detail-title="${escaparHtml(titulo)}">Ver detalle</button>`;
}

function recopilarCampos(valor: Record<string, unknown>, prefijo = '', profundidad = 0): [string, string][] {
  return Object.entries(valor).flatMap(([clave, contenido]) => {
    if (clave === 'passwordHash' || clave.toLowerCase().includes('token')) return [];
    const etiqueta = etiquetas[clave] || clave;
    const nombre = prefijo ? `${prefijo} · ${etiqueta}` : etiqueta;
    if (contenido === null || contenido === undefined || contenido === '') return [[nombre, '—']];
    if (Array.isArray(contenido)) return [[nombre, `${contenido.length} registro(s)`]];
    if (typeof contenido === 'object' && profundidad < 2) {
      return recopilarCampos(contenido as Record<string, unknown>, nombre, profundidad + 1);
    }
    if (typeof contenido === 'object') return [];
    return [[nombre, String(contenido)]];
  });
}

export function renderizarDetalleRegistro(valor: unknown): string {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    return '<p class="empty-state">No hay información de detalle disponible.</p>';
  }
  const campos = recopilarCampos(valor as Record<string, unknown>);
  if (!campos.length) return '<p class="empty-state">No hay información de detalle disponible.</p>';
  return `<dl class="detail-fields">${campos.map(([etiqueta, contenido]) => `<div><dt>${escaparHtml(etiqueta)}</dt><dd>${escaparHtml(contenido)}</dd></div>`).join('')}</dl>`;
}

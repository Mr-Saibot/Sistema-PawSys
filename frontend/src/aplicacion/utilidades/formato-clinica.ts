import type { Mascota, Turno } from '../../tipos';

export function formatearGuaranies(valor: number | string): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(Number(valor));
}

export function nombreMascota(turno: Turno): string {
  if (typeof turno.mascota === 'string') {
    return turno.mascota;
  }
  return turno.mascota?.nombre || 'Paciente';
}

export function textoResponsable(mascota: Mascota): string {
  if (typeof mascota.cliente === 'string') {
    return mascota.cliente;
  }
  if (mascota.cliente) {
    return `${mascota.cliente.nombre} ${mascota.cliente.apellido}`;
  }
  return mascota.clienteNombre || 'Responsable no disponible';
}

export function obtenerFechaHoy(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

export function formatearFecha(fecha: string): string {
  const valor = new Date(`${fecha.slice(0, 10)}T12:00:00`);

  return new Intl.DateTimeFormat('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(valor);
}

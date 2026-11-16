export function escaparHtml(valor: unknown = ''): string {
  return String(valor).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

export function iniciales(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function obtenerMensajeError(error: unknown, alternativa: string): string {
  return error instanceof Error ? error.message : alternativa;
}
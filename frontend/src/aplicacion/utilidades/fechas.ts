const CONFIGURACION_FECHA = {
  dateStyle: 'long',
  timeZone: 'America/Asuncion',
} as const;

export function formatearFecha(fecha: string): string {
  const fechaLocal = convertirFechaLocal(fecha);

  if (!fechaLocal) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-PY', CONFIGURACION_FECHA)
    .format(fechaLocal);
}

export function calcularEdad(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) {
    return 'Edad no registrada';
  }

  const nacimiento = convertirFechaLocal(fechaNacimiento);
  if (!nacimiento) {
    return 'Edad no disponible';
  }

  const hoy = new Date();
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const cumpleañosPendiente =
    hoy.getMonth() < nacimiento.getMonth()
    || (
      hoy.getMonth() === nacimiento.getMonth()
      && hoy.getDate() < nacimiento.getDate()
    );

  if (cumpleañosPendiente) {
    años -= 1;
  }

  if (años < 1) {
    return 'Menos de 1 año';
  }

  return años === 1 ? '1 año' : `${años} años`;
}

function convertirFechaLocal(fecha: string): Date | null {
  const [año, mes, día] = fecha.slice(0, 10).split('-').map(Number);

  if (!año || !mes || !día) {
    return null;
  }

  const fechaLocal = new Date(año, mes - 1, día);
  return Number.isNaN(fechaLocal.getTime()) ? null : fechaLocal;
}

import type {
  MascotaPaciente,
  MascotaResumen,
  RespuestaAcceso,
  RolUsuario,
  SesionUsuario,
} from '../tipos/paciente';

const CLAVE_SESION = 'pawsys-session';
const CLAVE_API = 'pawsys-api-url';
const API_PREDETERMINADA = 'http://localhost:3000';
export const EVENTO_CAMBIO_SESION = 'pawsys:cambio-sesion';
const ROLES_VALIDOS: RolUsuario[] = [
  'CLIENTE',
  'VETERINARIO',
  'ADMINISTRADOR',
];

function obtenerUrlApi(): string {
  const urlGuardada = localStorage.getItem(CLAVE_API);
  return (urlGuardada || API_PREDETERMINADA).replace(/\/$/, '');
}

function crearUrl(ruta: string): string {
  return `${obtenerUrlApi()}${ruta}`;
}

async function leerRespuesta<T>(respuesta: Response): Promise<T> {
  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const mensaje = obtenerMensajeRespuesta(resultado);
    throw new Error(mensaje || `La solicitud falló (${respuesta.status}).`);
  }

  return resultado as T;
}

function obtenerMensajeRespuesta(resultado: unknown): string {
  if (!resultado || typeof resultado !== 'object') {
    return '';
  }

  const mensaje = Reflect.get(resultado, 'message');

  if (Array.isArray(mensaje)) {
    return mensaje.join(', ');
  }

  return typeof mensaje === 'string' ? mensaje : '';
}

export function leerSesion(): SesionUsuario | null {
  const valorGuardado = sessionStorage.getItem(CLAVE_SESION);

  if (!valorGuardado) {
    return null;
  }

  try {
    const sesion: unknown = JSON.parse(valorGuardado);

    if (esSesionValida(sesion)) {
      return sesion;
    }

    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    sessionStorage.removeItem(CLAVE_SESION);
  }

  return null;
}

function esSesionValida(valor: unknown): valor is SesionUsuario {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const usuario = Reflect.get(valor, 'usuario');
  const token = Reflect.get(valor, 'token');

  return Boolean(
    typeof token === 'string'
    && token.length > 0
    && usuario
    && typeof usuario.id === 'number'
    && typeof usuario.correo === 'string'
    && ROLES_VALIDOS.includes(usuario.rol),
  );
}

export function guardarSesion(sesion: SesionUsuario): void {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  window.dispatchEvent(new Event(EVENTO_CAMBIO_SESION));
}

export function cerrarSesion(): void {
  sessionStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event(EVENTO_CAMBIO_SESION));
}

export async function iniciarSesion(
  correo: string,
  clave: string,
): Promise<SesionUsuario> {
  const respuesta = await fetch(crearUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password: clave }),
  });
  const resultado = await leerRespuesta<RespuestaAcceso>(respuesta);

  if (!resultado.access_token || !resultado.user?.rol) {
    throw new Error('La respuesta de acceso no contiene una sesión válida.');
  }

  const sesion = {
    usuario: resultado.user,
    token: resultado.access_token,
  };
  guardarSesion(sesion);
  return sesion;
}

export async function obtenerMascotas(
  token: string,
  rol: RolUsuario,
): Promise<MascotaResumen[]> {
  const ruta = rol === 'CLIENTE' ? '/clientes/me/mascotas' : '/mascotas';
  return solicitarApi<MascotaResumen[]>(ruta, token);
}

export async function obtenerFichaPaciente(
  id: number,
  token: string,
  senal?: AbortSignal,
): Promise<MascotaPaciente> {
  const paciente = await solicitarApi<MascotaPaciente>(
    `/mascotas/${id}`,
    token,
    senal,
  );
  const fotoUrl = paciente.fotoUrl
    ? crearUrl(paciente.fotoUrl)
    : null;

  return { ...paciente, fotoUrl };
}

export async function confirmarTurno(token: string): Promise<void> {
  const respuesta = await fetch(crearUrl('/turnos/confirmar'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  await leerRespuesta<unknown>(respuesta);
}

async function solicitarApi<T>(
  ruta: string,
  token: string,
  senal?: AbortSignal,
): Promise<T> {
  const respuesta = await fetch(crearUrl(ruta), {
    headers: { Authorization: `Bearer ${token}` },
    signal: senal,
  });

  return leerRespuesta<T>(respuesta);
}

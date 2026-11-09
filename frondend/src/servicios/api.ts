import { API_PREDETERMINADA, CLAVE_API } from '../constantes.js';
import { crearDatosVacios } from '../datos/datos-iniciales.js';
import type { ConfiguracionPagos, DatosPanel, DatosRegistroCliente, Sesion, Usuario } from '../tipos.js';

interface RespuestaInicioSesion {
  user: Usuario;
  access_token: string;
}

function urlBaseApi(): string {
  return (localStorage.getItem(CLAVE_API) || API_PREDETERMINADA).replace(/\/$/, '');
}

export function obtenerUrlApiGuardada(): string {
  return localStorage.getItem(CLAVE_API) || API_PREDETERMINADA;
}

export function guardarUrlApi(valor: string): void {
  const normalizado = valor.trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(normalizado)) throw new Error('Escribe una dirección válida que comience con http:// o https://.');
  localStorage.setItem(CLAVE_API, normalizado);
}

export async function probarConexionApi(): Promise<string> {
  const respuesta = await fetch(`${urlBaseApi()}/`);
  const mensaje = await respuesta.text();
  if (!respuesta.ok) throw new Error(mensaje || `La API respondió con estado ${respuesta.status}.`);
  return mensaje;
}

async function leerRespuesta<T>(respuesta: Response, mensajePredeterminado: string): Promise<T> {
  const resultado = await respuesta.json().catch(() => ({})) as { message?: string | string[] };
  if (!respuesta.ok) {
    const mensaje = Array.isArray(resultado.message) ? resultado.message.join(', ') : resultado.message;
    throw new Error(mensaje || `${mensajePredeterminado} (${respuesta.status})`);
  }
  return resultado as T;
}

export async function registrarCliente(datos: DatosRegistroCliente): Promise<void> {
  const respuesta = await fetch(`${urlBaseApi()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo: datos.correo,
      password: datos.clave,
      cedulaIdentidad: datos.cedulaIdentidad,
      nombre: datos.nombre,
      apellido: datos.apellido,
      telefono: datos.telefono,
      direccion: datos.direccion,
    }),
  });
  await leerRespuesta<unknown>(respuesta, 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.');
}

export async function iniciarSesion(correo: string, clave: string): Promise<Sesion> {
  const respuesta = await fetch(`${urlBaseApi()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password: clave }),
  });
  const resultado = await leerRespuesta<Partial<RespuestaInicioSesion>>(respuesta, 'No se pudo iniciar sesión. Revisa tus datos.');
  if (!resultado.access_token || !resultado.user?.rol) throw new Error('La respuesta del backend no contiene usuario y token.');
  return { usuario: resultado.user, token: resultado.access_token };
}

export async function enviarApi<T>(ruta: string, token: string, metodo = 'GET', datos?: unknown): Promise<T> {
  const respuesta = await fetch(`${urlBaseApi()}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: ['Bearer', token].join(' '),
      ...(datos === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(datos === undefined ? {} : { body: JSON.stringify(datos) }),
  });
  return leerRespuesta<T>(respuesta, `${metodo} ${ruta} falló`);
}

export async function obtenerConfiguracionPagos(): Promise<ConfiguracionPagos> {
  const respuesta = await fetch(`${urlBaseApi()}/configuracion/pagos`);
  const resultado = await leerRespuesta<Partial<ConfiguracionPagos>>(respuesta, 'No se pudo cargar la información de pagos');
  return {
    alias: resultado.alias || '',
    titular: resultado.titular || '',
    qrImageUrl: resultado.qrImageUrl || '',
  };
}

async function obtenerRecurso<T>(ruta: string, token: string): Promise<T> {
  return enviarApi<T>(ruta, token);
}

export async function cargarDatosPanel(sesion: Sesion): Promise<DatosPanel> {
  const datos = crearDatosVacios();
  const token = sesion.token;
  if (!token) return datos;

  const recursos: { clave: keyof DatosPanel; ruta: string }[] = [
    { clave: 'mascotas', ruta: sesion.usuario.rol === 'CLIENTE' ? '/clientes/me/mascotas' : '/mascotas' },
    { clave: 'turnos', ruta: '/turnos' },
    { clave: 'veterinarios', ruta: sesion.usuario.rol === 'CLIENTE' ? '/veterinarios/disponibles' : '/veterinarios' },
  ];
  if (sesion.usuario.rol !== 'CLIENTE') {
    recursos.push(
      { clave: 'clientes', ruta: '/clientes' },
      ...(sesion.usuario.rol === 'ADMINISTRADOR' ? [{ clave: 'administradores' as const, ruta: '/administradores' }] : []),
      { clave: 'historiales', ruta: '/historiales-clinicos' },
      { clave: 'consultas', ruta: '/consultas' },
      { clave: 'vacunaciones', ruta: '/vacunaciones' },
      { clave: 'agendas', ruta: '/agendas' },
    );
  }
  if (sesion.usuario.rol === 'ADMINISTRADOR') {
    recursos.push(
      { clave: 'cajas', ruta: '/caja' },
      { clave: 'ingresos', ruta: '/ingresos' },
      { clave: 'egresos', ruta: '/egresos' },
    );
  }

  const resultados = await Promise.allSettled(recursos.map(({ ruta }) => obtenerRecurso<unknown>(ruta, token)));
  resultados.forEach((resultado, indice) => {
    if (resultado.status !== 'fulfilled') {
      datos.errorRecursos.push(`${recursos[indice].ruta}: ${resultado.reason instanceof Error ? resultado.reason.message : 'error desconocido'}`);
      return;
    }
    if (!Array.isArray(resultado.value)) {
      datos.errorRecursos.push(`${recursos[indice].ruta}: respuesta inesperada del backend`);
      return;
    }
    switch (recursos[indice].clave) {
      case 'mascotas': datos.mascotas = resultado.value; break;
      case 'turnos': datos.turnos = resultado.value; break;
      case 'clientes': datos.clientes = resultado.value; break;
      case 'veterinarios': datos.veterinarios = resultado.value; break;
      case 'administradores': datos.administradores = resultado.value; break;
      case 'cajas': datos.cajas = resultado.value; break;
      case 'ingresos': datos.ingresos = resultado.value; break;
      case 'egresos': datos.egresos = resultado.value; break;
      case 'historiales': datos.historiales = resultado.value; break;
      case 'consultas': datos.consultas = resultado.value; break;
      case 'vacunaciones': datos.vacunaciones = resultado.value; break;
      case 'agendas': datos.agendas = resultado.value; break;
      default: break;
    }
    datos.conectado = true;
  });
  datos.errorConexion = datos.errorRecursos.length > 0;
  return datos;
}

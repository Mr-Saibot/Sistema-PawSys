import { API_PREDETERMINADA, CLAVE_API } from '../constantes.js';
import { crearDatosVacios } from '../datos/datos-demostracion.js';
import type { DatosPanel, DatosRegistroCliente, Rol, Sesion, Usuario } from '../tipos.js';

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
  const resultado = await respuesta.json().catch(() => ({})) as { message?: string | string[] };
  if (!respuesta.ok) {
    const mensaje = Array.isArray(resultado.message) ? resultado.message.join(', ') : resultado.message;
    throw new Error(mensaje || 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.');
  }
}

export async function iniciarSesion(correo: string, clave: string): Promise<Sesion> {
  const respuesta = await fetch(`${urlBaseApi()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password: clave }),
  });
  const resultado = await respuesta.json().catch(() => ({})) as Partial<RespuestaInicioSesion> & { message?: string | string[] };
  if (!respuesta.ok) {
    const mensaje = Array.isArray(resultado.message) ? resultado.message.join(', ') : resultado.message;
    throw new Error(mensaje || 'No se pudo iniciar sesión. Revisa tus datos.');
  }
  if (!resultado.access_token || !resultado.user?.rol) throw new Error('La respuesta del backend no contiene usuario y token.');
  return { usuario: resultado.user, token: resultado.access_token, demostracion: false };
}

async function obtenerRecurso<T>(ruta: string, token: string): Promise<T> {
  const respuesta = await fetch(`${urlBaseApi()}${ruta}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) throw new Error(`${ruta}: ${respuesta.status}`);
  return respuesta.json() as Promise<T>;
}

export async function cargarDatosPanel(sesion: Sesion): Promise<DatosPanel> {
  const datos = crearDatosVacios();
  const token = sesion.token;
  if (!token) return datos;

  if (sesion.usuario.rol === 'CLIENTE') {
    try {
      datos.mascotas = await obtenerRecurso<DatosPanel['mascotas']>('/clientes/me/mascotas', token);
      datos.conectado = true;
    } catch {
      datos.errorConexion = true;
    }
    return datos;
  }

  const recursos: { clave: 'mascotas' | 'turnos' | 'clientes' | 'veterinarios'; ruta: string }[] = [
    { clave: 'mascotas', ruta: '/mascotas' },
    { clave: 'turnos', ruta: '/turnos' },
  ];
  if (sesion.usuario.rol === 'ADMINISTRADOR') {
    recursos.push({ clave: 'clientes', ruta: '/clientes' }, { clave: 'veterinarios', ruta: '/veterinarios' });
  }

  const resultados = await Promise.allSettled(recursos.map(({ ruta }) => obtenerRecurso<unknown>(ruta, token)));
  resultados.forEach((resultado, indice) => {
    if (resultado.status !== 'fulfilled' || !Array.isArray(resultado.value)) return;
    const clave = recursos[indice].clave;
    switch (clave) {
      case 'mascotas': datos.mascotas = resultado.value;
        break;
      case 'turnos': datos.turnos = resultado.value;
        break;
      case 'clientes': datos.clientes = resultado.value;
        break;
      case 'veterinarios': datos.veterinarios = resultado.value;
        break;
    }
    datos.conectado = true;
  });

  return datos;
}

export function esRol(valor: string | undefined): valor is Rol {
  return valor === 'CLIENTE' || valor === 'VETERINARIO' || valor === 'ADMINISTRADOR';
}
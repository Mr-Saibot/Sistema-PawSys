import type { Rol, Sesion } from '../tipos.js';

const CLAVE_SESION = 'pawsys-session';
const roles: Rol[] = ['CLIENTE', 'VETERINARIO', 'ADMINISTRADOR'];

export function guardarSesion(sesion: Sesion): void {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(CLAVE_SESION);
}

export function leerSesion(): Sesion | null {
  const guardado = sessionStorage.getItem(CLAVE_SESION);
  if (!guardado) return null;

  try {
    const sesion = JSON.parse(guardado) as Sesion;
    if (sesion.token && roles.includes(sesion.usuario?.rol)) return sesion;
  } catch {
    limpiarSesion();
  }

  return null;
}
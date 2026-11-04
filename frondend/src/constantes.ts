import type { Rol } from './tipos.js';

export const CLAVE_API = 'pawsys-api-url';
export const API_PREDETERMINADA = 'http://localhost:3000';

export const nombresRoles: Record<Rol, string> = {
  CLIENTE: 'Cliente',
  VETERINARIO: 'Veterinario',
  ADMINISTRADOR: 'Administrador',
};

export const fotos = {
  perro: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
  gato: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
  cachorro: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
};
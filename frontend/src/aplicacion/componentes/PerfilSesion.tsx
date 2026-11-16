import type { RolUsuario } from '../tipos/paciente';
import { Avatar } from './Avatar';

interface PropiedadesPerfilSesion {
  rol: RolUsuario;
  nombreUsuario: string;
  alCerrarSesion: () => void;
}

export function PerfilSesion({
  rol,
  nombreUsuario,
  alCerrarSesion,
}: PropiedadesPerfilSesion) {
  return (
    <div className="mt-auto border-t border-borde pt-4">
      <div className="flex items-center gap-3">
        <Avatar nombre={nombreUsuario} tamano="pequeno" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-texto">
            {nombreUsuario}
          </p>
          <p className="mt-0.5 text-xs text-texto-suave">
            {obtenerNombreRol(rol)}
          </p>
        </div>
        <button
          className="rounded-control px-2 py-1 text-xs text-texto-suave
            hover:bg-primario-suave hover:text-primario-oscuro"
          type="button"
          onClick={alCerrarSesion}
        >
          Salir
        </button>
      </div>
    </div>
  );
}

function obtenerNombreRol(rol: RolUsuario): string {
  if (rol === 'CLIENTE') {
    return 'Cliente';
  }

  return rol === 'VETERINARIO' ? 'Veterinario' : 'Administrador';
}

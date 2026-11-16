import type { RolUsuario } from '../tipos/paciente';
import { MarcaPawSys } from './MarcaPawSys';
import { NavegacionPrincipal } from './NavegacionPrincipal';
import { PerfilSesion } from './PerfilSesion';

interface PropiedadesMenuLateral {
  rol: RolUsuario;
  nombreUsuario: string;
  alCerrarSesion: () => void;
  abierto?: boolean;
  alNavegar?: () => void;
}

export function MenuLateral({
  rol,
  nombreUsuario,
  alCerrarSesion,
  abierto = false,
  alNavegar,
}: PropiedadesMenuLateral) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-60 flex-col border-r
        border-borde bg-fondo px-4 py-6
        ${abierto ? 'flex' : 'hidden'} lg:flex`}
    >
      <MarcaPawSys />
      <NavegacionPrincipal rol={rol} alNavegar={alNavegar} />
      <PerfilSesion
        rol={rol}
        nombreUsuario={nombreUsuario}
        alCerrarSesion={alCerrarSesion}
      />
    </aside>
  );
}

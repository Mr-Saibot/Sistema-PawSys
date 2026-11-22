import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  PawPrint,
  ReceiptText,
  Stethoscope,
  UsersRound,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { RolUsuario } from '../tipos/paciente';

interface EnlaceNavegacion {
  titulo: string;
  ruta: string;
  icono: LucideIcon;
}

interface PropiedadesNavegacion {
  rol: RolUsuario;
  alNavegar?: () => void;
}

const enlacesPorRol: Record<RolUsuario, EnlaceNavegacion[]> = {
  CLIENTE: [
    { titulo: 'Inicio', ruta: '/', icono: ChartNoAxesCombined },
    { titulo: 'Mis mascotas', ruta: '/mascotas', icono: PawPrint },
    { titulo: 'Agenda', ruta: '/agenda', icono: CalendarDays },
    { titulo: 'Pagos', ruta: '/pagos', icono: CreditCard },
  ],
  VETERINARIO: [
    { titulo: 'Inicio', ruta: '/', icono: ChartNoAxesCombined },
    { titulo: 'Agenda', ruta: '/agenda', icono: CalendarDays },
    { titulo: 'Mascotas', ruta: '/pacientes', icono: PawPrint },
    {
      titulo: 'Historias clínicas',
      ruta: '/historias',
      icono: ClipboardList,
    },
    { titulo: 'Cobros', ruta: '/cobros', icono: Wallet },
  ],
  ADMINISTRADOR: [
    { titulo: 'Inicio', ruta: '/', icono: ChartNoAxesCombined },
    { titulo: 'Agenda', ruta: '/agenda', icono: CalendarDays },
    { titulo: 'Mascotas', ruta: '/pacientes', icono: PawPrint },
    { titulo: 'Propietarios', ruta: '/propietarios', icono: UsersRound },
    {
      titulo: 'Historias clínicas',
      ruta: '/historias',
      icono: ClipboardList,
    },
    { titulo: 'Equipo', ruta: '/equipo', icono: Stethoscope },
    {
      titulo: 'Administradores',
      ruta: '/administradores',
      icono: UsersRound,
    },
    { titulo: 'Caja', ruta: '/caja', icono: ReceiptText },
    { titulo: 'Pagos', ruta: '/pagos', icono: CreditCard },
  ],
};

export function NavegacionPrincipal({
  rol,
  alNavegar,
}: PropiedadesNavegacion) {
  return (
    <nav className="mt-8 grid gap-1" aria-label="Navegación principal">
      <p className="mb-2 px-3 text-xs font-medium text-texto-suave">
        Clínica
      </p>
      {enlacesPorRol[rol].map((enlace) => (
        <NavLink
          key={enlace.ruta}
          to={enlace.ruta}
          end={enlace.ruta === '/'}
          onClick={alNavegar}
          className={({ isActive }) => crearClasesEnlace(isActive)}
        >
          <enlace.icono size={18} strokeWidth={1.6} />
          <span>{enlace.titulo}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function crearClasesEnlace(activo: boolean): string {
  const clasesBase =
    'flex min-h-10 items-center gap-3 rounded-control px-3 text-sm';
  const clasesActivo =
    'bg-primario-suave font-medium text-verde-profundo';
  const clasesInactivo =
    'text-texto-suave hover:bg-superficie hover:text-texto';

  return `${clasesBase} ${activo ? clasesActivo : clasesInactivo}`;
}

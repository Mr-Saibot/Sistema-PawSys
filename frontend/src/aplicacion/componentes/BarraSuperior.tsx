import { Menu } from 'lucide-react';
import type { RolUsuario } from '../tipos/paciente';
import type { DatosPanel } from '../../tipos';
import { BuscadorGlobal } from './BuscadorGlobal';

interface PropiedadesBarraSuperior {
  rol: RolUsuario;
  datos?: DatosPanel;
  alAbrirMenu: () => void;
}

export function BarraSuperior({
  rol,
  datos,
  alAbrirMenu,
}: PropiedadesBarraSuperior) {
  const etiqueta = rol === 'CLIENTE' ? 'Mi mascota' : 'Atención clínica';

  return (
    <header className="sticky top-0 z-20 border-b border-borde
      bg-fondo/95 px-5 backdrop-blur sm:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center
        gap-4">
        <button
          className="rounded-control p-2 text-texto-suave hover:bg-superficie
            lg:hidden"
          type="button"
          onClick={alAbrirMenu}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1">
          <BuscadorGlobal datos={datos} />
        </div>
        <span className="rounded-full bg-primario-suave px-3 py-1
          text-xs font-medium text-primario-oscuro">
          {etiqueta}
        </span>
      </div>
    </header>
  );
}

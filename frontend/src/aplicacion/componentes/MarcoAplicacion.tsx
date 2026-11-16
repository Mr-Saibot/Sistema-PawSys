import { useState, type ReactNode } from 'react';
import type { DatosPanel } from '../../tipos';
import type { RolUsuario } from '../tipos/paciente';
import { BarraSuperior } from './BarraSuperior';
import { MenuLateral } from './MenuLateral';

interface PropiedadesMarcoAplicacion {
  rol: RolUsuario;
  nombreUsuario: string;
  identificadorPaciente?: number;
  alCerrarSesion: () => void;
  datos?: DatosPanel;
  children: ReactNode;
}

export function MarcoAplicacion({
  rol,
  nombreUsuario,
  alCerrarSesion,
  datos,
  children,
}: PropiedadesMarcoAplicacion) {
  const [menuAbierto, establecerMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-fondo text-texto">
      <MenuLateral
        rol={rol}
        nombreUsuario={nombreUsuario}
        alCerrarSesion={alCerrarSesion}
        abierto={menuAbierto}
        alNavegar={() => establecerMenuAbierto(false)}
      />
      <div className="min-h-screen lg:pl-60">
        <BarraSuperior
          rol={rol}
          datos={datos}
          alAbrirMenu={() => establecerMenuAbierto((abierto) => !abierto)}
        />
        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

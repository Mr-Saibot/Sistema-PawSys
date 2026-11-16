import { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { Boton } from './Boton';
import { PanelAccionConsulta } from './PanelAccionConsulta';

export function AccionNuevaConsulta() {
  const [abierto, establecerApertura] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde
        bg-superficie/95 p-3 backdrop-blur sm:inset-x-auto sm:right-8
        sm:bottom-8 sm:border-0 sm:bg-transparent sm:p-0">
        <Boton
          className="w-full shadow-sutil sm:w-auto"
          icono={<Stethoscope size={17} aria-hidden="true" />}
          onClick={() => establecerApertura(true)}
        >
          Nueva consulta
        </Boton>
      </div>
      <PanelAccionConsulta
        abierto={abierto}
        alCerrar={() => establecerApertura(false)}
      />
    </>
  );
}

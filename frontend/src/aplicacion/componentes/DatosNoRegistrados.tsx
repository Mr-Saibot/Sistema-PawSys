import { CircleHelp } from 'lucide-react';
import { Tarjeta } from './Tarjeta';

export function DatosNoRegistrados() {
  return (
    <Tarjeta className="flex items-start gap-3 p-4">
      <CircleHelp
        className="mt-0.5 shrink-0 text-texto-suave"
        size={18}
        aria-hidden="true"
      />
      <p className="text-sm leading-6 text-texto-suave">
        Sexo y alergias todavía no se registran en el sistema.
      </p>
    </Tarjeta>
  );
}

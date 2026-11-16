import { Syringe } from 'lucide-react';
import { FechasVacuna } from './FechasVacuna';
import { Tarjeta } from './Tarjeta';
import type { VacunaPaciente } from '../tipos/paciente';

interface PropiedadesTarjetaVacuna {
  vacuna: VacunaPaciente;
}

export function TarjetaVacuna({ vacuna }: PropiedadesTarjetaVacuna) {
  const nombreVeterinario =
    `${vacuna.veterinario.nombre} ${vacuna.veterinario.apellido}`;

  return (
    <li>
      <Tarjeta className="flex flex-wrap items-start justify-between
        gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-control bg-primario-suave p-2
            text-primario-oscuro">
            <Syringe size={17} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-texto">{vacuna.vacuna}</h3>
            <p className="mt-1 text-sm text-texto-suave">
              Aplicada por {nombreVeterinario}
            </p>
          </div>
        </div>
        <FechasVacuna
          aplicada={vacuna.fecha}
          proximaDosis={vacuna.proximaDosis}
        />
      </Tarjeta>
    </li>
  );
}

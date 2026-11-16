import { Syringe } from 'lucide-react';
import { EstadoVacio } from './EstadoVacio';
import { TarjetaVacuna } from './TarjetaVacuna';
import type { VacunaPaciente } from '../tipos/paciente';

interface PropiedadesListaVacunas {
  vacunas: VacunaPaciente[];
}

export function ListaVacunas({ vacunas }: PropiedadesListaVacunas) {
  if (vacunas.length === 0) {
    return (
      <EstadoVacio
        icono={<Syringe size={22} />}
        titulo="Aún no hay vacunas registradas"
        descripcion="Las vacunas aplicadas aparecerán en esta ficha
          cuando las registre el equipo veterinario."
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {vacunas.map((vacuna) => (
        <TarjetaVacuna key={vacuna.id} vacuna={vacuna} />
      ))}
    </ul>
  );
}

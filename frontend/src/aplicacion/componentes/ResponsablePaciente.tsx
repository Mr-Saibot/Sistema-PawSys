import type { ResponsablePaciente as DatosResponsable } from '../tipos/paciente';
import { ContactoResponsable } from './ContactoResponsable';

interface PropiedadesResponsablePaciente {
  responsable: DatosResponsable;
}

export function ResponsablePaciente({
  responsable,
}: PropiedadesResponsablePaciente) {
  const nombre = `${responsable.nombre} ${responsable.apellido}`;

  return (
    <div className="mt-6 border-t border-borde pt-5">
      <p className="text-xs font-medium uppercase tracking-wide
        text-texto-suave">
        Responsable
      </p>
      <p className="mt-1 font-medium text-texto">{nombre}</p>
      <ContactoResponsable responsable={responsable} />
    </div>
  );
}

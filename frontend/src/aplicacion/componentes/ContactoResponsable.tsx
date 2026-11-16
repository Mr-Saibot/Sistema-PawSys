import { Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ResponsablePaciente } from '../tipos/paciente';

interface PropiedadesContactoResponsable {
  responsable: ResponsablePaciente;
}

export function ContactoResponsable({
  responsable,
}: PropiedadesContactoResponsable) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm
      text-texto-suave">
      <DatoContacto
        icono={<Mail size={15} />}
        href={`mailto:${responsable.correo}`}
      >
        {responsable.correo}
      </DatoContacto>
      {responsable.telefono && (
        <DatoContacto
          icono={<Phone size={15} />}
          href={`tel:${responsable.telefono}`}
        >
          {responsable.telefono}
        </DatoContacto>
      )}
    </div>
  );
}

function DatoContacto({
  icono,
  href,
  children,
}: {
  icono: ReactNode;
  href: string;
  children: string;
}) {
  return (
    <a
      className="inline-flex items-center gap-2 hover:text-primario-oscuro"
      href={href}
    >
      <span aria-hidden="true">{icono}</span>
      {children}
    </a>
  );
}

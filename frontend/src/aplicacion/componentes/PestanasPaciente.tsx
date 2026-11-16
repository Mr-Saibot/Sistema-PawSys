import {
  ClipboardList,
  FileText,
  Syringe,
  WalletCards,
  Worm,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PestanaFicha } from '../tipos/evento-clinico';
import { BotonPestanaPaciente } from './BotonPestanaPaciente';

interface PropiedadesPestanasPaciente {
  seleccionada: PestanaFicha;
  alSeleccionar: (pestana: PestanaFicha) => void;
}

const pestanas: {
  clave: PestanaFicha;
  titulo: string;
  icono: LucideIcon;
}[] = [
  { clave: 'historial', titulo: 'Historial clínico', icono: ClipboardList },
  { clave: 'vacunas', titulo: 'Vacunas', icono: Syringe },
  { clave: 'desparasitacion', titulo: 'Desparasitación', icono: Worm },
  { clave: 'documentos', titulo: 'Documentos', icono: FileText },
  { clave: 'facturacion', titulo: 'Facturación', icono: WalletCards },
];

export function PestanasPaciente({
  seleccionada,
  alSeleccionar,
}: PropiedadesPestanasPaciente) {
  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-borde"
      role="tablist"
      aria-label="Secciones de la ficha"
    >
      {pestanas.map((pestana) => (
        <BotonPestanaPaciente
          key={pestana.clave}
          pestana={pestana}
          seleccionada={seleccionada}
          alSeleccionar={alSeleccionar}
        />
      ))}
    </div>
  );
}

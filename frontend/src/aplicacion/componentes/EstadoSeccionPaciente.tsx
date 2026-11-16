import { FileText, WalletCards, Worm } from 'lucide-react';
import { EstadoVacio } from './EstadoVacio';
import type { PestanaFicha } from '../tipos/evento-clinico';

interface PropiedadesEstadoSeccion {
  pestana: PestanaFicha;
}

const contenidoNoDisponible: Record<
  Exclude<PestanaFicha, 'historial' | 'vacunas'>,
  { titulo: string; descripcion: string; icono: typeof Worm }
> = {
  desparasitacion: {
    titulo: 'Desparasitación todavía no disponible',
    descripcion:
      'El sistema aún no guarda tratamientos antiparasitarios.',
    icono: Worm,
  },
  documentos: {
    titulo: 'Todavía no hay documentos',
    descripcion: 'La API aún no permite adjuntar documentos a esta ficha.',
    icono: FileText,
  },
  facturacion: {
    titulo: 'Facturación no disponible en esta ficha',
    descripcion:
      'Los cobros se consultan desde el módulo de caja actual.',
    icono: WalletCards,
  },
};

export function EstadoSeccionPaciente({
  pestana,
}: PropiedadesEstadoSeccion) {
  if (pestana === 'historial' || pestana === 'vacunas') {
    return null;
  }

  const contenido = contenidoNoDisponible[pestana];
  const Icono = contenido.icono;

  return (
    <EstadoVacio
      icono={<Icono size={22} />}
      titulo={contenido.titulo}
      descripcion={contenido.descripcion}
    />
  );
}

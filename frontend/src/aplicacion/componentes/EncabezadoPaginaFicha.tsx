import { ArrowLeft } from 'lucide-react';
import { Boton } from './Boton';

export function EncabezadoPaginaFicha() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-verde-profundo">Mascotas</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-texto">
          Ficha de la mascota
        </h2>
        <p className="mt-1 text-sm text-texto-suave">
          Información clínica en un solo lugar.
        </p>
      </div>
      <Boton
        variante="sutil"
        className="shrink-0 px-3"
        onClick={() => window.history.back()}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Volver</span>
      </Boton>
    </header>
  );
}

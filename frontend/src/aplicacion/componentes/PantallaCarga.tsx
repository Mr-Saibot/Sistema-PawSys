import { Esqueleto } from './Esqueleto';

export function PantallaCarga() {
  return (
    <div className="grid gap-6" aria-label="Cargando ficha" aria-busy="true">
      <Esqueleto className="h-56 w-full" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,1fr)]">
        <Esqueleto className="h-80 w-full" />
        <Esqueleto className="h-56 w-full" />
      </div>
    </div>
  );
}

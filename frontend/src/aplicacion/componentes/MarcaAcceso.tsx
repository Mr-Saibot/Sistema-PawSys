import { PawPrint } from 'lucide-react';

export function MarcaAcceso() {
  return (
    <div className="mb-8 flex items-center gap-3 text-verde-profundo">
      <span className="grid h-10 w-10 place-items-center rounded-control
        bg-primario-suave text-primario-oscuro">
        <PawPrint size={21} aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold">PawSys</span>
    </div>
  );
}

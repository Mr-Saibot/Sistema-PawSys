import { PawPrint } from 'lucide-react';

interface PropiedadesMarcaPawSys {
  compacto?: boolean;
}

export function MarcaPawSys({ compacto = false }: PropiedadesMarcaPawSys) {
  return (
    <a
      className="flex items-center gap-3 text-lg font-semibold
        tracking-tight text-verde-profundo"
      href="#/"
      aria-label="PawSys, inicio"
    >
      <span className="grid h-9 w-9 place-items-center rounded-control
        bg-primario-suave text-primario-oscuro">
        <PawPrint size={19} aria-hidden="true" />
      </span>
      {!compacto && <span>PawSys</span>}
    </a>
  );
}

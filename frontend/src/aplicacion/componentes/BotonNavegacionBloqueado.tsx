import type { LucideIcon } from 'lucide-react';

interface PropiedadesBotonBloqueado {
  titulo: string;
  icono: LucideIcon;
}

export function BotonNavegacionBloqueado({
  titulo,
  icono: Icono,
}: PropiedadesBotonBloqueado) {
  return (
    <button
      className="flex min-h-10 cursor-not-allowed items-center gap-3
        rounded-control px-3 text-left text-sm text-texto-suave opacity-50"
      type="button"
      disabled
      title="Disponible en una próxima etapa"
    >
      <Icono size={17} strokeWidth={1.7} aria-hidden="true" />
      {titulo}
    </button>
  );
}

import { PawPrint } from 'lucide-react';

interface PropiedadesAvatar {
  nombre: string;
  foto?: string | null;
  tamano?: 'pequeno' | 'mediano' | 'grande';
}

const clasesPorTamano = {
  pequeno: 'h-10 w-10 text-sm',
  mediano: 'h-16 w-16 text-xl',
  grande: 'h-28 w-28 text-3xl sm:h-36 sm:w-36',
};

function obtenerIniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/);
  const iniciales = palabras.slice(0, 2).map((palabra) => palabra[0]);
  return iniciales.join('').toLocaleUpperCase('es');
}

export function Avatar({
  nombre,
  foto,
  tamano = 'mediano',
}: PropiedadesAvatar) {
  const clasesBase = clasesPorTamano[tamano];

  if (foto) {
    return (
      <img
        className={`${clasesBase} rounded-full border border-borde
          object-cover`}
        src={foto}
        alt={`Foto de ${nombre}`}
      />
    );
  }

  return (
    <div
      className={`${clasesBase} grid shrink-0 place-items-center
        rounded-full bg-primario-suave font-semibold text-primario-oscuro`}
      role="img"
      aria-label={`Sin foto disponible para ${nombre}`}
    >
      {nombre ? obtenerIniciales(nombre) : <PawPrint aria-hidden="true" />}
    </div>
  );
}

interface PropiedadesEsqueleto {
  className: string;
}

export function Esqueleto({ className }: PropiedadesEsqueleto) {
  return (
    <div
      className={`animate-pulse rounded-control bg-borde/70 ${className}`}
      aria-hidden="true"
    />
  );
}

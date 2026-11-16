interface PropiedadesFondoPanel {
  alCerrar: () => void;
}

export function FondoPanel({ alCerrar }: PropiedadesFondoPanel) {
  return (
    <button
      className="absolute inset-0 cursor-default bg-texto/30"
      type="button"
      aria-label="Cerrar panel lateral"
      onClick={alCerrar}
    />
  );
}

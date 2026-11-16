import { FechaVacuna } from './FechaVacuna';

interface PropiedadesFechasVacuna {
  aplicada: string;
  proximaDosis: string | null;
}

export function FechasVacuna({
  aplicada,
  proximaDosis,
}: PropiedadesFechasVacuna) {
  return (
    <div className="grid gap-2 text-sm text-texto-suave">
      <FechaVacuna fecha={aplicada} etiqueta="Aplicada" />
      {proximaDosis && (
        <FechaVacuna fecha={proximaDosis} etiqueta="Próxima dosis" />
      )}
    </div>
  );
}

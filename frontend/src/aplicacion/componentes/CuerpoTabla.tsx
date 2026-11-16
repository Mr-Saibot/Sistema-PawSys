import { FilaTabla } from './FilaTabla';
import type { ColumnaTabla } from '../tipos/tabla';

interface PropiedadesCuerpoTabla<Registro> {
  columnas: ColumnaTabla<Registro>[];
  registros: Registro[];
  claveRegistro: (registro: Registro) => string | number;
}

export function CuerpoTabla<Registro>({
  columnas,
  registros,
  claveRegistro,
}: PropiedadesCuerpoTabla<Registro>) {
  return (
    <tbody className="divide-y divide-borde">
      {registros.map((registro) => (
        <FilaTabla
          key={claveRegistro(registro)}
          columnas={columnas}
          registro={registro}
        />
      ))}
    </tbody>
  );
}

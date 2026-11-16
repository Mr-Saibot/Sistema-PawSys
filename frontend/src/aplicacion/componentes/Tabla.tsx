import { CuerpoTabla } from './CuerpoTabla';
import { EncabezadoTabla } from './EncabezadoTabla';
import type { ColumnaTabla } from '../tipos/tabla';

interface PropiedadesTabla<Registro> {
  columnas: ColumnaTabla<Registro>[];
  registros: Registro[];
  claveRegistro: (registro: Registro) => string | number;
}

export function Tabla<Registro>({
  columnas,
  registros,
  claveRegistro,
}: PropiedadesTabla<Registro>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <EncabezadoTabla columnas={columnas} />
        <CuerpoTabla
          columnas={columnas}
          registros={registros}
          claveRegistro={claveRegistro}
        />
      </table>
    </div>
  );
}

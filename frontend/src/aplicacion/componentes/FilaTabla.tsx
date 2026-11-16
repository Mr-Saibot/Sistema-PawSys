import type { ColumnaTabla } from '../tipos/tabla';

interface PropiedadesFilaTabla<Registro> {
  columnas: ColumnaTabla<Registro>[];
  registro: Registro;
}

export function FilaTabla<Registro>({
  columnas,
  registro,
}: PropiedadesFilaTabla<Registro>) {
  return (
    <tr className="group hover:bg-fondo/70">
      {columnas.map((columna) => (
        <td
          key={String(columna.clave)}
          className="px-4 py-3 text-sm text-texto"
        >
          {columna.mostrar
            ? columna.mostrar(registro)
            : String(registro[columna.clave] ?? '—')}
        </td>
      ))}
    </tr>
  );
}

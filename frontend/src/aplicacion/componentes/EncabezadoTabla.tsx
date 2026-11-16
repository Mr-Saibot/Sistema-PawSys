import type { ColumnaTabla } from '../tipos/tabla';

interface PropiedadesEncabezadoTabla<Registro> {
  columnas: ColumnaTabla<Registro>[];
}

export function EncabezadoTabla<Registro>({
  columnas,
}: PropiedadesEncabezadoTabla<Registro>) {
  return (
    <thead>
      <tr className="border-b border-borde text-xs text-texto-suave">
        {columnas.map((columna) => (
          <th
            key={String(columna.clave)}
            className="px-4 py-3 font-medium"
            scope="col"
          >
            {columna.titulo}
          </th>
        ))}
      </tr>
    </thead>
  );
}

import { EstadoFichaError } from './EstadoFichaError';
import { PantallaCarga } from './PantallaCarga';

interface PropiedadesEstadoPaginaFicha {
  identificadorValido: boolean;
  cargando: boolean;
  error: string;
}

export function EstadoPaginaFicha({
  identificadorValido,
  cargando,
  error,
}: PropiedadesEstadoPaginaFicha) {
  const contenido = cargando
    ? <PantallaCarga />
    : (
      <EstadoFichaError
        error={error}
        identificadorValido={identificadorValido}
      />
    );

  return contenido;
}

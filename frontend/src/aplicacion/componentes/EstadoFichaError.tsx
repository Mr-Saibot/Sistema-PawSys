import { AlertCircle } from 'lucide-react';
import { EstadoVacio } from './EstadoVacio';

interface PropiedadesEstadoFichaError {
  error: string;
  identificadorValido: boolean;
}

export function EstadoFichaError({
  error,
  identificadorValido,
}: PropiedadesEstadoFichaError) {
  const descripcion = identificadorValido
    ? error || 'Revisá el enlace o pedí acceso al equipo de la clínica.'
    : 'El identificador del paciente no es válido.';

  return (
    <EstadoVacio
      icono={<AlertCircle size={22} />}
      titulo="No pudimos abrir esta ficha"
      descripcion={descripcion}
      accion={
        <a
          className="text-sm font-medium text-primario-oscuro"
          href="/index.html"
        >
          Volver a PawSys
        </a>
      }
    />
  );
}

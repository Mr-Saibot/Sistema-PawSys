import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  type LucideIcon,
} from 'lucide-react';
import { useConfirmacionTurno } from '../hooks/useConfirmacionTurno';

type EstadoConfirmacion = 'cargando' | 'confirmado' | 'error';

const CLASES_BOTON = [
  'inline-flex min-h-11 items-center justify-center',
  'rounded-control bg-primario px-5 py-3 font-medium text-white',
  'hover:bg-primario-oscuro',
].join(' ');

function obtenerIcono(estado: EstadoConfirmacion): LucideIcon {
  if (estado === 'confirmado') {
    return CheckCircle2;
  }
  if (estado === 'error') {
    return CircleAlert;
  }
  return LoaderCircle;
}

function obtenerTitulo(estado: EstadoConfirmacion): string {
  if (estado === 'confirmado') {
    return 'Turno confirmado';
  }
  if (estado === 'error') {
    return 'No pudimos confirmar';
  }
  return 'Confirmando tu turno';
}

export function ConfirmarTurno() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') || '';
  const resultado = useConfirmacionTurno(token);
  const confirmacionLista = resultado.estado !== 'cargando';
  const Icono = obtenerIcono(resultado.estado);

  return (
    <main className="flex min-h-screen items-center justify-center bg-fondo p-6">
      <section
        className="w-full max-w-xl rounded-tarjeta border border-borde
          bg-superficie p-8 text-center shadow-sutil"
        aria-live="polite"
      >
        <span
          className="mx-auto mb-6 block h-8 w-8 rounded-full bg-primario"
          aria-hidden="true"
        />
        <Icono
          className="mx-auto mb-5 h-12 w-12 text-verde-profundo"
          aria-hidden="true"
        />
        <h1 className="mb-3 text-2xl font-semibold text-texto">
          {obtenerTitulo(resultado.estado)}
        </h1>
        <p className="mb-7 text-texto-suave">{resultado.mensaje}</p>
        {!confirmacionLista && (
          <div className="mb-5 text-sm text-texto-suave" role="status">
            Procesando la confirmación…
          </div>
        )}
        <Link className={CLASES_BOTON} to="/login">
          Volver a PawSys
        </Link>
      </section>
    </main>
  );
}

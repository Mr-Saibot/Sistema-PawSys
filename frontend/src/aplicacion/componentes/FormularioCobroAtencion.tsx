import { useState, type FormEvent } from 'react';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';

type TipoAtencionCobro = 'consultas' | 'vacunaciones';

interface PropiedadesFormularioCobro {
  tipo: TipoAtencionCobro;
  identificador: number;
  cajaId: number;
}

export function FormularioCobroAtencion({
  tipo,
  identificador,
  cajaId,
}: PropiedadesFormularioCobro) {
  const { modificar } = usePanelClinica();
  const [formaPago, establecerFormaPago] = useState('EFECTIVO');
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);

    try {
      await modificar(`/ingresos/${tipo}/${identificador}`, 'POST', {
        cajaId,
        formaPago,
      });
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={registrar}>
      <select
        className="min-h-10 rounded-control border border-borde
          bg-superficie px-3 text-sm"
        onChange={(evento) => establecerFormaPago(evento.target.value)}
        value={formaPago}
        aria-label="Forma de pago"
      >
        <option value="EFECTIVO">Efectivo</option>
        <option value="TRANSFERENCIA_QR">Transferencia / QR verificada</option>
      </select>
      <Boton type="submit" disabled={guardando}>
        {guardando ? 'Registrando...' : 'Confirmar cobro'}
      </Boton>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
    </form>
  );
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo registrar el cobro.';
}

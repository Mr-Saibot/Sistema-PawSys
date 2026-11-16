import { useState, type FormEvent } from 'react';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

export function FormularioAbrirCaja() {
  const { modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function abrir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);
    const saldoInicial = Number(
      new FormData(evento.currentTarget).get('saldoInicial'),
    );

    try {
      await modificar('/caja/abrir', 'POST', { saldoInicial });
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={abrir}>
      <label className="grid gap-1 text-sm font-medium">
        Saldo inicial (Gs.)
        <EntradaTexto
          name="saldoInicial"
          type="number"
          min="0"
          step="1"
          defaultValue="0"
          required
        />
      </label>
      <div className="self-end">
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Abriendo...' : 'Abrir caja'}
        </Boton>
      </div>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
    </form>
  );
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo abrir la caja.';
}

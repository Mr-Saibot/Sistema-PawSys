import { useState, type FormEvent } from 'react';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

type TipoMovimiento = 'ingreso' | 'egreso';

interface PropiedadesFormularioMovimiento {
  tipo: TipoMovimiento;
  cajaId: number;
  alGuardar: () => void;
}

export function FormularioMovimientoCaja({
  tipo,
  cajaId,
  alGuardar,
}: PropiedadesFormularioMovimiento) {
  const { modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);
    const valores = new FormData(evento.currentTarget);

    try {
      const datos = crearDatosMovimiento(valores, tipo, cajaId);
      await modificar(tipo === 'ingreso' ? '/ingresos' : '/egresos', 'POST', datos);
      alGuardar();
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={guardar}>
      <label className="grid gap-1 text-sm font-medium">
        Concepto
        <EntradaTexto name="concepto" required maxLength={120} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Monto (Gs.)
        <EntradaTexto name="monto" type="number" min="1" step="1" required />
      </label>
      {tipo === 'ingreso' ? <CampoFormaPago /> : <CamposEgreso />}
      <label className="grid gap-1 text-sm font-medium">
        Descripción
        <EntradaTexto name="descripcion" maxLength={250} />
      </label>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <Boton type="submit" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Registrar movimiento'}
      </Boton>
    </form>
  );
}

function CampoFormaPago() {
  return (
    <label className="grid gap-1 text-sm font-medium">
      Forma de pago
      <select className={claseCampo} name="formaPago" required>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TRANSFERENCIA_QR">Transferencia / QR verificada</option>
      </select>
    </label>
  );
}

function CamposEgreso() {
  return (
    <>
      <label className="grid gap-1 text-sm font-medium">
        Categoría
        <EntradaTexto name="categoria" required maxLength={80} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Proveedor
        <EntradaTexto name="proveedor" maxLength={120} />
      </label>
    </>
  );
}

const claseCampo = `min-h-11 rounded-control border border-borde
  bg-superficie px-3 text-texto`;

function crearDatosMovimiento(
  valores: FormData,
  tipo: TipoMovimiento,
  cajaId: number,
): Record<string, number | string> {
  const datos: Record<string, number | string> = {
    cajaId,
    concepto: texto(valores, 'concepto'),
    monto: Number(valores.get('monto')),
    origen: 'CAJA',
  };
  const descripcion = texto(valores, 'descripcion');

  if (descripcion) {
    datos.descripcion = descripcion;
  }
  if (tipo === 'ingreso') {
    datos.formaPago = texto(valores, 'formaPago');
  } else {
    datos.categoria = texto(valores, 'categoria');
    const proveedor = texto(valores, 'proveedor');
    if (proveedor) {
      datos.proveedor = proveedor;
    }
    delete datos.origen;
  }
  return datos;
}

function texto(valores: FormData, campo: string): string {
  return String(valores.get(campo) || '').trim();
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo registrar el movimiento.';
}

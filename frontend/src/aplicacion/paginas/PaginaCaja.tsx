import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, LockKeyhole, Wallet } from 'lucide-react';
import { enviarApi } from '../../servicios/api.js';
import type { ReporteCaja } from '../../tipos';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { FormularioAbrirCaja } from '../componentes/FormularioAbrirCaja';
import { FormularioCobroAtencion } from '../componentes/FormularioCobroAtencion';
import { FormularioMovimientoCaja } from '../componentes/FormularioMovimientoCaja';
import { Tarjeta } from '../componentes/Tarjeta';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { formatearGuaranies } from '../utilidades/formato-clinica';
import type { Consulta, Vacunacion } from '../../tipos';

type AtencionPendiente =
  | { tipo: 'consultas'; atencion: Consulta }
  | { tipo: 'vacunaciones'; atencion: Vacunacion };

export function PaginaCaja() {
  const { datos, sesion, modificar } = usePanelClinica();
  const [reporte, establecerReporte] = useState<ReporteCaja | null>(null);
  const [fecha, establecerFecha] = useState(fechaActual());
  const [error, establecerError] = useState('');
  const caja = datos.cajas.find((item) => item.estado === 'ABIERTA');
  const esAdministrador = sesion.usuario.rol === 'ADMINISTRADOR';
  const pendientes = obtenerAtencionesPendientes(datos.consultas, datos.vacunaciones);
  const totalIngresos = sumarMontos(datos.ingresos.map((item) => item.monto));
  const totalEgresos = sumarMontos(datos.egresos.map((item) => item.monto));

  async function cerrarCaja() {
    if (!caja || !window.confirm('¿Cerrar la caja actual?')) {
      return;
    }
    try {
      await modificar(`/caja/${caja.id}/cerrar`, 'POST');
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  async function cargarReporte() {
    if (!caja) {
      return;
    }
    establecerError('');
    try {
      const resultado = await enviarApi<ReporteCaja>(
        `/caja/${caja.id}/reporte-diario?fecha=${encodeURIComponent(fecha)}`,
        sesion.token,
      );
      establecerReporte(resultado);
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  return (
    <div>
      <EncabezadoModulo
        titulo={esAdministrador ? 'Caja' : 'Cobros'}
        descripcion={esAdministrador
          ? 'Controlá los movimientos y el saldo de la clínica.'
          : 'Registrá el pago de las consultas y vacunas que atendiste.'}
      />
      {error && <p className="mb-4 text-sm text-error" role="alert">{error}</p>}
      <ResumenCaja
        abierta={Boolean(caja)}
        saldo={caja?.saldoActual || 0}
        ingresos={totalIngresos}
        egresos={totalEgresos}
      />
      {!caja
        ? esAdministrador
          ? <Tarjeta className="mt-5 p-5">
            <h2 className="mb-3 font-semibold">Abrir caja</h2>
            <FormularioAbrirCaja />
          </Tarjeta>
          : <EstadoVacio
            titulo="No hay una caja abierta"
            descripcion="Avisá a administración para habilitar los cobros."
          />
        : <ContenidoCaja
          cajaId={caja.id}
          esAdministrador={esAdministrador}
          pendientes={pendientes}
          alCerrarCaja={() => void cerrarCaja()}
          fecha={fecha}
          alCambiarFecha={establecerFecha}
          alCargarReporte={() => void cargarReporte()}
          reporte={reporte}
        />}
    </div>
  );
}

interface PropiedadesContenidoCaja {
  cajaId: number;
  esAdministrador: boolean;
  pendientes: AtencionPendiente[];
  alCerrarCaja: () => void;
  fecha: string;
  alCambiarFecha: (fecha: string) => void;
  alCargarReporte: () => void;
  reporte: ReporteCaja | null;
}

function ContenidoCaja({
  cajaId,
  esAdministrador,
  pendientes,
  alCerrarCaja,
  fecha,
  alCambiarFecha,
  alCargarReporte,
  reporte,
}: PropiedadesContenidoCaja) {
  const { datos } = usePanelClinica();

  return (
    <div className="mt-5 grid gap-5">
      <Tarjeta className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="font-semibold">Caja abierta #{cajaId}</h2>
          <p className="text-sm text-texto-suave">
            Las atenciones se cobran cuando el pago se recibió o verificó.
          </p>
        </div>
        {esAdministrador && (
          <Boton
            variante="secundario"
            icono={<LockKeyhole size={16} />}
            onClick={alCerrarCaja}
          >
            Cerrar caja
          </Boton>
        )}
      </Tarjeta>
      {esAdministrador && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Tarjeta className="p-5">
            <h2 className="mb-3 font-semibold">Registrar ingreso</h2>
            <FormularioMovimientoCaja
              tipo="ingreso"
              cajaId={cajaId}
              alGuardar={() => undefined}
            />
          </Tarjeta>
          <Tarjeta className="p-5">
            <h2 className="mb-3 font-semibold">Registrar egreso</h2>
            <FormularioMovimientoCaja
              tipo="egreso"
              cajaId={cajaId}
              alGuardar={() => undefined}
            />
          </Tarjeta>
        </div>
      )}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Atenciones pendientes de cobro</h2>
        {pendientes.length
          ? <ul className="grid gap-3">
            {pendientes.map((pendiente) => (
              <FilaAtencion
                key={`${pendiente.tipo}-${pendiente.atencion.id}`}
                pendiente={pendiente}
                cajaId={cajaId}
              />
            ))}
          </ul>
          : <EstadoVacio
            titulo="Todo al día"
            descripcion="No hay consultas o vacunaciones pendientes de cobro."
          />}
      </section>
      {esAdministrador && (
        <ResumenMovimientos
          ingresos={datos.ingresos}
          egresos={datos.egresos}
          fecha={fecha}
          alCambiarFecha={alCambiarFecha}
          alCargarReporte={alCargarReporte}
          reporte={reporte}
        />
      )}
    </div>
  );
}

function ResumenCaja({
  abierta,
  saldo,
  ingresos,
  egresos,
}: {
  abierta: boolean;
  saldo: number | string;
  ingresos: number;
  egresos: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Tarjeta className="flex items-center gap-3 p-4">
        <Wallet className="text-verde-profundo" size={20} />
        <div>
          <p className="text-xs text-texto-suave">Estado de caja</p>
          <strong>{abierta ? 'Abierta' : 'Cerrada'}</strong>
        </div>
      </Tarjeta>
      <Tarjeta className="flex items-center gap-3 p-4">
        <ArrowUpRight className="text-exito" size={20} />
        <div>
          <p className="text-xs text-texto-suave">Ingresos cargados</p>
          <strong>{formatearGuaranies(ingresos)}</strong>
        </div>
      </Tarjeta>
      <Tarjeta className="flex items-center gap-3 p-4">
        <ArrowDownLeft className="text-error" size={20} />
        <div>
          <p className="text-xs text-texto-suave">
            {abierta ? 'Saldo actual' : 'Egresos cargados'}
          </p>
          <strong>{abierta
            ? formatearGuaranies(saldo)
            : formatearGuaranies(egresos)}</strong>
        </div>
      </Tarjeta>
    </div>
  );
}

function FilaAtencion({
  pendiente,
  cajaId,
}: {
  pendiente: AtencionPendiente;
  cajaId: number;
}) {
  const atencion = pendiente.atencion;
  const mascota = atencion.historial?.mascota?.nombre
    || `Ficha #${atencion.historialId}`;
  const concepto = pendiente.tipo === 'consultas'
    ? `Consulta · ${pendiente.atencion.motivo}`
    : `Vacunación · ${pendiente.atencion.vacuna}`;

  return (
    <Tarjeta className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <h3 className="font-medium">{concepto}</h3>
        <p className="text-sm text-texto-suave">
          {mascota} · {formatearGuaranies(atencion.costo)}
        </p>
      </div>
      <FormularioCobroAtencion
        tipo={pendiente.tipo}
        identificador={atencion.id}
        cajaId={cajaId}
      />
    </Tarjeta>
  );
}

function ResumenMovimientos({
  ingresos,
  egresos,
  fecha,
  alCambiarFecha,
  alCargarReporte,
  reporte,
}: {
  ingresos: ReturnType<typeof usePanelClinica>['datos']['ingresos'];
  egresos: ReturnType<typeof usePanelClinica>['datos']['egresos'];
  fecha: string;
  alCambiarFecha: (fecha: string) => void;
  alCargarReporte: () => void;
  reporte: ReporteCaja | null;
}) {
  const totalIngresos = sumarMontos(ingresos.map((ingreso) => ingreso.monto));
  const totalEgresos = sumarMontos(egresos.map((egreso) => egreso.monto));
  const anchoIngresos = porcentaje(totalIngresos, totalEgresos);
  const anchoEgresos = porcentaje(totalEgresos, totalIngresos);

  return (
    <Tarjeta className="grid gap-5 p-5">
      <div>
        <h2 className="font-semibold">Ingresos y egresos</h2>
        <p className="text-sm text-texto-suave">
          Comparación de movimientos cargados.
        </p>
      </div>
      <FilaGrafico etiqueta="Ingresos" total={totalIngresos}
        porcentaje={anchoIngresos} tono="bg-exito" />
      <FilaGrafico etiqueta="Egresos" total={totalEgresos}
        porcentaje={anchoEgresos} tono="bg-error" />
      <div className="flex flex-wrap items-end gap-3 border-t border-borde pt-4">
        <label className="grid gap-1 text-sm text-texto-suave">
          Reporte diario
          <input
            className="min-h-10 rounded-control border border-borde
              bg-superficie px-3 text-texto"
            onChange={(evento) => alCambiarFecha(evento.target.value)}
            type="date"
            value={fecha}
          />
        </label>
        <Boton variante="secundario" onClick={alCargarReporte}>
          Ver reporte
        </Boton>
        {reporte && (
          <p className="text-sm text-texto-suave">
            Balance del {reporte.fecha}:
            {' '}{formatearGuaranies(
              reporte.totalIngresos - reporte.totalEgresos,
            )}
          </p>
        )}
      </div>
    </Tarjeta>
  );
}

function FilaGrafico({
  etiqueta,
  total,
  porcentaje: ancho,
  tono,
}: {
  etiqueta: string;
  total: number;
  porcentaje: number;
  tono: string;
}) {
  return (
    <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 text-sm">
      <span className="text-texto-suave">{etiqueta}</span>
      <div className="h-2 overflow-hidden rounded-full bg-fondo">
        <div className={`h-full rounded-full ${tono}`}
          style={{ width: `${ancho}%` }} />
      </div>
      <strong>{formatearGuaranies(total)}</strong>
    </div>
  );
}

function obtenerAtencionesPendientes(
  consultas: ReturnType<typeof usePanelClinica>['datos']['consultas'],
  vacunaciones: ReturnType<typeof usePanelClinica>['datos']['vacunaciones'],
): AtencionPendiente[] {
  return [
    ...consultas
      .filter((consulta) => !consulta.ingreso)
      .map((atencion) => ({ tipo: 'consultas' as const, atencion })),
    ...vacunaciones
      .filter((vacuna) => !vacuna.ingreso)
      .map((atencion) => ({ tipo: 'vacunaciones' as const, atencion })),
  ];
}

function sumarMontos(montos: (number | string)[]): number {
  return montos.reduce<number>(
    (total, monto) => total + Number(monto),
    0,
  );
}

function porcentaje(valor: number, otroValor: number): number {
  const maximo = Math.max(valor, otroValor);
  return maximo === 0 ? 0 : Math.round((valor / maximo) * 100);
}

function fechaActual(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo completar la operación de caja.';
}

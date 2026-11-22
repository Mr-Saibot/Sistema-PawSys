import { useEffect, useState } from 'react';
import { Banknote, QrCode } from 'lucide-react';
import { obtenerConfiguracionPagos, obtenerUrlApiGuardada } from '../../servicios/api.js';
import type { ConfiguracionPagos } from '../../tipos';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { Tarjeta } from '../componentes/Tarjeta';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { formatearGuaranies } from '../utilidades/formato-clinica';

export function PaginaPagos() {
  const { datos, sesion } = usePanelClinica();
  const [configuracion, establecerConfiguracion] =
    useState<ConfiguracionPagos | null>(null);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState('');

  useEffect(() => {
    let cancelado = false;
    obtenerConfiguracionPagos()
      .then((resultado) => {
        if (!cancelado) {
          establecerConfiguracion(resultado);
        }
      })
      .catch((causa: unknown) => {
        if (!cancelado) {
          establecerError(mensajeError(causa));
        }
      })
      .finally(() => {
        if (!cancelado) {
          establecerCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const urlQr = construirUrlQr(configuracion?.qrImageUrl);

  return (
    <div>
      <EncabezadoModulo
        titulo="Pagos"
        descripcion="Elegí cómo pagar los servicios de la clínica."
      />
      {error && <p className="mb-4 text-sm text-error" role="alert">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta className="p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full
              bg-primario-suave text-primario-oscuro">
              <QrCode size={19} />
            </span>
            <div>
              <h2 className="font-semibold">Transferencia por QR</h2>
              <p className="text-sm text-texto-suave">
                Escaneá desde la aplicación de tu banco.
              </p>
            </div>
          </div>
          {cargando
            ? <div className="h-56 animate-pulse rounded-control bg-fondo" />
            : urlQr
              ? <img
                className="mx-auto max-h-64 rounded-control border
                  border-borde object-contain"
                src={urlQr}
                alt="Código QR de la cuenta de la clínica"
              />
              : <EstadoVacio
                titulo="QR todavía no configurado"
                descripcion="Consultá en recepción por otros medios de pago."
              />}
          <div className="mt-4 grid gap-2 text-sm">
            {configuracion?.titular && (
              <p><span className="text-texto-suave">Titular: </span>
                <strong>{configuracion.titular}</strong>
              </p>
            )}
            {configuracion?.alias && (
              <p><span className="text-texto-suave">Alias: </span>
                <strong>{configuracion.alias}</strong>
              </p>
            )}
          </div>
        </Tarjeta>
        <Tarjeta className="p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full
              bg-primario-suave text-primario-oscuro">
              <Banknote size={19} />
            </span>
            <h2 className="font-semibold">Pago en efectivo</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-texto-suave">
            También podés pagar en efectivo en recepción después de la
            atención.
          </p>
          <p className="mt-4 rounded-control bg-fondo p-3 text-sm
            text-texto-suave">
            Si transferís, presentá el comprobante. El personal confirma el
            pago cuando verifica que el dinero fue recibido.
          </p>
        </Tarjeta>
      </div>
      {sesion.usuario.rol === 'CLIENTE' && (
        <Tarjeta className="mt-5 p-5 sm:p-7">
          <h2 className="font-semibold">Servicios pagados</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Consultá el detalle de tus consultas y vacunaciones cobradas.
          </p>
          {datos.ingresos.length
            ? <ul className="mt-4 divide-y divide-borde">
              {datos.ingresos.map((ingreso) => (
                <li className="grid gap-1 py-3 sm:grid-cols-[1fr_auto]" key={ingreso.id}>
                  <div>
                    <strong>{nombreServicio(ingreso)}</strong>
                    <p className="text-sm text-texto-suave">
                      {new Date(ingreso.fecha).toLocaleDateString('es-PY')}
                      {' · '}{textoFormaPago(ingreso.formaPago)}
                    </p>
                  </div>
                  <strong>{formatearGuaranies(ingreso.monto)}</strong>
                </li>
              ))}
            </ul>
            : <p className="mt-4 text-sm text-texto-suave">
              Todavía no tenés servicios pagados registrados.
            </p>}
        </Tarjeta>
      )}
    </div>
  );
}

function nombreServicio(ingreso: import('../../tipos').Ingreso): string {
  if (ingreso.consulta) {
    return `Consulta: ${ingreso.consulta.motivo}`;
  }
  if (ingreso.vacunacion) {
    return `Vacunación: ${ingreso.vacunacion.vacuna}`;
  }
  return ingreso.concepto;
}

function textoFormaPago(formaPago: string): string {
  if (formaPago === 'TRANSFERENCIA_QR') {
    return 'Transferencia / QR';
  }
  return 'Efectivo';
}

function construirUrlQr(url?: string): string {
  if (!url) {
    return '';
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const api = obtenerUrlApiGuardada().replace(/\/$/, '');
  return `${api}${url.startsWith('/') ? url : `/${url}`}`;
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo cargar la información de pagos.';
}

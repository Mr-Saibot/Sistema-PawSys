import { renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type {
  ConfiguracionPagos,
  Consulta,
  DatosPanel,
  Vacunacion,
} from '../tipos.js';

function guaranies(monto: number | string): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(Number(monto));
}

function nombrePaciente(
  atencion: Consulta | Vacunacion,
): string {
  return atencion.historial?.mascota?.nombre
    || `Historial #${atencion.historialId}`;
}

function imagenQr(
  configuracion: ConfiguracionPagos | null | undefined,
): string {
  const url = configuracion?.qrImageUrl || '';
  const urlValida = /^https?:\/\//i.test(url)
    || (url.startsWith('/') && !url.startsWith('//'));

  if (!urlValida) {
    return '<p>La clínica no configuró un código QR.</p>';
  }

  return `
    <img
      class="payment-qr payment-qr-small"
      src="${escaparHtml(url)}"
      alt="Código QR de la clínica"
    />
  `;
}

function formularioCobro(
  tipo: 'consulta' | 'vacunacion',
  id: number,
  cajaAbierta: boolean,
): string {
  if (!cajaAbierta) {
    return '<span class="tag">Caja cerrada</span>';
  }

  return `
    <form
      class="form-grid compact-form"
      data-cobro-atencion
      data-tipo-atencion="${tipo}"
      data-id-atencion="${id}"
    >
      <label class="field">
        Forma de pago
        <select name="formaPago" required>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA_QR">
            Transferencia / QR verificada
          </option>
        </select>
      </label>
      <button class="primary-button" type="submit">
        Registrar cobro
      </button>
      <div class="login-error" role="alert"></div>
    </form>
  `;
}

function filaConsulta(
  consulta: Consulta,
  cajaAbierta: boolean,
): string {
  const detalle = `Consulta: ${consulta.motivo}`;
  const paciente = nombrePaciente(consulta);
  const monto = escaparHtml(guaranies(consulta.costo));
  const formulario = formularioCobro('consulta', consulta.id, cajaAbierta);

  return `
    <tr>
      <td>${escaparHtml(detalle)}</td>
      <td>${escaparHtml(paciente)}</td>
      <td>${monto}</td>
      <td>${formulario}</td>
    </tr>
  `;
}

function filaVacunacion(
  vacunacion: Vacunacion,
  cajaAbierta: boolean,
): string {
  const detalle = `Vacunación: ${vacunacion.vacuna}`;
  const paciente = nombrePaciente(vacunacion);
  const monto = escaparHtml(guaranies(vacunacion.costo));
  const formulario = formularioCobro(
    'vacunacion',
    vacunacion.id,
    cajaAbierta,
  );

  return `
    <tr>
      <td>${escaparHtml(detalle)}</td>
      <td>${escaparHtml(paciente)}</td>
      <td>${monto}</td>
      <td>${formulario}</td>
    </tr>
  `;
}

export function renderizarCobrosVeterinario(
  datos: DatosPanel,
  configuracion: ConfiguracionPagos | null | undefined,
  errorPagos = '',
): string {
  const caja = datos.cajas.find((item) => item.estado === 'ABIERTA');
  const consultasPendientes = datos.consultas.filter(
    (consulta) => !consulta.ingreso,
  );
  const vacunasPendientes = datos.vacunaciones.filter(
    (vacuna) => !vacuna.ingreso,
  );
  const pendientes = [
    ...consultasPendientes.map((consulta) => (
      filaConsulta(consulta, Boolean(caja))
    )),
    ...vacunasPendientes.map((vacuna) => (
      filaVacunacion(vacuna, Boolean(caja))
    )),
  ].join('');
  const filas = pendientes
    || `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            No tienes atenciones pendientes de cobro.
          </div>
        </td>
      </tr>
    `;
  const cajaTexto = caja
    ? `Caja abierta #${caja.id}`
    : 'Solicita al administrador que abra la caja.';
  const saldoTexto = caja ? guaranies(caja.saldoActual) : '—';

  const indicadores = renderizarIndicadores([
    ['Estado de caja', caja ? 'Abierta' : 'Cerrada', cajaTexto, '$'],
    ['Saldo disponible', saldoTexto, 'Caja actual', '='],
    [
      'Pendientes',
      String(consultasPendientes.length + vacunasPendientes.length),
      'Tus atenciones',
      '◷',
    ],
  ]);
  const avisoError = errorPagos
    ? `<div class="notice notice-error">${escaparHtml(errorPagos)}</div>`
    : '';
  const qr = imagenQr(configuracion);
  const titular = escaparHtml(
    configuracion?.titular || 'Cuenta de la clínica',
  );
  const alias = escaparHtml(
    configuracion?.alias || 'Pendiente de configurar',
  );

  return `
    ${renderizarEncabezado(
      'Cobros',
      'Registra el pago cuando recibas efectivo o verifiques la transferencia.',
    )}
    ${indicadores}
    ${avisoError}
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>Atenciones pendientes</h2>
          <p>Un cobro se registra una sola vez por atención.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Atención</th>
              <th>Mascota</th>
              <th>Monto</th>
              <th>Registrar pago</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </section>
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>Pago por transferencia</h2>
          <p>
            El QR no confirma el pago; verifica el depósito antes de registrarlo.
          </p>
        </div>
      </div>
      <div class="payment-preview">
        ${qr}
        <div>
          <strong>${titular}</strong>
          <p>Alias: ${alias}</p>
        </div>
      </div>
    </section>
  `;
}

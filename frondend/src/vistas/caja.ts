import { renderizarEncabezado, renderizarIndicadores } from '../componentes/panel.js';
import { escaparHtml } from '../utilidades/formato-html.js';
import type { ConfiguracionPagos, DatosPanel, ReporteCaja, Sesion } from '../tipos.js';

function guaranies(valor: number | string): string {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(Number(valor));
}

export function renderizarCaja(
  datos: DatosPanel,
  sesion: Sesion,
  configuracion: ConfiguracionPagos | null | undefined,
  errorPagos = '',
  reporte?: ReporteCaja | null,
): string {
  if (sesion.demostracion) {
    return `${renderizarEncabezado('Caja', 'Resumen de movimientos y estado de caja.')}<div class="notice">Los datos de demostración no representan movimientos reales.</div>`;
  }
  const caja = datos.cajas.find((item) => item.estado === 'ABIERTA');
  const saldo = caja ? guaranies(caja.saldoActual) : guaranies(0);
  const ingresos = datos.ingresos.reduce((total, ingreso) => total + Number(ingreso.monto), 0);
  const egresos = datos.egresos.reduce((total, egreso) => total + Number(egreso.monto), 0);
  const movimientos = [
    ...datos.ingresos.map((item) => ({ fecha: item.fecha, concepto: item.concepto, responsable: item.responsable, monto: Number(item.monto), tipo: item.formaPago })),
    ...datos.egresos.map((item) => ({ fecha: item.fecha, concepto: item.concepto, responsable: item.responsable, monto: -Number(item.monto), tipo: 'Egreso' })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const configuracionQr = configuracion?.qrImageUrl && (/^https?:\/\//i.test(configuracion.qrImageUrl) || (configuracion.qrImageUrl.startsWith('/') && !configuracion.qrImageUrl.startsWith('//')))
    ? `<img class="payment-qr payment-qr-small" src="${escaparHtml(configuracion.qrImageUrl)}" alt="Código QR de la clínica" />`
    : '<div class="empty-state">Configura PAYMENT_QR_IMAGE_URL para mostrar el QR bancario.</div>';
  const cajaForm = caja
    ? `<div class="section-heading"><div><h2>Caja abierta #${caja.id}</h2><p>Saldo actual: ${saldo}</p></div><div><button class="secondary-button" type="button" data-reporte-caja="${caja.id}">Ver reporte</button><button class="secondary-button" type="button" data-cerrar-caja="${caja.id}">Cerrar caja</button></div></div>`
    : `<div class="section-heading"><div><h2>No hay caja abierta</h2><p>Abre la caja para registrar movimientos.</p></div></div><form id="abrir-caja-form" class="form-grid"><label class="field">Saldo inicial (Gs.)<input name="saldoInicial" type="number" min="0" step="1" value="0" required /></label><button class="primary-button" type="submit">Abrir caja</button><div class="login-error" role="alert"></div></form>`;
  const formasDePago = `<section class="section-block"><div class="section-heading"><div><h2>Registrar ingreso</h2><p>Anota el cobro después de recibirlo o verificar la transferencia.</p></div></div>${caja ? `<form id="ingreso-form" class="form-grid"><label class="field">Concepto<input name="concepto" required maxlength="120" /></label><label class="field">Monto (Gs.)<input name="monto" type="number" min="1" step="1" required /></label><label class="field">Forma de pago<select name="formaPago" required><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA_QR">Transferencia / QR (verificada)</option></select></label><label class="field">Descripción<input name="descripcion" maxlength="250" /></label><button class="primary-button" type="submit">Registrar ingreso</button><div class="login-error" role="alert"></div></form><div class="payment-preview">${configuracionQr}<div><strong>${escaparHtml(configuracion?.titular || 'Cuenta de la clínica')}</strong><p>Alias: ${escaparHtml(configuracion?.alias || 'Pendiente de configurar')}</p><p>El QR no confirma el pago: verifica el ingreso en la cuenta antes de registrarlo.</p>${errorPagos ? `<div class="notice notice-error">${escaparHtml(errorPagos)}</div>` : ''}</div></div>` : '<div class="notice">Abre una caja antes de registrar ingresos.</div>'}</section>`;
  const egresoForm = caja
    ? `<section class="section-block"><div class="section-heading"><div><h2>Registrar egreso</h2><p>Registra gastos pagados desde esta caja.</p></div></div><form id="egreso-form" class="form-grid"><label class="field">Concepto<input name="concepto" required maxlength="120" /></label><label class="field">Categoría<input name="categoria" required maxlength="80" /></label><label class="field">Monto (Gs.)<input name="monto" type="number" min="1" step="1" required /></label><label class="field">Proveedor<input name="proveedor" maxlength="120" /></label><label class="field">Descripción<input name="descripcion" maxlength="250" /></label><button class="primary-button" type="submit">Registrar egreso</button><div class="login-error" role="alert"></div></form></section>`
    : '';
  const filas = movimientos.length
    ? movimientos.slice(0, 30).map((item) => `<tr><td>${escaparHtml(item.concepto)}</td><td>${escaparHtml(item.responsable)}</td><td>${escaparHtml(new Date(item.fecha).toLocaleString('es-PY'))}</td><td>${escaparHtml(item.tipo)}</td><td>${escaparHtml(guaranies(item.monto))}</td></tr>`).join('')
    : '<tr><td colspan="5"><div class="empty-state">No hay movimientos registrados.</div></td></tr>';
  const reportes = reporte ? `<section class="section-block"><div class="section-heading"><div><h2>Reporte de caja #${reporte.cajaId}</h2><p>Estado: ${escaparHtml(reporte.estado)}</p></div></div>${renderizarIndicadores([['Ingresos', guaranies(reporte.totalIngresos), 'Total de la caja', '↗'], ['Egresos', guaranies(reporte.totalEgresos), 'Total de la caja', '↘'], ['Saldo calculado', guaranies(Number(reporte.totalIngresos) - Number(reporte.totalEgresos)), 'Sin saldo inicial', '=']])}</section>` : '';
  const cajas = datos.cajas.length
    ? `<section class="section-block"><div class="section-heading"><div><h2>Historial de cajas</h2><p>${datos.cajas.length} cajas registradas</p></div></div><div class="table-wrap"><table><thead><tr><th>Número</th><th>Apertura</th><th>Estado</th><th>Saldo</th><th>Acciones</th></tr></thead><tbody>${datos.cajas.map((item) => `<tr><td>#${item.id}</td><td>${escaparHtml(new Date(item.fechaApertura).toLocaleString('es-PY'))}</td><td>${escaparHtml(item.estado)}</td><td>${guaranies(item.saldoActual)}</td><td><button class="text-button" type="button" data-reporte-caja="${item.id}">Ver reporte</button></td></tr>`).join('')}</tbody></table></div></section>`
    : '';
  return `${renderizarEncabezado('Caja', 'Gestiona la caja y registra cobros en guaraníes.')}${datos.errorConexion ? `<div class="notice notice-error">Algunos datos no se cargaron: ${escaparHtml(datos.errorRecursos.join(' · '))}</div>` : ''}${renderizarIndicadores([['Estado', caja ? 'Abierta' : 'Cerrada', caja ? `Caja #${caja.id}` : 'Sin caja abierta', '$'], ['Ingresos', guaranies(ingresos), 'Movimientos cargados', '↗'], ['Egresos', guaranies(egresos), 'Movimientos cargados', '↘'], ['Saldo actual', saldo, 'Caja abierta', '=']])}<section class="section-block">${cajaForm}</section>${reportes}${formasDePago}${egresoForm}<section class="section-block"><div class="section-heading"><div><h2>Movimientos recientes</h2><p>Ingresos y egresos registrados</p></div></div><div class="table-wrap"><table><thead><tr><th>Concepto</th><th>Responsable</th><th>Fecha</th><th>Medio</th><th>Monto</th></tr></thead><tbody>${filas}</tbody></table></div></section>${cajas}`;
}

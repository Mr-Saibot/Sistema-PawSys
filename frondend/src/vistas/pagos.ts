import { escaparHtml } from '../utilidades/formato-html.js';
import { renderizarEncabezado } from '../componentes/panel.js';
import type { ConfiguracionPagos } from '../tipos.js';

function urlQrSegura(valor: string): string {
  const url = valor.trim();
  if (/^https?:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//'))) return url;
  return '';
}

export function renderizarPaginaPagos(configuracion: ConfiguracionPagos | null | undefined, error = ''): string {
  const imagen = urlQrSegura(configuracion?.qrImageUrl || '');
  const alias = configuracion?.alias || '';
  const titular = configuracion?.titular || '';
  return `${renderizarEncabezado('Pagos', 'Instrucciones para pagar los servicios de la clínica.')}${error ? `<div class="notice notice-error">${escaparHtml(error)}</div>` : ''}<section class="section-block payment-panel"><div class="section-heading"><div><h2>Transferencia por QR</h2><p>Escanea el código desde la aplicación bancaria.</p></div></div>${imagen ? `<img class="payment-qr" src="${escaparHtml(imagen)}" alt="Código QR de la cuenta de la veterinaria" />` : '<div class="empty-state">La clínica todavía no configuró su código QR.</div>'}${alias ? `<p><strong>Alias:</strong> ${escaparHtml(alias)}</p>` : ''}${titular ? `<p><strong>Titular:</strong> ${escaparHtml(titular)}</p>` : ''}<div class="notice">Después de transferir, presenta el comprobante al personal de la clínica. La transferencia se registra como pagada solo cuando el personal verifica que el dinero fue recibido. También puedes pagar en efectivo en recepción.</div></section>`;
}

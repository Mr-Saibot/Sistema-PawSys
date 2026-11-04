import { renderizarEncabezado } from '../componentes/panel.js';

export function renderizarHistoriasClinicas(): string {
  return `${renderizarEncabezado('Historias clínicas', 'Acceso rápido a la información médica de tus pacientes.')}<section class="section-block"><div class="section-heading"><div><h2>Registros clínicos</h2><p>Selecciona un paciente para revisar sus antecedentes</p></div></div><div class="empty-state">El backend tiene historias clínicas por mascota. La pantalla de detalle queda pendiente de definir el flujo clínico con el equipo.</div></section>`;
}
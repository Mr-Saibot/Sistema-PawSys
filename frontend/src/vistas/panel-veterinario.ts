import { renderizarInicioPanel } from '../componentes/panel.js';
import type { DatosPanel } from '../tipos.js';

export function renderizarPanelVeterinario(nombre: string, datos: DatosPanel): string {
  return renderizarInicioPanel(
    'Panel veterinario',
    'Resumen de tu jornada y tus pacientes.',
    `Buen día, ${nombre.split(' ')[0]}`,
    'Consulta tu agenda y el seguimiento clínico de tus pacientes.',
    [
      ['Pacientes', String(datos.mascotas.length), 'Registros disponibles', '✚'],
      ['Turnos', String(datos.turnos.filter((turno) => turno.estado !== 'CANCELADO').length), 'En tu agenda', '◷'],
      ['Historias clínicas', String(datos.historiales.length), 'Fichas registradas', '▤'],
      ['Vacunaciones', String(datos.vacunaciones.length), 'Registros clínicos', '＋'],
    ],
    datos,
  );
}

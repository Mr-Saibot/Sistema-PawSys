import { useMemo } from 'react';
import type { HistorialPaciente } from '../tipos/paciente';
import type { EventoClinico } from '../tipos/evento-clinico';

export function useEventosClinicos(
  historial: HistorialPaciente | null,
): EventoClinico[] {
  return useMemo(() => {
    if (!historial) {
      return [];
    }

    const consultas = crearEventosConsulta(historial);
    const vacunaciones = crearEventosVacunacion(historial);

    return [...consultas, ...vacunaciones].sort((eventoA, eventoB) => (
      new Date(eventoB.fecha).getTime() - new Date(eventoA.fecha).getTime()
    ));
  }, [historial]);
}

function crearEventosConsulta(historial: HistorialPaciente): EventoClinico[] {
  return historial.consultas.map((consulta) => ({
    id: `consulta-${consulta.id}`,
    fecha: consulta.fecha,
    categoria: 'consulta',
    titulo: consulta.motivo,
    diagnostico: consulta.diagnostico,
    tratamiento: consulta.tratamiento,
    veterinario: `${consulta.veterinario.nombre}
      ${consulta.veterinario.apellido}`.trim(),
  }));
}

function crearEventosVacunacion(historial: HistorialPaciente): EventoClinico[] {
  return historial.vacunaciones.map((vacunacion) => ({
    id: `vacunacion-${vacunacion.id}`,
    fecha: vacunacion.fecha,
    categoria: 'vacunacion',
    titulo: vacunacion.vacuna,
    diagnostico: null,
    tratamiento: vacunacion.proximaDosis
      ? `Próxima dosis: ${vacunacion.proximaDosis.slice(0, 10)}`
      : null,
    veterinario: `${vacunacion.veterinario.nombre}
      ${vacunacion.veterinario.apellido}`.trim(),
  }));
}

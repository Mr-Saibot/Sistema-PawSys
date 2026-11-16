import type { Agenda, Turno } from '../../tipos';
import type { RolUsuario } from '../tipos/paciente';
import { Insignia } from './Insignia';
import { Tarjeta } from './Tarjeta';

interface PropiedadesBloqueAgenda {
  fechaTexto: string;
  tituloDia: string;
  horarios: Agenda[];
  turnos: Turno[];
  rol: RolUsuario;
  alSeleccionarHorario: (agenda: Agenda) => void;
  alEliminarHorario: (agenda: Agenda) => void;
  alCancelarTurno: (turno: Turno) => void;
}

export function BloqueAgenda({
  fechaTexto,
  tituloDia,
  horarios,
  turnos,
  rol,
  alSeleccionarHorario,
  alEliminarHorario,
  alCancelarTurno,
}: PropiedadesBloqueAgenda) {
  const horariosDelDia = horarios.filter((agenda) =>
    agenda.fecha.slice(0, 10) === fechaTexto);
  const turnosDelDia = turnos.filter((turno) =>
    turno.fecha?.slice(0, 10) === fechaTexto
    && turno.estado !== 'CANCELADO');

  return (
    <Tarjeta className="min-h-48 p-4">
      <h2 className="mb-3 text-sm font-semibold capitalize text-verde-profundo">
        {tituloDia}
      </h2>
      <div className="grid gap-2">
        {turnosDelDia.map((turno) => (
          <article
            className="rounded-control border border-primario/20
              bg-primario-suave p-3"
            key={turno.id}
          >
            <div className="flex items-start justify-between gap-2">
              <strong className="text-sm">{turno.hora} · {nombrePaciente(turno)}</strong>
              <Insignia tono="primario">{turno.estado || 'Pendiente'}</Insignia>
            </div>
            <p className="mt-1 text-xs text-texto-suave">
              {turno.motivo || 'Consulta'}
            </p>
            {rol === 'CLIENTE' && (
              <button
                className="mt-2 text-xs text-primario-oscuro"
                type="button"
                onClick={() => alCancelarTurno(turno)}
              >
                Cancelar reserva
              </button>
            )}
          </article>
        ))}
        {horariosDelDia.map((agenda) => (
          <div
            className="rounded-control border border-dashed border-borde
              p-3"
            key={agenda.id}
          >
            <div className="flex items-start justify-between gap-2">
              <strong className="text-sm">
                {agenda.horario} · {agenda.duracionMinutos} min
              </strong>
              <Insignia tono="verde">Disponible</Insignia>
            </div>
            <p className="mt-1 text-xs text-texto-suave">
              {agenda.veterinario
                ? `${agenda.veterinario.nombre} ${agenda.veterinario.apellido}`
                : 'Equipo veterinario'}
            </p>
            {rol === 'CLIENTE'
              ? (
                <button
                  className="mt-2 text-xs font-medium text-primario-oscuro"
                  type="button"
                  onClick={() => alSeleccionarHorario(agenda)}
                >
                  Reservar horario
                </button>
              )
              : (
                <button
                  className="mt-2 text-xs text-error"
                  type="button"
                  onClick={() => alEliminarHorario(agenda)}
                >
                  Eliminar horario
                </button>
              )}
          </div>
        ))}
        {horariosDelDia.length === 0 && turnosDelDia.length === 0 && (
          <p className="py-5 text-center text-xs text-texto-suave">
            Sin citas ni horarios.
          </p>
        )}
      </div>
    </Tarjeta>
  );
}

function nombrePaciente(turno: Turno): string {
  if (typeof turno.mascota === 'string') {
    return turno.mascota;
  }
  if (turno.mascota?.nombre) {
    return turno.mascota.nombre;
  }
  return 'Paciente';
}

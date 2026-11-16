import { useState, type FormEvent } from 'react';
import type { Agenda, DatosPanel } from '../../tipos';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

interface PropiedadesFormularioReserva {
  agenda: Agenda;
  mascotas: DatosPanel['mascotas'];
  alGuardar: () => void;
  alCancelar: () => void;
}

export function FormularioReserva({
  agenda,
  mascotas,
  alGuardar,
  alCancelar,
}: PropiedadesFormularioReserva) {
  const { modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function reservar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);

    try {
      const datos = new FormData(evento.currentTarget);
      const mascotaId = Number(datos.get('mascotaId'));
      const motivo = String(datos.get('motivo') || '').trim();
      await modificar(`/agendas/${agenda.id}/reservar`, 'POST', {
        mascotaId,
        motivo: motivo || undefined,
      });
      alGuardar();
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={reservar}>
      <p className="rounded-control bg-fondo p-3 text-sm text-texto-suave">
        {agenda.fecha.slice(0, 10)} · {agenda.horario} ·
        {' '}{agenda.duracionMinutos} minutos
      </p>
      <label className="grid gap-1 text-sm font-medium">
        Mascota
        <select
          className="min-h-11 rounded-control border border-borde
            bg-superficie px-3 text-texto"
          name="mascotaId"
          required
        >
          <option value="">Elegí una mascota</option>
          {mascotas.map((mascota) => (
            <option key={mascota.id} value={mascota.id}>
              {mascota.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Motivo de la visita
        <EntradaTexto
          name="motivo"
          maxLength={160}
          placeholder="Control, vacuna u otro motivo"
        />
      </label>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Reservando...' : 'Confirmar turno'}
        </Boton>
      </div>
    </form>
  );
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo reservar el horario.';
}

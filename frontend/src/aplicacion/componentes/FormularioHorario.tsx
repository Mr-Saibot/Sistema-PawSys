import { useState, type FormEvent } from 'react';
import type { Persona } from '../../tipos';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

interface PropiedadesFormularioHorario {
  veterinarios: Persona[];
  alGuardar: () => void;
  alCancelar: () => void;
}

export function FormularioHorario({
  veterinarios,
  alGuardar,
  alCancelar,
}: PropiedadesFormularioHorario) {
  const { sesion, modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);

    try {
      const datos = crearHorario(evento.currentTarget, sesion.usuario.rol);
      await modificar('/agendas', 'POST', datos);
      alGuardar();
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={guardar}>
      <label className="grid gap-1 text-sm font-medium">
        Fecha
        <EntradaTexto name="fecha" type="date" required min={fechaHoy()} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Hora de inicio
        <EntradaTexto name="horario" type="time" required />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Duración
        <select
          className="min-h-11 rounded-control border border-borde
            bg-superficie px-3 text-texto"
          name="duracionMinutos"
          defaultValue="30"
        >
          <option value="30">30 minutos</option>
          <option value="60">1 hora</option>
        </select>
      </label>
      {sesion.usuario.rol === 'ADMINISTRADOR' && (
        <label className="grid gap-1 text-sm font-medium">
          Veterinario
          <select
            className="min-h-11 rounded-control border border-borde
              bg-superficie px-3 text-texto"
            name="veterinarioId"
            required
          >
            <option value="">Elegí un veterinario</option>
            {veterinarios.map((veterinario) => (
              <option key={veterinario.id} value={veterinario.id}>
                {veterinario.nombre} {veterinario.apellido}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Publicando...' : 'Publicar horario'}
        </Boton>
      </div>
    </form>
  );
}

function crearHorario(
  formulario: HTMLFormElement,
  rol: string,
): Record<string, number | string> {
  const valores = new FormData(formulario);
  const horario: Record<string, number | string> = {
    fecha: String(valores.get('fecha') || ''),
    horario: String(valores.get('horario') || ''),
    duracionMinutos: Number(valores.get('duracionMinutos') || 30),
  };

  if (rol === 'ADMINISTRADOR') {
    horario.veterinarioId = Number(valores.get('veterinarioId'));
  }
  return horario;
}

function fechaHoy(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo publicar el horario.';
}

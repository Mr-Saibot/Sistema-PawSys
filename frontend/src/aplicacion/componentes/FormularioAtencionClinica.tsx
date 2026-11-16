import { useState, type FormEvent } from 'react';
import type { DatosPanel, HistorialClinico } from '../../tipos';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

type TipoAtencion = 'consulta' | 'vacunacion';

interface PropiedadesFormularioAtencion {
  tipo: TipoAtencion;
  historiales: HistorialClinico[];
  veterinarios: DatosPanel['veterinarios'];
  alGuardar: () => void;
  alCancelar: () => void;
}

export function FormularioAtencionClinica({
  tipo,
  historiales,
  veterinarios,
  alGuardar,
  alCancelar,
}: PropiedadesFormularioAtencion) {
  const { sesion, modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerGuardando(true);
    establecerError('');

    try {
      const datos = crearDatosAtencion(
        new FormData(evento.currentTarget),
        tipo,
        sesion.usuario.rol,
        veterinarios,
        sesion.usuario.id,
      );
      await modificar(
        tipo === 'consulta' ? '/consultas' : '/vacunaciones',
        'POST',
        datos,
      );
      alGuardar();
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={guardar}>
      <label className="grid gap-1 text-sm font-medium">
        Ficha del paciente
        <select
          className={claseCampo}
          name="historialId"
          required
        >
          <option value="">Elegí una mascota</option>
          {historiales.map((historial) => (
            <option key={historial.id} value={historial.id}>
              {nombrePaciente(historial)}
            </option>
          ))}
        </select>
      </label>
      {sesion.usuario.rol === 'ADMINISTRADOR' && (
        <label className="grid gap-1 text-sm font-medium">
          Veterinario responsable
          <select className={claseCampo} name="veterinarioId" required>
            <option value="">Elegí un veterinario</option>
            {veterinarios.map((veterinario) => (
              <option key={veterinario.id} value={veterinario.id}>
                {veterinario.nombre} {veterinario.apellido}
              </option>
            ))}
          </select>
        </label>
      )}
      {tipo === 'consulta'
        ? <CamposConsulta />
        : <CamposVacunacion />}
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar registro'}
        </Boton>
      </div>
    </form>
  );
}

function CamposConsulta() {
  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm font-medium">
        Motivo
        <EntradaTexto name="motivo" required maxLength={200} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Diagnóstico
        <textarea className={`${claseCampo} min-h-20 py-2`}
          name="diagnostico" maxLength={500} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Tratamiento
        <textarea className={`${claseCampo} min-h-20 py-2`}
          name="tratamiento" maxLength={500} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Costo (Gs.)
        <EntradaTexto name="costo" type="number" min="1" step="1" required />
      </label>
    </div>
  );
}

function CamposVacunacion() {
  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm font-medium">
        Vacuna aplicada
        <EntradaTexto name="vacuna" required maxLength={150} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Próxima dosis
        <EntradaTexto name="proximaDosis" type="date" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Costo (Gs.)
        <EntradaTexto name="costo" type="number" min="1" step="1" required />
      </label>
    </div>
  );
}

const claseCampo = `min-h-11 rounded-control border border-borde
  bg-superficie px-3 text-texto outline-none focus:border-primario`;

function crearDatosAtencion(
  valores: FormData,
  tipo: TipoAtencion,
  rol: string,
  veterinarios: DatosPanel['veterinarios'],
  usuarioId: number,
): Record<string, number | string | undefined> {
  const historialId = Number(valores.get('historialId'));
  const veterinario = rol === 'VETERINARIO'
    ? veterinarios.find((persona) => persona.usuarioId === usuarioId)?.id
    : Number(valores.get('veterinarioId'));

  if (!veterinario) {
    throw new Error('No se encontró el perfil del veterinario responsable.');
  }

  const datos: Record<string, number | string | undefined> = {
    historialId,
    veterinarioId: veterinario,
    costo: Number(valores.get('costo')),
  };

  if (tipo === 'consulta') {
    datos.motivo = String(valores.get('motivo') || '').trim();
    datos.diagnostico =
      String(valores.get('diagnostico') || '').trim() || undefined;
    datos.tratamiento =
      String(valores.get('tratamiento') || '').trim() || undefined;
  } else {
    datos.vacuna = String(valores.get('vacuna') || '').trim();
    datos.proximaDosis =
      String(valores.get('proximaDosis') || '') || undefined;
  }

  return datos;
}

function nombrePaciente(historial: HistorialClinico): string {
  return historial.mascota?.nombre || `Mascota #${historial.mascotaId}`;
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo guardar la atención.';
}

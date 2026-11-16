import { useState, type FormEvent } from 'react';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import type { Persona } from '../../tipos';

interface PropiedadesFormularioMascota {
  clientes: Persona[];
  alGuardar: () => void;
  alCancelar: () => void;
}

export function FormularioMascota({
  clientes,
  alGuardar,
  alCancelar,
}: PropiedadesFormularioMascota) {
  const { sesion, modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);

    try {
      const datos = crearDatosMascota(evento.currentTarget, sesion.usuario.rol);
      await modificar('/mascotas', 'POST', datos);
      alGuardar();
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={guardar}>
      {sesion.usuario.rol !== 'CLIENTE' && (
        <label className="grid gap-1 text-sm font-medium">
          Propietario
          <select className={claseCampo} name="clienteId" required>
            <option value="">Elegí un propietario</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="grid gap-1 text-sm font-medium">
        Nombre
        <EntradaTexto name="nombre" required maxLength={80} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Especie
        <select className={claseCampo} name="especie" required>
          <option value="">Elegí una especie</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Raza
        <EntradaTexto name="raza" maxLength={80} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Peso (kg)
          <EntradaTexto name="peso" type="number" min="0" step="0.1" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Fecha de nacimiento
          <EntradaTexto name="fechaNacimiento" type="date" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Observaciones
        <textarea
          className={`${claseCampo} min-h-24 py-2`}
          name="observaciones"
          maxLength={500}
        />
      </label>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <Boton
          variante="secundario"
          type="button"
          onClick={alCancelar}
        >
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar paciente'}
        </Boton>
      </div>
    </form>
  );
}

const claseCampo = `min-h-11 rounded-control border border-borde
  bg-superficie px-3 text-texto outline-none focus:border-primario
  focus:ring-2 focus:ring-primario/15`;

function crearDatosMascota(
  formulario: HTMLFormElement,
  rol: string,
): Record<string, string | number | undefined> {
  const valores = new FormData(formulario);
  const peso = String(valores.get('peso') || '');
  const clienteId = String(valores.get('clienteId') || '');
  const datos: Record<string, string | number | undefined> = {
    nombre: String(valores.get('nombre') || '').trim(),
    especie: String(valores.get('especie') || ''),
    raza: String(valores.get('raza') || '').trim() || undefined,
    peso: peso ? Number(peso) : undefined,
    fechaNacimiento: String(valores.get('fechaNacimiento') || '') || undefined,
    observaciones: String(valores.get('observaciones') || '').trim()
      || undefined,
  };

  if (rol !== 'CLIENTE') {
    datos.clienteId = Number(clienteId);
  }
  return datos;
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo guardar la mascota.';
}

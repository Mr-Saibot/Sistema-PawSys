import { useState, type FormEvent } from 'react';
import type { Administrador, Persona } from '../../tipos';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

type TipoPerfil = 'cliente' | 'veterinario' | 'administrador';

interface PropiedadesFormularioEdicionPerfil {
  tipo: TipoPerfil;
  perfil: Persona | Administrador;
  endpoint: string;
  alGuardar: () => void;
  alCancelar: () => void;
}

interface CampoPerfil {
  nombre: string;
  etiqueta: string;
  requerido: boolean;
}

const camposPorTipo: Record<TipoPerfil, CampoPerfil[]> = {
  cliente: [
    { nombre: 'cedulaIdentidad', etiqueta: 'Cédula', requerido: true },
    { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
    { nombre: 'apellido', etiqueta: 'Apellido', requerido: true },
    { nombre: 'telefono', etiqueta: 'Teléfono', requerido: false },
    { nombre: 'direccion', etiqueta: 'Dirección', requerido: false },
  ],
  veterinario: [
    { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
    { nombre: 'apellido', etiqueta: 'Apellido', requerido: true },
    { nombre: 'especialidad', etiqueta: 'Especialidad', requerido: true },
    { nombre: 'nroMatricula', etiqueta: 'Nro. de matrícula', requerido: true },
    { nombre: 'telefono', etiqueta: 'Teléfono', requerido: false },
    { nombre: 'direccion', etiqueta: 'Dirección', requerido: false },
  ],
  administrador: [
    { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
    { nombre: 'apellido', etiqueta: 'Apellido', requerido: true },
    { nombre: 'telefono', etiqueta: 'Teléfono', requerido: false },
    { nombre: 'direccion', etiqueta: 'Dirección', requerido: false },
  ],
};

export function FormularioEdicionPerfil({
  tipo,
  perfil,
  endpoint,
  alGuardar,
  alCancelar,
}: PropiedadesFormularioEdicionPerfil) {
  const { modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);

    try {
      await modificar(endpoint, 'PATCH', crearCambios(
        new FormData(evento.currentTarget),
        camposPorTipo[tipo],
      ));
      alGuardar();
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerGuardando(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={guardar}>
      {camposPorTipo[tipo].map((campo) => (
        <label className="grid gap-1 text-sm font-medium" key={campo.nombre}>
          {campo.etiqueta}
          <EntradaTexto
            name={campo.nombre}
            defaultValue={obtenerValor(perfil, campo.nombre)}
            required={campo.requerido}
          />
        </label>
      ))}
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Boton>
      </div>
    </form>
  );
}

function obtenerValor(perfil: Persona | Administrador, nombre: string): string {
  if (nombre === 'nombre') {
    return perfil.nombre;
  }
  if (nombre === 'apellido') {
    return perfil.apellido;
  }
  if (nombre === 'correo') {
    return perfil.correo;
  }
  if (nombre === 'telefono') {
    return perfil.telefono || '';
  }
  if (nombre === 'direccion') {
    return perfil.direccion || '';
  }
  if (nombre === 'cedulaIdentidad' && 'cedulaIdentidad' in perfil) {
    return perfil.cedulaIdentidad || '';
  }
  if (nombre === 'especialidad' && 'especialidad' in perfil) {
    return perfil.especialidad || '';
  }
  if (nombre === 'nroMatricula' && 'nroMatricula' in perfil) {
    return perfil.nroMatricula || '';
  }
  return '';
}

function crearCambios(
  valores: FormData,
  campos: CampoPerfil[],
): Record<string, string | null> {
  return campos.reduce<Record<string, string | null>>((cambios, campo) => {
    const valor = String(valores.get(campo.nombre) || '').trim();
    cambios[campo.nombre] = valor || (campo.requerido ? '' : null);
    return cambios;
  }, {});
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudieron guardar los cambios.';
}

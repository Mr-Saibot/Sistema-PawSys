import { useState, type FormEvent } from 'react';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

interface PropiedadesFormularioEquipo {
  alGuardar: () => void;
  alCancelar: () => void;
}

export function FormularioEquipo({
  alGuardar,
  alCancelar,
}: PropiedadesFormularioEquipo) {
  const { modificar } = usePanelClinica();
  const [rol, establecerRol] = useState('VETERINARIO');
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);
    const valores = new FormData(evento.currentTarget);

    try {
      await modificar('/auth/usuarios', 'POST', crearDatosEquipo(valores, rol));
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
        Tipo de cuenta
        <select
          className={claseCampo}
          value={rol}
          onChange={(evento) => establecerRol(evento.target.value)}
        >
          <option value="VETERINARIO">Veterinario</option>
          <option value="ADMINISTRADOR">Administrador</option>
        </select>
      </label>
      <CampoEquipo nombre="nombre" etiqueta="Nombre" />
      <CampoEquipo nombre="apellido" etiqueta="Apellido" />
      <CampoEquipo nombre="correo" etiqueta="Correo" tipo="email" />
      <CampoEquipo
        nombre="password"
        etiqueta="Contraseña temporal"
        tipo="password"
      />
      {rol === 'VETERINARIO' && (
        <>
          <CampoEquipo nombre="especialidad" etiqueta="Especialidad" />
          <CampoEquipo nombre="nroMatricula" etiqueta="Matrícula" />
        </>
      )}
      <CampoEquipo nombre="telefono" etiqueta="Teléfono" requerido={false} />
      <CampoEquipo nombre="direccion" etiqueta="Dirección" requerido={false} />
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Creando...' : 'Crear cuenta'}
        </Boton>
      </div>
    </form>
  );
}

function CampoEquipo({
  nombre,
  etiqueta,
  tipo = 'text',
  requerido = true,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {etiqueta}
      <EntradaTexto
        name={nombre}
        type={tipo}
        required={requerido}
        minLength={nombre === 'password' ? 8 : undefined}
      />
    </label>
  );
}

const claseCampo = `min-h-11 rounded-control border border-borde
  bg-superficie px-3 text-texto`;

function crearDatosEquipo(
  valores: FormData,
  rol: string,
): Record<string, string> {
  const datos: Record<string, string> = {
    rol,
    nombre: texto(valores, 'nombre'),
    apellido: texto(valores, 'apellido'),
    correo: texto(valores, 'correo'),
    password: String(valores.get('password') || ''),
    telefono: texto(valores, 'telefono'),
    direccion: texto(valores, 'direccion'),
  };

  if (rol === 'VETERINARIO') {
    datos.especialidad = texto(valores, 'especialidad');
    datos.nroMatricula = texto(valores, 'nroMatricula');
  }
  return datos;
}

function texto(valores: FormData, campo: string): string {
  return String(valores.get(campo) || '').trim();
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo crear la cuenta del equipo.';
}

import { useState, type FormEvent } from 'react';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Boton } from './Boton';
import { EntradaTexto } from './EntradaTexto';

interface PropiedadesFormularioPropietario {
  alGuardar: () => void;
  alCancelar: () => void;
}

export function FormularioPropietario({
  alGuardar,
  alCancelar,
}: PropiedadesFormularioPropietario) {
  const { modificar } = usePanelClinica();
  const [error, establecerError] = useState('');
  const [guardando, establecerGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError('');
    establecerGuardando(true);
    const valores = new FormData(evento.currentTarget);

    try {
      await modificar('/auth/admin/clientes', 'POST', {
        nombre: texto(valores, 'nombre'),
        apellido: texto(valores, 'apellido'),
        correo: texto(valores, 'correo'),
        password: String(valores.get('password') || ''),
        cedulaIdentidad: texto(valores, 'cedulaIdentidad'),
        telefono: texto(valores, 'telefono') || undefined,
        direccion: texto(valores, 'direccion') || undefined,
      });
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
        Nombre
        <EntradaTexto name="nombre" required minLength={2} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Apellido
        <EntradaTexto name="apellido" required minLength={2} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Cédula
        <EntradaTexto name="cedulaIdentidad" required />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Correo electrónico
        <EntradaTexto name="correo" type="email" required />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Contraseña temporal
        <EntradaTexto name="password" type="password" required minLength={6} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Teléfono
        <EntradaTexto name="telefono" type="tel" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Dirección
        <EntradaTexto name="direccion" />
      </label>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Creando...' : 'Crear propietario'}
        </Boton>
      </div>
    </form>
  );
}

function texto(valores: FormData, campo: string): string {
  return String(valores.get(campo) || '').trim();
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo crear el propietario.';
}

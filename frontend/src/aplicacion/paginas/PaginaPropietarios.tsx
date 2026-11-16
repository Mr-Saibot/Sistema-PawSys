import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Persona } from '../../tipos';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { FormularioEdicionPerfil } from '../componentes/FormularioEdicionPerfil';
import { FormularioPropietario } from '../componentes/FormularioPropietario';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { TarjetaPropietario } from '../componentes/TarjetaPropietario';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';

export function PaginaPropietarios() {
  const { datos, sesion, modificar } = usePanelClinica();
  const [busqueda, establecerBusqueda] = useState('');
  const [crearAbierto, establecerCrearAbierto] = useState(false);
  const [propietarioEditando, establecerPropietarioEditando] =
    useState<Persona | null>(null);
  const [error, establecerError] = useState('');
  const propietarios = useMemo(
    () => datos.clientes.filter((cliente) =>
      `${cliente.nombre} ${cliente.apellido} ${cliente.correo}`
        .toLocaleLowerCase('es')
        .includes(busqueda.trim().toLocaleLowerCase('es'))),
    [datos.clientes, busqueda],
  );
  const puedeEditar = sesion.usuario.rol === 'ADMINISTRADOR';

  async function desactivar(propietario: Persona) {
    if (!propietario.id) {
      return;
    }
    const confirmado = window.confirm(
      `¿Desactivar la cuenta de ${propietario.nombre} ${propietario.apellido}?`,
    );
    if (!confirmado) {
      return;
    }
    try {
      await modificar(`/clientes/${propietario.id}`, 'DELETE');
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  return (
    <div>
      <EncabezadoModulo
        titulo="Propietarios"
        descripcion="Datos de contacto, mascotas y cobros pendientes."
        accion={puedeEditar && (
          <Boton
            icono={<Plus size={17} />}
            onClick={() => establecerCrearAbierto(true)}
          >
            Nuevo propietario
          </Boton>
        )}
      />
      {error && <p className="mb-4 text-sm text-error" role="alert">{error}</p>}
      <label className="relative mb-5 block max-w-xl">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2
            text-texto-suave"
          size={17}
        />
        <input
          className="h-11 w-full rounded-control border border-borde
            bg-superficie pl-10 pr-3 text-sm"
          onChange={(evento) => establecerBusqueda(evento.target.value)}
          placeholder="Buscar por nombre o correo"
          value={busqueda}
        />
      </label>
      {propietarios.length
        ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {propietarios.map((propietario) => (
              <TarjetaPropietario
                key={propietario.id}
                propietario={propietario}
                puedeEditar={puedeEditar}
                alEditar={establecerPropietarioEditando}
                alDesactivar={(seleccionado) =>
                  void desactivar(seleccionado)}
              />
            ))}
          </div>
        )
        : <EstadoVacio
          titulo={busqueda ? 'No encontramos propietarios' : 'Aún no hay propietarios'}
          descripcion={busqueda
            ? 'Probá con otro nombre o correo.'
            : 'Los propietarios registrados aparecerán en este directorio.'}
        />}
      {crearAbierto && (
        <PanelLateralFormulario
          titulo="Nuevo propietario"
          descripcion="Se crea su cuenta de acceso junto con el perfil."
          alCerrar={() => establecerCrearAbierto(false)}
        >
          <FormularioPropietario
            alCancelar={() => establecerCrearAbierto(false)}
            alGuardar={() => establecerCrearAbierto(false)}
          />
        </PanelLateralFormulario>
      )}
      {propietarioEditando && propietarioEditando.id && (
        <PanelLateralFormulario
          titulo="Editar propietario"
          alCerrar={() => establecerPropietarioEditando(null)}
        >
          <FormularioEdicionPerfil
            tipo="cliente"
            perfil={propietarioEditando}
            endpoint={`/clientes/${propietarioEditando.id}`}
            alCancelar={() => establecerPropietarioEditando(null)}
            alGuardar={() => establecerPropietarioEditando(null)}
          />
        </PanelLateralFormulario>
      )}
    </div>
  );
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo desactivar el propietario.';
}

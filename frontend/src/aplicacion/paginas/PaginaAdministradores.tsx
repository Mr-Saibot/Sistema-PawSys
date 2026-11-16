import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Administrador } from '../../tipos';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { FormularioEdicionPerfil } from '../componentes/FormularioEdicionPerfil';
import { FormularioEquipo } from '../componentes/FormularioEquipo';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { TarjetaProfesional } from '../componentes/TarjetaProfesional';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';

export function PaginaAdministradores() {
  const { datos, modificar } = usePanelClinica();
  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const [administradorEditando, establecerAdministradorEditando] =
    useState<Administrador | null>(null);
  const [error, establecerError] = useState('');

  async function desactivar(administrador: Administrador) {
    if (!administrador.id) {
      return;
    }
    const confirmado = window.confirm(
      `¿Desactivar la cuenta de ${administrador.nombre} ${administrador.apellido}?`,
    );
    if (!confirmado) {
      return;
    }
    try {
      await modificar(`/administradores/${administrador.id}`, 'DELETE');
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  return (
    <div>
      <EncabezadoModulo
        titulo="Administradores"
        descripcion="Personas con permisos para gestionar la clínica."
        accion={<Boton
          icono={<Plus size={17} />}
          onClick={() => establecerFormularioAbierto(true)}
        >
          Nueva cuenta
        </Boton>}
      />
      {error && <p className="mb-4 text-sm text-error" role="alert">{error}</p>}
      {datos.administradores.length
        ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {datos.administradores.map((administrador) => (
              <TarjetaProfesional
                key={administrador.id}
                perfil={administrador}
                puedeEditar
                alEditar={() => establecerAdministradorEditando(administrador)}
                alDesactivar={() => void desactivar(administrador)}
              />
            ))}
          </div>
        )
        : <EstadoVacio
          titulo="No hay administradores para mostrar"
          descripcion="Podés crear una cuenta administrativa para la clínica."
          accion={<Boton onClick={() => establecerFormularioAbierto(true)}>
            Crear administrador
          </Boton>}
        />}
      {formularioAbierto && (
        <PanelLateralFormulario
          titulo="Nueva cuenta administrativa"
          descripcion="Se solicitará el PIN antes de confirmar la creación."
          alCerrar={() => establecerFormularioAbierto(false)}
        >
          <FormularioEquipo
            alCancelar={() => establecerFormularioAbierto(false)}
            alGuardar={() => establecerFormularioAbierto(false)}
          />
        </PanelLateralFormulario>
      )}
      {administradorEditando?.id && (
        <PanelLateralFormulario
          titulo="Editar administrador"
          alCerrar={() => establecerAdministradorEditando(null)}
        >
          <FormularioEdicionPerfil
            tipo="administrador"
            perfil={administradorEditando}
            endpoint={`/administradores/${administradorEditando.id}`}
            alCancelar={() => establecerAdministradorEditando(null)}
            alGuardar={() => establecerAdministradorEditando(null)}
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
  return 'No se pudo desactivar el administrador.';
}

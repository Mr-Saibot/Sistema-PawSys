import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Persona } from '../../tipos';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { FormularioEdicionPerfil } from '../componentes/FormularioEdicionPerfil';
import { FormularioEquipo } from '../componentes/FormularioEquipo';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { TarjetaProfesional } from '../componentes/TarjetaProfesional';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';

export function PaginaEquipo() {
  const { datos, modificar } = usePanelClinica();
  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const [veterinarioEditando, establecerVeterinarioEditando] =
    useState<Persona | null>(null);
  const [error, establecerError] = useState('');

  async function desactivar(veterinario: Persona) {
    if (!veterinario.id) {
      return;
    }
    const confirmado = window.confirm(
      `¿Desactivar la cuenta de ${veterinario.nombre} ${veterinario.apellido}?`,
    );
    if (!confirmado) {
      return;
    }
    try {
      await modificar(`/veterinarios/${veterinario.id}`, 'DELETE');
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  return (
    <div>
      <EncabezadoModulo
        titulo="Equipo veterinario"
        descripcion="Profesionales habilitados para atender a los pacientes."
        accion={<Boton
          icono={<Plus size={17} />}
          onClick={() => establecerFormularioAbierto(true)}
        >
          Nueva cuenta
        </Boton>}
      />
      {error && <p className="mb-4 text-sm text-error" role="alert">{error}</p>}
      {datos.veterinarios.length
        ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {datos.veterinarios.map((veterinario) => (
              <TarjetaProfesional
                key={veterinario.id}
                perfil={veterinario}
                especialidad={veterinario.especialidad || 'Sin especialidad'}
                matricula={veterinario.nroMatricula || 'Sin registrar'}
                puedeEditar
                alEditar={() => establecerVeterinarioEditando(veterinario)}
                alDesactivar={() => void desactivar(veterinario)}
              />
            ))}
          </div>
        )
        : <EstadoVacio
          titulo="Aún no hay veterinarios"
          descripcion="Agregá una cuenta para que el equipo pueda atender."
          accion={<Boton onClick={() => establecerFormularioAbierto(true)}>
            Crear cuenta veterinaria
          </Boton>}
        />}
      {formularioAbierto && (
        <PanelLateralFormulario
          titulo="Crear cuenta del equipo"
          descripcion="La cuenta tendrá acceso según el rol seleccionado."
          alCerrar={() => establecerFormularioAbierto(false)}
        >
          <FormularioEquipo
            alCancelar={() => establecerFormularioAbierto(false)}
            alGuardar={() => establecerFormularioAbierto(false)}
          />
        </PanelLateralFormulario>
      )}
      {veterinarioEditando?.id && (
        <PanelLateralFormulario
          titulo="Editar veterinario"
          alCerrar={() => establecerVeterinarioEditando(null)}
        >
          <FormularioEdicionPerfil
            tipo="veterinario"
            perfil={veterinarioEditando}
            endpoint={`/veterinarios/${veterinarioEditando.id}`}
            alCancelar={() => establecerVeterinarioEditando(null)}
            alGuardar={() => establecerVeterinarioEditando(null)}
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
  return 'No se pudo desactivar el veterinario.';
}

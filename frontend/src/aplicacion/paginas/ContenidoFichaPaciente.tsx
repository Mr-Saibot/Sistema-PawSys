import { useState } from 'react';
import { AccionNuevaConsulta } from '../componentes/AccionNuevaConsulta';
import { CabeceraPaciente } from '../componentes/CabeceraPaciente';
import { ContenidoSeccionesFicha } from '../componentes/ContenidoSeccionesFicha';
import { EncabezadoPaginaFicha } from '../componentes/EncabezadoPaginaFicha';
import { FormularioMascota } from '../componentes/FormularioMascota';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import type { PestanaFicha } from '../tipos/evento-clinico';
import type { MascotaPaciente, SesionUsuario } from '../tipos/paciente';

interface PropiedadesContenidoFicha {
  paciente: MascotaPaciente;
  sesion: SesionUsuario;
  alRecargar: () => void;
}

export function ContenidoFichaPaciente({
  paciente,
  sesion,
  alRecargar,
}: PropiedadesContenidoFicha) {
  const [pestana, establecerPestana] = useState<PestanaFicha>('historial');
  const [editando, establecerEditando] = useState(false);
  const { datos } = usePanelClinica();

  return (
    <>
      <article className="space-y-6 pb-24">
        <EncabezadoPaginaFicha />
        <CabeceraPaciente
          paciente={paciente}
          alEditar={() => establecerEditando(true)}
        />
        <ContenidoSeccionesFicha
          paciente={paciente}
          pestana={pestana}
          alSeleccionarPestana={establecerPestana}
        />
      </article>
      {sesion.usuario.rol !== 'CLIENTE' && <AccionNuevaConsulta />}
      {editando && (
        <PanelLateralFormulario
          titulo="Editar mascota"
          descripcion="Actualizá los datos básicos de la ficha."
          alCerrar={() => establecerEditando(false)}
        >
          <FormularioMascota
            clientes={datos.clientes}
            mascota={paciente}
            alCancelar={() => establecerEditando(false)}
            alGuardar={() => {
              establecerEditando(false);
              alRecargar();
            }}
          />
        </PanelLateralFormulario>
      )}
    </>
  );
}

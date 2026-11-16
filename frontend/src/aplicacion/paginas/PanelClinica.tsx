import type { ReactNode } from 'react';
import { ProveedorPanelClinica } from '../contextos/ContextoPanelClinica';
import { useDatosClinica } from '../hooks/useDatosClinica';
import { useCerrarSesion } from '../hooks/useCerrarSesion';
import { PantallaCarga } from '../componentes/PantallaCarga';
import { MarcoAplicacion } from '../componentes/MarcoAplicacion';
import type { SesionUsuario } from '../tipos/paciente';

interface PropiedadesPanelClinica {
  sesion: SesionUsuario;
  children: ReactNode;
}

export function PanelClinica({
  sesion,
  children,
}: PropiedadesPanelClinica) {
  const estado = useDatosClinica(sesion);
  const cerrarSesion = useCerrarSesion();
  const nombreUsuario = sesion.usuario.correo.split('@')[0];

  if (estado.cargando) {
    return <PantallaCarga />;
  }

  return (
    <ProveedorPanelClinica estado={estado}>
      <MarcoAplicacion
        rol={sesion.usuario.rol}
        nombreUsuario={nombreUsuario}
        alCerrarSesion={cerrarSesion}
        datos={estado.datos}
      >
        {estado.error && <AvisoError mensaje={estado.error} />}
        {estado.datos.errorConexion && (
          <AvisoError
            mensaje="Algunos datos no están disponibles. Podés actualizar la vista."
          />
        )}
        {children}
      </MarcoAplicacion>
    </ProveedorPanelClinica>
  );
}

interface PropiedadesAvisoError {
  mensaje: string;
}

function AvisoError({ mensaje }: PropiedadesAvisoError) {
  return (
    <div
      className="mb-5 rounded-control border border-error/20 bg-error/5
        px-4 py-3 text-sm text-error"
      role="alert"
    >
      {mensaje}
    </div>
  );
}

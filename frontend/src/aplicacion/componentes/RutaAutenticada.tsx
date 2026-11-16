import { Navigate, Outlet } from 'react-router-dom';
import { PanelClinica } from '../paginas/PanelClinica';
import type { SesionUsuario } from '../tipos/paciente';

interface PropiedadesRutaAutenticada {
  sesion: SesionUsuario | null;
}

export function RutaAutenticada({ sesion }: PropiedadesRutaAutenticada) {
  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PanelClinica sesion={sesion}>
      <Outlet />
    </PanelClinica>
  );
}

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { RolUsuario } from '../tipos/paciente';

interface PropiedadesRutaPorRol {
  rolActual: RolUsuario;
  rolesPermitidos: RolUsuario[];
  children: ReactNode;
}

export function RutaPorRol({
  rolActual,
  rolesPermitidos,
  children,
}: PropiedadesRutaPorRol) {
  if (!rolesPermitidos.includes(rolActual)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

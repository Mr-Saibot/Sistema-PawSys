import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AgendaClinica } from './paginas/AgendaClinica';
import { ConfirmarTurno } from './paginas/ConfirmarTurno';
import { FichaPaciente } from './paginas/FichaPaciente';
import { InicioClinica } from './paginas/InicioClinica';
import { PaginaAcceso } from './paginas/PaginaAcceso';
import { PaginaCaja } from './paginas/PaginaCaja';
import { PaginaAdministradores } from './paginas/PaginaAdministradores';
import { PaginaEquipo } from './paginas/PaginaEquipo';
import { PaginaHistoriasClinicas } from './paginas/PaginaHistoriasClinicas';
import { PaginaPacientes } from './paginas/PaginaPacientes';
import { PaginaPagos } from './paginas/PaginaPagos';
import { PaginaPropietarios } from './paginas/PaginaPropietarios';
import { RutaAutenticada } from './componentes/RutaAutenticada';
import { RutaPorRol } from './componentes/RutaPorRol';
import {
  EVENTO_CAMBIO_SESION,
  leerSesion,
} from './servicios/api';
import type { RolUsuario, SesionUsuario } from './tipos/paciente';

const ROLES_CLINICOS: RolUsuario[] = ['VETERINARIO', 'ADMINISTRADOR'];

export function App() {
  const [sesion, establecerSesion] = useState<SesionUsuario | null>(
    () => leerSesion(),
  );

  useEffect(() => {
    const actualizarSesion = () => establecerSesion(leerSesion());
    window.addEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);

    return () => {
      window.removeEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
    };
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/confirmar-turno"
          element={<ConfirmarTurno />}
        />
        <Route
          path="/login"
          element={sesion
            ? <Navigate to="/" replace />
            : <PaginaAcceso />}
        />
        <Route
          element={<RutaAutenticada sesion={sesion} />}
        >
          <Route index element={<InicioClinica />} />
          <Route path="agenda" element={<AgendaClinica />} />
          <Route path="mascotas" element={<PaginaPacientes />} />
          <Route
            path="pacientes"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={ROLES_CLINICOS}
              >
                <PaginaPacientes />
              </RutaPorRol>
            }
          />
          <Route
            path="pacientes/:id"
            element={
              sesion
                ? <FichaPaciente sesion={sesion} />
                : <Navigate to="/login" replace />
            }
          />
          <Route path="pagos" element={<PaginaPagos />} />
          <Route
            path="historias"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={ROLES_CLINICOS}
              >
                <PaginaHistoriasClinicas />
              </RutaPorRol>
            }
          />
          <Route
            path="propietarios"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={['ADMINISTRADOR']}
              >
                <PaginaPropietarios />
              </RutaPorRol>
            }
          />
          <Route
            path="equipo"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={['ADMINISTRADOR']}
              >
                <PaginaEquipo />
              </RutaPorRol>
            }
          />
          <Route
            path="administradores"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={['ADMINISTRADOR']}
              >
                <PaginaAdministradores />
              </RutaPorRol>
            }
          />
          <Route
            path="caja"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={['ADMINISTRADOR']}
              >
                <PaginaCaja />
              </RutaPorRol>
            }
          />
          <Route
            path="cobros"
            element={
              <RutaPorRol
                rolActual={sesion?.usuario.rol || 'CLIENTE'}
                rolesPermitidos={['VETERINARIO']}
              >
                <PaginaCaja />
              </RutaPorRol>
            }
          />
          <Route path="turnos" element={<Navigate to="/agenda" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

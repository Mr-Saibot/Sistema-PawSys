import { useNavigate } from 'react-router-dom';
import { cerrarSesion as limpiarSesion } from '../servicios/api';

export function useCerrarSesion(): () => void {
  const navegar = useNavigate();

  function cerrar(): void {
    limpiarSesion();
    navegar('/login', { replace: true });
  }

  return cerrar;
}

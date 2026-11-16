import { useEffect } from 'react';

export function useCerrarConEscape(
  abierto: boolean,
  alCerrar: () => void,
): void {
  useEffect(() => {
    if (!abierto) {
      return;
    }

    function cerrarConEscape(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        alCerrar();
      }
    }

    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [abierto, alCerrar]);
}

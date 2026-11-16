import { createContext, useContext, type ReactNode } from 'react';
import type { EstadoDatosClinica } from '../hooks/useDatosClinica';

const ContextoPanelClinica = createContext<EstadoDatosClinica | null>(null);

interface PropiedadesProveedorPanel {
  estado: EstadoDatosClinica;
  children: ReactNode;
}

export function ProveedorPanelClinica({
  estado,
  children,
}: PropiedadesProveedorPanel) {
  return (
    <ContextoPanelClinica.Provider value={estado}>
      {children}
    </ContextoPanelClinica.Provider>
  );
}

export function usePanelClinica(): EstadoDatosClinica {
  const contexto = useContext(ContextoPanelClinica);

  if (!contexto) {
    throw new Error('El panel clínico debe usarse dentro de su proveedor.');
  }

  return contexto;
}

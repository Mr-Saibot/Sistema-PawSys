import type { ReactNode } from 'react';

export interface ColumnaTabla<Registro> {
  clave: keyof Registro;
  titulo: string;
  mostrar?: (registro: Registro) => ReactNode;
}

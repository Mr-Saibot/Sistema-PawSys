import { useCallback, useEffect, useState } from 'react';
import {
  cargarDatosPanel,
  enviarApi,
  subirFotoMascota,
} from '../../servicios/api.js';
import { crearDatosVacios } from '../../datos/datos-iniciales.js';
import type { DatosPanel } from '../../tipos';
import type { SesionUsuario } from '../tipos/paciente';

export interface EstadoDatosClinica {
  sesion: SesionUsuario;
  datos: DatosPanel;
  cargando: boolean;
  error: string;
  recargar: () => Promise<void>;
  modificar: (
    ruta: string,
    metodo: string,
    datos?: unknown,
  ) => Promise<void>;
  cargarFoto: (mascotaId: number, archivo: File) => Promise<void>;
}

export function useDatosClinica(
  sesion: SesionUsuario,
): EstadoDatosClinica {
  const [datos, establecerDatos] = useState<DatosPanel>(crearDatosVacios());
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState('');

  const recargar = useCallback(async () => {
    establecerCargando(true);
    establecerError('');

    try {
      const resultado = await cargarDatosPanel(sesion);
      establecerDatos(resultado);
    } catch (causa) {
      establecerError(mensajeError(causa));
    } finally {
      establecerCargando(false);
    }
  }, [sesion]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const modificar = useCallback(
    async (ruta: string, metodo: string, contenido?: unknown) => {
      await enviarApi(ruta, sesion.token, metodo, contenido);
      await recargar();
    },
    [recargar, sesion.token],
  );

  const cargarFoto = useCallback(
    async (mascotaId: number, archivo: File) => {
      await subirFotoMascota(mascotaId, archivo, sesion.token);
      await recargar();
    },
    [recargar, sesion.token],
  );

  return {
    sesion,
    datos,
    cargando,
    error,
    recargar,
    modificar,
    cargarFoto,
  };
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }

  return 'No se pudieron cargar los datos de la clínica.';
}

import { useState } from 'react';
import { AccionNuevaConsulta } from '../componentes/AccionNuevaConsulta';
import { CabeceraPaciente } from '../componentes/CabeceraPaciente';
import { ContenidoSeccionesFicha } from '../componentes/ContenidoSeccionesFicha';
import { EncabezadoPaginaFicha } from '../componentes/EncabezadoPaginaFicha';
import type { PestanaFicha } from '../tipos/evento-clinico';
import type { MascotaPaciente, SesionUsuario } from '../tipos/paciente';

interface PropiedadesContenidoFicha {
  paciente: MascotaPaciente;
  sesion: SesionUsuario;
}

export function ContenidoFichaPaciente({
  paciente,
  sesion,
}: PropiedadesContenidoFicha) {
  const [pestana, establecerPestana] = useState<PestanaFicha>('historial');

  return (
    <>
      <article className="space-y-6 pb-24">
        <EncabezadoPaginaFicha />
        <CabeceraPaciente paciente={paciente} />
        <ContenidoSeccionesFicha
          paciente={paciente}
          pestana={pestana}
          alSeleccionarPestana={establecerPestana}
        />
      </article>
      {sesion.usuario.rol !== 'CLIENTE' && <AccionNuevaConsulta />}
    </>
  );
}

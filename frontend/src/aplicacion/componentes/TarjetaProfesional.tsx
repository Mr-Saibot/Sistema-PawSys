import { Mail, Phone, Stethoscope } from 'lucide-react';
import type { Administrador, Persona } from '../../tipos';
import { Avatar } from './Avatar';
import { Boton } from './Boton';
import { Tarjeta } from './Tarjeta';

type PerfilProfesional = Persona | Administrador;

interface PropiedadesTarjetaProfesional {
  perfil: PerfilProfesional;
  especialidad?: string;
  matricula?: string;
  puedeEditar: boolean;
  alEditar: () => void;
  alDesactivar: () => void;
}

export function TarjetaProfesional({
  perfil,
  especialidad,
  matricula,
  puedeEditar,
  alEditar,
  alDesactivar,
}: PropiedadesTarjetaProfesional) {
  const nombre = `${perfil.nombre} ${perfil.apellido}`;

  return (
    <Tarjeta className="p-5">
      <div className="flex items-start gap-3">
        <Avatar nombre={nombre} tamano="pequeno" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold">{nombre}</h2>
          {especialidad && (
            <p className="mt-1 flex items-center gap-1 text-sm
              text-verde-profundo">
              <Stethoscope size={14} />
              {especialidad}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 grid gap-2 border-t border-borde pt-3
        text-sm text-texto-suave">
        <p className="flex items-center gap-2 truncate">
          <Mail size={14} />
          {perfil.correo}
        </p>
        {perfil.telefono && (
          <p className="flex items-center gap-2">
            <Phone size={14} />
            {perfil.telefono}
          </p>
        )}
        {matricula && <p>Matrícula: {matricula}</p>}
      </div>
      {puedeEditar && (
        <div className="mt-3 flex gap-2 border-t border-borde pt-3">
          <Boton
            className="min-h-9 px-3 text-xs"
            variante="secundario"
            onClick={alEditar}
          >
            Editar
          </Boton>
          <Boton
            className="min-h-9 px-3 text-xs"
            variante="sutil"
            onClick={alDesactivar}
          >
            Desactivar cuenta
          </Boton>
        </div>
      )}
    </Tarjeta>
  );
}

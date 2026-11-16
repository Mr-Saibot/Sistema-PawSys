import { Camera, CalendarDays, Weight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerUrlApiGuardada } from '../../servicios/api.js';
import type { Mascota } from '../../tipos';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { Avatar } from './Avatar';
import { Insignia } from './Insignia';

interface PropiedadesTarjetaMascota {
  mascota: Mascota;
  permitirFoto: boolean;
}

export function TarjetaMascota({
  mascota,
  permitirFoto,
}: PropiedadesTarjetaMascota) {
  const [error, establecerError] = useState('');
  const { cargarFoto } = usePanelClinica();
  const foto = construirUrlFoto(mascota.fotoUrl || mascota.foto);

  async function actualizarFoto(archivo?: File) {
    if (!archivo) {
      return;
    }

    establecerError('');
    try {
      await cargarFoto(mascota.id, archivo);
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  return (
    <article className="overflow-hidden rounded-tarjeta border border-borde
      bg-superficie shadow-sutil">
      <Link to={`/pacientes/${mascota.id}`} className="block">
        <div className="relative flex h-48 items-center justify-center
          bg-primario-suave">
          <Avatar nombre={mascota.nombre} foto={foto} tamano="grande" />
          <Insignia className="absolute right-3 top-3">
            {mascota.estado === false ? 'Inactiva' : 'Activa'}
          </Insignia>
        </div>
      </Link>
      <div className="grid gap-3 p-4">
        <div>
          <h2 className="text-lg font-semibold">{mascota.nombre}</h2>
          <p className="text-sm text-texto-suave">
            {mascota.especie} · {mascota.raza || 'Raza no indicada'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-texto-suave">
          <span className="inline-flex items-center gap-1">
            <Weight size={14} />
            {mascota.peso ? `${mascota.peso} kg` : 'Sin peso'}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            {calcularEdad(mascota.fechaNacimiento)}
          </span>
        </div>
        <p className="text-sm text-texto-suave">
          Responsable: {nombreResponsable(mascota)}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Link
            className="text-sm font-medium text-primario-oscuro"
            to={`/pacientes/${mascota.id}`}
          >
            Abrir ficha
          </Link>
          {permitirFoto && (
            <label className="inline-flex cursor-pointer items-center gap-1
              rounded-control px-2 py-1 text-sm text-texto-suave
              hover:bg-primario-suave">
              <Camera size={15} />
              Foto
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(evento) =>
                  void actualizarFoto(evento.currentTarget.files?.[0])}
              />
            </label>
          )}
        </div>
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
      </div>
    </article>
  );
}

function construirUrlFoto(foto?: string | null): string | undefined {
  if (!foto) {
    return undefined;
  }
  if (/^https?:\/\//i.test(foto)) {
    return foto;
  }
  const api = obtenerUrlApiGuardada().replace(/\/$/, '');
  return `${api}${foto.startsWith('/') ? foto : `/${foto}`}`;
}

function nombreResponsable(mascota: Mascota): string {
  if (typeof mascota.cliente === 'string') {
    return mascota.cliente;
  }
  if (mascota.cliente) {
    return `${mascota.cliente.nombre} ${mascota.cliente.apellido}`;
  }
  return mascota.clienteNombre || 'No asignado';
}

function calcularEdad(fechaNacimiento?: string | null): string {
  if (!fechaNacimiento) {
    return 'Edad no registrada';
  }

  const anios = new Date().getFullYear()
    - new Date(fechaNacimiento).getFullYear();
  return anios === 1 ? '1 año' : `${anios} años`;
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo actualizar la foto.';
}

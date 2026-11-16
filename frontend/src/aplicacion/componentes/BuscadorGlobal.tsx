import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DatosPanel } from '../../tipos';

interface PropiedadesBuscadorGlobal {
  datos?: DatosPanel;
}

interface ResultadoBusqueda {
  titulo: string;
  detalle: string;
  ruta: string;
}

export function BuscadorGlobal({ datos }: PropiedadesBuscadorGlobal) {
  const [abierto, establecerAbierto] = useState(false);
  const [consulta, establecerConsulta] = useState('');
  const entrada = useRef<HTMLInputElement>(null);
  const navegar = useNavigate();
  const resultados = useMemo(
    () => buscarRegistros(datos, consulta),
    [datos, consulta],
  );

  useEffect(() => {
    const manejarAtajo = (evento: KeyboardEvent) => {
      if ((evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === 'k') {
        evento.preventDefault();
        establecerAbierto(true);
      }
      if (evento.key === 'Escape') {
        establecerAbierto(false);
      }
    };

    window.addEventListener('keydown', manejarAtajo);
    return () => window.removeEventListener('keydown', manejarAtajo);
  }, []);

  useEffect(() => {
    if (abierto) {
      entrada.current?.focus();
    }
  }, [abierto]);

  function abrirResultado(ruta: string) {
    navegar(ruta);
    establecerAbierto(false);
    establecerConsulta('');
  }

  return (
    <>
      <label className="relative hidden w-full max-w-xl sm:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-suave"
          size={17}
        />
        <input
          className="h-10 w-full rounded-control border border-borde
            bg-superficie pl-10 pr-20 text-sm placeholder:text-texto-suave"
          onFocus={() => establecerAbierto(true)}
          onChange={(evento) => establecerConsulta(evento.target.value)}
          placeholder="Buscar mascota, dueño o cita"
          value={consulta}
          aria-label="Buscar mascota, dueño o cita"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2
          text-xs text-texto-suave">
          Ctrl K
        </span>
      </label>
      <button
        className="rounded-control p-2 text-texto-suave hover:bg-primario-suave
          sm:hidden"
        type="button"
        onClick={() => establecerAbierto(true)}
        aria-label="Abrir búsqueda"
      >
        <Search size={19} />
      </button>
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center
            bg-texto/30 px-4 pt-[12vh]"
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              establecerAbierto(false);
            }
          }}
        >
          <section
            className="w-full max-w-xl overflow-hidden rounded-tarjeta
              border border-borde bg-superficie shadow-sutil"
            role="dialog"
            aria-modal="true"
            aria-label="Búsqueda global"
          >
            <label className="flex items-center gap-3 border-b border-borde px-4">
              <Search size={18} className="text-texto-suave" />
              <input
                ref={entrada}
                className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none"
                onChange={(evento) => establecerConsulta(evento.target.value)}
                placeholder="Mascota, dueño o cita..."
                value={consulta}
              />
              <button
                className="text-xs text-texto-suave"
                type="button"
                onClick={() => establecerAbierto(false)}
              >
                Esc
              </button>
            </label>
            <div className="max-h-80 overflow-y-auto p-2">
              {resultados.length > 0 ? (
                resultados.map((resultado) => (
                  <button
                    className="flex w-full flex-col rounded-control px-3 py-2
                      text-left hover:bg-primario-suave"
                    key={`${resultado.ruta}-${resultado.titulo}`}
                    type="button"
                    onClick={() => abrirResultado(resultado.ruta)}
                  >
                    <span className="text-sm font-medium text-texto">
                      {resultado.titulo}
                    </span>
                    <span className="text-xs text-texto-suave">
                      {resultado.detalle}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-5 text-sm text-texto-suave">
                  Escribí para buscar mascotas, dueños o citas.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function buscarRegistros(
  datos: DatosPanel | undefined,
  texto: string,
): ResultadoBusqueda[] {
  const busqueda = texto.trim().toLocaleLowerCase('es');
  if (!busqueda || !datos) {
    return [];
  }

  const mascotas = datos.mascotas
    .filter((mascota) => `${mascota.nombre} ${mascota.especie} ${mascota.raza}`
      .toLocaleLowerCase('es').includes(busqueda))
    .map((mascota) => ({
      titulo: mascota.nombre,
      detalle: `${mascota.especie} · ${nombreResponsable(mascota.cliente)}`,
      ruta: `/pacientes/${mascota.id}`,
    }));
  const propietarios = datos.clientes
    .filter((cliente) => `${cliente.nombre} ${cliente.apellido} ${cliente.correo}`
      .toLocaleLowerCase('es').includes(busqueda))
    .map((cliente) => ({
      titulo: `${cliente.nombre} ${cliente.apellido}`,
      detalle: cliente.correo,
      ruta: '/propietarios',
    }));
  const turnos = datos.turnos
    .filter((turno) => `${turno.motivo} ${turno.fecha} ${turno.hora} ${nombreMascota(turno.mascota)}`
      .toLocaleLowerCase('es').includes(busqueda))
    .map((turno) => ({
      titulo: nombreMascota(turno.mascota),
      detalle: `${turno.fecha || ''} · ${turno.hora || ''} · ${turno.motivo || 'Consulta'}`,
      ruta: '/agenda',
    }));

  return [...mascotas, ...propietarios, ...turnos].slice(0, 8);
}

function nombreResponsable(
  responsable: string | { nombre: string; apellido: string } | null | undefined,
): string {
  if (typeof responsable === 'string') {
    return responsable;
  }
  if (responsable) {
    return `${responsable.nombre} ${responsable.apellido}`;
  }
  return 'Responsable no disponible';
}

function nombreMascota(
  mascota: string | { nombre: string } | undefined,
): string {
  if (typeof mascota === 'string') {
    return mascota;
  }
  return mascota?.nombre || 'Paciente';
}

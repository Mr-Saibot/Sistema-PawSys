import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DatosPanel, Persona } from '../../tipos';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { formatearGuaranies } from '../utilidades/formato-clinica';
import { Avatar } from './Avatar';
import { Boton } from './Boton';
import { Tarjeta } from './Tarjeta';

interface PropiedadesTarjetaPropietario {
  propietario: Persona;
  puedeEditar: boolean;
  alEditar: (propietario: Persona) => void;
  alDesactivar: (propietario: Persona) => void;
}

export function TarjetaPropietario({
  propietario,
  puedeEditar,
  alEditar,
  alDesactivar,
}: PropiedadesTarjetaPropietario) {
  const { datos } = usePanelClinica();
  const mascotas = datos.mascotas.filter((mascota) =>
    mascota.clienteId === propietario.id);
  const saldoPendiente = obtenerSaldoPendiente(propietario.id, datos);

  return (
    <Tarjeta className="p-5">
      <div className="flex items-start gap-3">
        <Avatar
          nombre={`${propietario.nombre} ${propietario.apellido}`}
          tamano="pequeno"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold">
            {propietario.nombre} {propietario.apellido}
          </h2>
          <p className="mt-1 flex items-center gap-1 truncate text-sm
            text-texto-suave">
            <Mail size={14} />
            {propietario.correo}
          </p>
          {propietario.telefono && (
            <p className="mt-1 flex items-center gap-1 text-sm text-texto-suave">
              <Phone size={14} />
              {propietario.telefono}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t border-borde pt-3
        text-sm">
        <span className="text-texto-suave">
          {mascotas.length} {mascotas.length === 1 ? 'mascota' : 'mascotas'}
        </span>
        <span className="text-texto-suave">
          Pendiente: <strong className="text-texto">
            {formatearGuaranies(saldoPendiente)}
          </strong>
        </span>
      </div>
      {mascotas.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {mascotas.map((mascota) => (
            <li key={mascota.id}>
              <Link
                className="flex items-center justify-between rounded-control
                  px-2 py-2 text-sm hover:bg-fondo"
                to={`/pacientes/${mascota.id}`}
              >
                <span>{mascota.nombre} · {mascota.especie}</span>
                <span className="text-primario-oscuro">Ver ficha</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {puedeEditar && (
        <div className="mt-3 flex gap-2 border-t border-borde pt-3">
          <Boton
            className="min-h-9 px-3 text-xs"
            variante="secundario"
            onClick={() => alEditar(propietario)}
          >
            Editar
          </Boton>
          <Boton
            className="min-h-9 px-3 text-xs"
            variante="sutil"
            onClick={() => alDesactivar(propietario)}
          >
            Desactivar cuenta
          </Boton>
        </div>
      )}
    </Tarjeta>
  );
}

function obtenerSaldoPendiente(
  propietarioId: number | undefined,
  datos: DatosPanel,
): number {
  const mascotas = datos.mascotas.filter((mascota) =>
    mascota.clienteId === propietarioId);
  const mascotaIds = new Set(mascotas.map((mascota) => mascota.id));
  const historialIds = new Set(
    datos.historiales
      .filter((historial) => mascotaIds.has(historial.mascotaId))
      .map((historial) => historial.id),
  );
  const consultasPendientes = datos.consultas
    .filter((consulta) =>
      historialIds.has(consulta.historialId) && !consulta.ingreso);
  const vacunasPendientes = datos.vacunaciones
    .filter((vacuna) =>
      historialIds.has(vacuna.historialId) && !vacuna.ingreso);

  return sumarCostos(consultasPendientes.map((item) => item.costo))
    + sumarCostos(vacunasPendientes.map((item) => item.costo));
}

function sumarCostos(costos: (number | string)[]): number {
  return costos.reduce<number>((total, costo) => total + Number(costo), 0);
}

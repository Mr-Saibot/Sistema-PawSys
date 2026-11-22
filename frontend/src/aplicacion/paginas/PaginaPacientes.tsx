import { useMemo, useState, type ReactNode } from 'react';
import { Grid2X2, List, Plus, Search } from 'lucide-react';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { TarjetaMascota } from '../componentes/TarjetaMascota';
import { FormularioMascota } from '../componentes/FormularioMascota';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import { textoResponsable } from '../utilidades/formato-clinica';
import type { DatosPanel } from '../../tipos';

type VistaPacientes = 'grilla' | 'lista';

export function PaginaPacientes() {
  const { datos, sesion } = usePanelClinica();
  const [busqueda, establecerBusqueda] = useState('');
  const [especie, establecerEspecie] = useState('Todas');
  const [vista, establecerVista] = useState<VistaPacientes>('grilla');
  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const pacientes = useMemo(
    () => filtrarPacientes(datos.mascotas, busqueda, especie),
    [datos.mascotas, busqueda, especie],
  );
  const esCliente = sesion.usuario.rol === 'CLIENTE';

  return (
    <div>
      <EncabezadoModulo
        titulo={esCliente ? 'Mis mascotas' : 'Mascotas'}
        descripcion="Cada mascota tiene su propia ficha clínica y seguimiento."
        accion={
          <Boton
            icono={<Plus size={17} />}
            onClick={() => establecerFormularioAbierto(true)}
          >
            Nueva mascota
          </Boton>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative min-w-56 flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2
              text-texto-suave"
            size={17}
          />
          <input
            className="h-11 w-full rounded-control border border-borde
              bg-superficie pl-10 pr-3 text-sm"
            onChange={(evento) => establecerBusqueda(evento.target.value)}
            placeholder="Buscar por nombre, raza o responsable"
            value={busqueda}
          />
        </label>
        <select
          className="h-11 rounded-control border border-borde bg-superficie
            px-3 text-sm"
          onChange={(evento) => establecerEspecie(evento.target.value)}
          value={especie}
          aria-label="Filtrar por especie"
        >
          <option>Todas</option>
          {obtenerEspecies(datos.mascotas).map((valor) => (
            <option key={valor}>{valor}</option>
          ))}
        </select>
        <div className="flex rounded-control border border-borde bg-superficie p-1">
          <BotonVista
            activo={vista === 'grilla'}
            icono={<Grid2X2 size={17} />}
            etiqueta="Ver como grilla"
            alClick={() => establecerVista('grilla')}
          />
          <BotonVista
            activo={vista === 'lista'}
            icono={<List size={17} />}
            etiqueta="Ver como lista"
            alClick={() => establecerVista('lista')}
          />
        </div>
      </div>
      {pacientes.length
        ? vista === 'grilla'
          ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pacientes.map((mascota) => (
                <TarjetaMascota
                  key={mascota.id}
                  mascota={mascota}
                  permitirFoto={esCliente}
                />
              ))}
            </div>
          )
          : <ListaPacientes pacientes={pacientes} />
        : <EstadoVacio
          titulo={busqueda ? 'No encontramos mascotas' : 'Todavía no hay mascotas'}
          descripcion={busqueda
            ? 'Probá con otro nombre, especie o responsable.'
            : 'Agregá una mascota para comenzar a organizar sus cuidados.'}
          accion={!busqueda && (
            <Boton onClick={() => establecerFormularioAbierto(true)}>
              Agregar mascota
            </Boton>
          )}
        />}
      {formularioAbierto && (
        <PanelLateralFormulario
          titulo="Nueva mascota"
          descripcion="La ficha clínica se crea automáticamente con la mascota."
          alCerrar={() => establecerFormularioAbierto(false)}
        >
          <FormularioMascota
            clientes={datos.clientes}
            alCancelar={() => establecerFormularioAbierto(false)}
            alGuardar={() => establecerFormularioAbierto(false)}
          />
        </PanelLateralFormulario>
      )}
    </div>
  );
}

interface PropiedadesBotonVista {
  activo: boolean;
  icono: ReactNode;
  etiqueta: string;
  alClick: () => void;
}

function BotonVista({
  activo,
  icono,
  etiqueta,
  alClick,
}: PropiedadesBotonVista) {
  return (
    <button
      className={`rounded-control p-2 ${activo
        ? 'bg-primario-suave text-primario-oscuro'
        : 'text-texto-suave hover:bg-fondo'}`}
      type="button"
      onClick={alClick}
      aria-label={etiqueta}
      aria-pressed={activo}
    >
      {icono}
    </button>
  );
}

function ListaPacientes({ pacientes }: { pacientes: DatosPanel['mascotas'] }) {
  return (
    <div className="overflow-x-auto rounded-tarjeta border border-borde
      bg-superficie">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="border-b border-borde text-texto-suave">
          <tr>
            <th className="px-4 py-3 font-medium">Mascota</th>
            <th className="px-4 py-3 font-medium">Especie / raza</th>
            <th className="px-4 py-3 font-medium">Responsable</th>
            <th className="px-4 py-3 font-medium">Peso</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((mascota) => (
            <tr className="border-b border-borde last:border-0" key={mascota.id}>
              <td className="px-4 py-3 font-medium">{mascota.nombre}</td>
              <td className="px-4 py-3">
                {mascota.especie} · {mascota.raza || 'Sin raza'}
              </td>
              <td className="px-4 py-3">{textoResponsable(mascota)}</td>
              <td className="px-4 py-3">
                {mascota.peso ? `${mascota.peso} kg` : 'Sin dato'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function filtrarPacientes(
  pacientes: DatosPanel['mascotas'],
  texto: string,
  especie: string,
) {
  const consulta = texto.trim().toLocaleLowerCase('es');

  return pacientes.filter((mascota) => {
    const coincideEspecie = especie === 'Todas'
      || mascota.especie === especie;
    const textoPaciente = [
      mascota.nombre,
      mascota.especie,
      mascota.raza || '',
      textoResponsable(mascota),
    ].join(' ').toLocaleLowerCase('es');

    return coincideEspecie && textoPaciente.includes(consulta);
  });
}

function obtenerEspecies(pacientes: DatosPanel['mascotas']): string[] {
  return [...new Set(pacientes.map((mascota) => mascota.especie))];
}

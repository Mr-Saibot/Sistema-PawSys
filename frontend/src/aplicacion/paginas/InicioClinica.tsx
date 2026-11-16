import { CalendarPlus, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../componentes/Avatar';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { Insignia } from '../componentes/Insignia';
import { Tarjeta } from '../componentes/Tarjeta';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import {
  formatearFecha,
  nombreMascota,
  obtenerFechaHoy,
} from '../utilidades/formato-clinica';

export function InicioClinica() {
  const { datos, sesion } = usePanelClinica();
  const nombre = sesion.usuario.correo.split('@')[0];
  const citasHoy = obtenerCitasHoy(datos.turnos);

  return (
    <div>
      <EncabezadoModulo
        titulo={`Hola, ${nombre}`}
        descripcion={`${formatearFecha(obtenerFechaHoy())}. Veamos qué necesita atención hoy.`}
        accion={<AccionesRapidas rol={sesion.usuario.rol} />}
      />
      {sesion.usuario.rol === 'CLIENTE'
        ? <InicioCliente />
        : <InicioClinicaEquipo citasHoy={citasHoy} />}
    </div>
  );
}

interface PropiedadesInicioEquipo {
  citasHoy: ReturnType<typeof obtenerCitasHoy>;
}

function InicioClinicaEquipo({ citasHoy }: PropiedadesInicioEquipo) {
  const { datos } = usePanelClinica();

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
      <Tarjeta className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Agenda de hoy</h2>
            <p className="text-sm text-texto-suave">
              {fraseCitas(citasHoy.length)}
            </p>
          </div>
          <Link className="text-sm font-medium text-primario-oscuro" to="/agenda">
            Ver agenda
          </Link>
        </div>
        <ListaCitas citas={citasHoy} />
      </Tarjeta>
      <aside className="grid content-start gap-5">
        <ResumenEquipo cantidadMascotas={datos.mascotas.length} />
        <Tarjeta className="p-5">
          <h2 className="font-semibold">Para tener en cuenta</h2>
          <p className="mt-2 text-sm leading-6 text-texto-suave">
            Las consultas, vacunas y cobros se registran desde sus secciones
            correspondientes para mantener el historial de cada paciente.
          </p>
        </Tarjeta>
      </aside>
    </div>
  );
}

function InicioCliente() {
  const { datos } = usePanelClinica();
  const proximoTurno = datos.turnos
    .filter((turno) => turno.estado !== 'CANCELADO')
    .sort((primero, segundo) =>
      new Date(primero.fecha || '').getTime()
      - new Date(segundo.fecha || '').getTime())
    .at(0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
      <Tarjeta className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Tus mascotas</h2>
        <p className="mb-4 text-sm text-texto-suave">
          Sus fichas clínicas, cuidados y próximas visitas.
        </p>
        {datos.mascotas.length
          ? <ListaMascotasInicio />
          : <EstadoVacio
            icono={<PawPrint size={22} />}
            titulo="Todavía no registraste mascotas"
            descripcion="Agregá un paciente para consultar su ficha y reservar turnos."
            accion={<Link to="/mascotas"><Boton>Agregar mascota</Boton></Link>}
          />}
      </Tarjeta>
      <Tarjeta className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Tu próxima visita</h2>
        {proximoTurno
          ? (
            <div className="mt-4">
              <p className="text-sm text-texto-suave">
                {proximoTurno.fecha
                  ? formatearFecha(proximoTurno.fecha)
                  : 'Fecha pendiente'}
              </p>
              <p className="mt-1 text-xl font-semibold">
                {proximoTurno.hora || 'Horario pendiente'}
              </p>
              <Insignia tono="primario">
                {proximoTurno.estado || 'Pendiente'}
              </Insignia>
            </div>
          )
          : <EstadoVacio
            titulo="Aún no tenés turnos"
            descripcion="Buscá un horario disponible y elegí la mascota."
            accion={<Link to="/agenda"><Boton>Buscar horario</Boton></Link>}
          />}
      </Tarjeta>
    </div>
  );
}

function ListaMascotasInicio() {
  const { datos } = usePanelClinica();

  return (
    <ul className="grid gap-3">
      {datos.mascotas.slice(0, 4).map((mascota) => (
        <li key={mascota.id}>
          <Link
            className="flex items-center gap-3 rounded-control border
              border-borde p-3 hover:bg-fondo"
            to={`/pacientes/${mascota.id}`}
          >
            <Avatar
              nombre={mascota.nombre}
              foto={mascota.fotoUrl}
              tamano="pequeno"
            />
            <span className="min-w-0 flex-1">
              <strong className="block truncate">{mascota.nombre}</strong>
              <span className="text-sm text-texto-suave">
                {mascota.especie} · {mascota.raza || 'Raza no indicada'}
              </span>
            </span>
            <span className="text-sm text-primario-oscuro">Ver ficha</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

interface PropiedadesListaCitas {
  citas: ReturnType<typeof obtenerCitasHoy>;
}

function ListaCitas({ citas }: PropiedadesListaCitas) {
  if (!citas.length) {
    return (
      <EstadoVacio
        titulo="Agenda tranquila por ahora"
        descripcion="Los turnos nuevos aparecerán acá cuando se reserven."
      />
    );
  }

  return (
    <ol className="grid gap-2">
      {citas.map((turno) => (
        <li key={turno.id}>
          <Link
            className="flex items-center gap-3 rounded-control px-2 py-3
              hover:bg-fondo"
            to={turno.mascotaId
              ? `/pacientes/${turno.mascotaId}`
              : '/agenda'}
          >
            <span className="w-14 text-sm font-medium text-verde-profundo">
              {turno.hora || '—'}
            </span>
            <Avatar
              nombre={nombreMascota(turno)}
              tamano="pequeno"
            />
            <span className="min-w-0 flex-1">
              <strong className="block truncate">
                {nombreMascota(turno)}
              </strong>
              <span className="block truncate text-sm text-texto-suave">
                {turno.motivo || 'Consulta'}
              </span>
            </span>
            <Insignia>{turno.estado || 'Pendiente'}</Insignia>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function ResumenEquipo({ cantidadMascotas }: { cantidadMascotas: number }) {
  return (
    <Tarjeta className="flex items-center gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-full
        bg-primario-suave text-primario-oscuro">
        <PawPrint size={20} />
      </span>
      <p className="text-sm text-texto-suave">
        Estás acompañando a
        <strong className="ml-1 text-texto">{cantidadMascotas} pacientes</strong>
        en la clínica.
      </p>
    </Tarjeta>
  );
}

function AccionesRapidas({ rol }: { rol: string }) {
  const esCliente = rol === 'CLIENTE';
  const ruta = esCliente ? '/agenda' : '/historias';
  const texto = esCliente ? 'Nueva cita' : 'Nueva consulta';
  const etiquetaSecundaria = esCliente ? 'Mis mascotas' : 'Pacientes';
  const rutaSecundaria = esCliente ? '/mascotas' : '/pacientes';

  return (
    <div className="flex flex-wrap gap-2">
      <Link to={ruta}>
        <Boton icono={esCliente
          ? <CalendarPlus size={17} />
          : <PawPrint size={17} />}
        >
          {texto}
        </Boton>
      </Link>
      <Link to={rutaSecundaria}>
        <Boton variante="secundario">{etiquetaSecundaria}</Boton>
      </Link>
    </div>
  );
}

function obtenerCitasHoy(turnos: ReturnType<typeof usePanelClinica>['datos']['turnos']) {
  const hoy = obtenerFechaHoy();

  return turnos
    .filter((turno) =>
      turno.fecha?.slice(0, 10) === hoy
      && turno.estado !== 'CANCELADO')
    .sort((primero, segundo) =>
      (primero.hora || '').localeCompare(segundo.hora || ''));
}

function fraseCitas(cantidad: number): string {
  if (cantidad === 0) {
    return 'Hoy no hay citas programadas todavía.';
  }
  if (cantidad === 1) {
    return 'Hoy tenés 1 cita programada.';
  }
  return `Hoy tenés ${cantidad} citas programadas.`;
}

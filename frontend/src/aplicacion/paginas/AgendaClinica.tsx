import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Boton } from '../componentes/Boton';
import { BloqueAgenda } from '../componentes/BloqueAgenda';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { FormularioHorario } from '../componentes/FormularioHorario';
import { FormularioReserva } from '../componentes/FormularioReserva';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import type { Agenda, Turno } from '../../tipos';
import { formatearFecha } from '../utilidades/formato-clinica';

export function AgendaClinica() {
  const { datos, sesion, modificar } = usePanelClinica();
  const [desplazamiento, establecerDesplazamiento] = useState(0);
  const [formularioHorario, establecerFormularioHorario] = useState(false);
  const [horarioSeleccionado, establecerHorarioSeleccionado] =
    useState<Agenda | null>(null);
  const [error, establecerError] = useState('');
  const dias = useMemo(
    () => obtenerDiasSemana(desplazamiento),
    [desplazamiento],
  );
  const esCliente = sesion.usuario.rol === 'CLIENTE';

  async function eliminarHorario(agenda: Agenda) {
    const confirmado = window.confirm(
      `¿Eliminar el horario del ${agenda.fecha.slice(0, 10)} a las ${agenda.horario}?`,
    );
    if (!confirmado) {
      return;
    }
    try {
      await modificar(`/agendas/${agenda.id}`, 'DELETE');
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  async function cancelarTurno(turno: Turno) {
    const confirmado = window.confirm('¿Cancelar este turno?');
    if (!confirmado || !turno.id) {
      return;
    }
    try {
      await modificar(`/turnos/${turno.id}/cancelar`, 'PATCH');
    } catch (causa) {
      establecerError(mensajeError(causa));
    }
  }

  return (
    <div>
      <EncabezadoModulo
        titulo={esCliente ? 'Encontrá un horario' : 'Agenda clínica'}
        descripcion={esCliente
          ? 'Elegí un espacio disponible para reservar la consulta.'
          : 'Consultá las citas y publicá horarios de atención.'}
        accion={!esCliente && (
          <Boton
            icono={<CalendarPlus size={17} />}
            onClick={() => establecerFormularioHorario(true)}
          >
            Publicar horario
          </Boton>
        )}
      />
      {error && <p className="mb-4 text-sm text-error" role="alert">{error}</p>}
      <NavegacionSemana
        dias={dias}
        alAnterior={() => establecerDesplazamiento((valor) => valor - 1)}
        alSiguiente={() => establecerDesplazamiento((valor) => valor + 1)}
        alHoy={() => establecerDesplazamiento(0)}
      />
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[56rem] grid-cols-7 gap-3">
          {dias.map((dia) => (
            <BloqueAgenda
              key={dia.clave}
              fechaTexto={dia.clave}
              tituloDia={dia.titulo}
              horarios={datos.agendas}
              turnos={datos.turnos}
              rol={sesion.usuario.rol}
              alSeleccionarHorario={establecerHorarioSeleccionado}
              alEliminarHorario={(agenda) => void eliminarHorario(agenda)}
              alCancelarTurno={(turno) => void cancelarTurno(turno)}
            />
          ))}
        </div>
      </div>
      {formularioHorario && (
        <PanelLateralFormulario
          titulo="Publicar un horario"
          descripcion="Los turnos se ofrecen en bloques de 30 minutos o una hora."
          alCerrar={() => establecerFormularioHorario(false)}
        >
          <FormularioHorario
            veterinarios={datos.veterinarios}
            alCancelar={() => establecerFormularioHorario(false)}
            alGuardar={() => establecerFormularioHorario(false)}
          />
        </PanelLateralFormulario>
      )}
      {horarioSeleccionado && (
        <PanelLateralFormulario
          titulo="Reservar consulta"
          descripcion="El horario quedará reservado para la mascota elegida."
          alCerrar={() => establecerHorarioSeleccionado(null)}
        >
          {datos.mascotas.length
            ? <FormularioReserva
              agenda={horarioSeleccionado}
              mascotas={datos.mascotas}
              alCancelar={() => establecerHorarioSeleccionado(null)}
              alGuardar={() => establecerHorarioSeleccionado(null)}
            />
            : <p className="text-sm text-texto-suave">
              Registrá una mascota antes de reservar un turno.
            </p>}
        </PanelLateralFormulario>
      )}
    </div>
  );
}

function mensajeError(causa: unknown): string {
  if (causa instanceof Error) {
    return causa.message;
  }
  return 'No se pudo completar la operación de agenda.';
}

interface DiaAgenda {
  clave: string;
  titulo: string;
}

interface PropiedadesNavegacionSemana {
  dias: DiaAgenda[];
  alAnterior: () => void;
  alSiguiente: () => void;
  alHoy: () => void;
}

function NavegacionSemana({
  dias,
  alAnterior,
  alSiguiente,
  alHoy,
}: PropiedadesNavegacionSemana) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium capitalize text-texto">
        {dias[0].titulo} — {dias[dias.length - 1].titulo}
      </p>
      <div className="flex items-center gap-2">
        <Boton variante="secundario" onClick={alHoy}>Hoy</Boton>
        <Boton variante="secundario" onClick={alAnterior}>
          <ChevronLeft size={17} />
          Semana anterior
        </Boton>
        <Boton variante="secundario" onClick={alSiguiente}>
          Semana siguiente
          <ChevronRight size={17} />
        </Boton>
      </div>
    </div>
  );
}

function obtenerDiasSemana(desplazamiento: number): DiaAgenda[] {
  const hoy = new Date();
  const diferenciaLunes = (hoy.getDay() + 6) % 7;
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  lunes.setDate(lunes.getDate() - diferenciaLunes + desplazamiento * 7);

  return Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + indice);
    const clave = [
      dia.getFullYear(),
      String(dia.getMonth() + 1).padStart(2, '0'),
      String(dia.getDate()).padStart(2, '0'),
    ].join('-');

    return {
      clave,
      titulo: formatearFecha(clave),
    };
  });
}

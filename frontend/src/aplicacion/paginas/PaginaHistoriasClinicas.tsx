import { useState } from 'react';
import { ClipboardPlus, Syringe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Boton } from '../componentes/Boton';
import { EncabezadoModulo } from '../componentes/EncabezadoModulo';
import { EstadoVacio } from '../componentes/EstadoVacio';
import { FormularioAtencionClinica } from '../componentes/FormularioAtencionClinica';
import { Insignia } from '../componentes/Insignia';
import { PanelLateralFormulario } from '../componentes/PanelLateralFormulario';
import { Tarjeta } from '../componentes/Tarjeta';
import { usePanelClinica } from '../contextos/ContextoPanelClinica';
import type { HistorialClinico } from '../../tipos';

type TipoAtencion = 'consulta' | 'vacunacion';

export function PaginaHistoriasClinicas() {
  const { datos } = usePanelClinica();
  const [tipoAtencion, establecerTipoAtencion] =
    useState<TipoAtencion | null>(null);

  return (
    <div>
      <EncabezadoModulo
        titulo="Historias clínicas"
        descripcion="Una ficha por mascota, con cada consulta y vacunación en su línea de tiempo."
        accion={<AccionesAtencion alElegir={establecerTipoAtencion} />}
      />
      {datos.historiales.length
        ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {datos.historiales.map((historial) => (
              <TarjetaHistoria
                historial={historial}
                key={historial.id}
              />
            ))}
          </div>
        )
        : <EstadoVacio
          titulo="Aún no hay fichas clínicas"
          descripcion="Al registrar una mascota, su ficha clínica se crea automáticamente."
        />}
      {tipoAtencion && (
        <PanelLateralFormulario
          titulo={tipoAtencion === 'consulta'
            ? 'Registrar consulta'
            : 'Registrar vacunación'}
          descripcion="La atención se agrega a la ficha clínica de la mascota."
          alCerrar={() => establecerTipoAtencion(null)}
        >
          <FormularioAtencionClinica
            tipo={tipoAtencion}
            historiales={datos.historiales}
            veterinarios={datos.veterinarios}
            alCancelar={() => establecerTipoAtencion(null)}
            alGuardar={() => establecerTipoAtencion(null)}
          />
        </PanelLateralFormulario>
      )}
    </div>
  );
}

function AccionesAtencion({
  alElegir,
}: {
  alElegir: (tipo: TipoAtencion) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Boton
        variante="secundario"
        icono={<Syringe size={17} />}
        onClick={() => alElegir('vacunacion')}
      >
        Registrar vacuna
      </Boton>
      <Boton
        icono={<ClipboardPlus size={17} />}
        onClick={() => alElegir('consulta')}
      >
        Nueva consulta
      </Boton>
    </div>
  );
}

function TarjetaHistoria({ historial }: { historial: HistorialClinico }) {
  const { datos } = usePanelClinica();
  const mascota = datos.mascotas.find((item) =>
    item.id === historial.mascotaId);
  const consultas = datos.consultas.filter((item) =>
    item.historialId === historial.id);
  const vacunas = datos.vacunaciones.filter((item) =>
    item.historialId === historial.id);
  const nombre = historial.mascota?.nombre || mascota?.nombre || 'Paciente';

  return (
    <Tarjeta className="p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Link
            className="text-lg font-semibold text-verde-profundo
              hover:text-primario-oscuro"
            to={`/pacientes/${historial.mascotaId}`}
          >
            {nombre}
          </Link>
          <p className="text-sm text-texto-suave">
            {mascota?.especie || 'Ficha clínica'}
          </p>
        </div>
        <Insignia tono="verde">
          {consultas.length + vacunas.length} registros
        </Insignia>
      </header>
      {historial.observaciones && (
        <p className="mb-4 rounded-control bg-fondo p-3 text-sm
          text-texto-suave">
          {historial.observaciones}
        </p>
      )}
      <ol className="grid gap-3 border-l border-borde pl-4">
        {consultas.map((consulta) => (
          <li className="relative text-sm" key={`consulta-${consulta.id}`}>
            <span className="absolute -left-[1.32rem] top-1 h-2 w-2
              rounded-full bg-primario" />
            <strong>Consulta · {consulta.motivo}</strong>
            <p className="mt-1 text-texto-suave">
              {consulta.diagnostico || consulta.tratamiento || 'Sin detalle clínico'}
            </p>
          </li>
        ))}
        {vacunas.map((vacuna) => (
          <li className="relative text-sm" key={`vacuna-${vacuna.id}`}>
            <span className="absolute -left-[1.32rem] top-1 h-2 w-2
              rounded-full bg-verde-profundo" />
            <strong>Vacuna · {vacuna.vacuna}</strong>
            <p className="mt-1 text-texto-suave">
              {vacuna.proximaDosis
                ? `Próxima dosis: ${vacuna.proximaDosis.slice(0, 10)}`
                : 'Sin próxima dosis registrada'}
            </p>
          </li>
        ))}
        {consultas.length === 0 && vacunas.length === 0 && (
          <li className="text-sm text-texto-suave">
            Todavía no hay atenciones registradas.
          </li>
        )}
      </ol>
    </Tarjeta>
  );
}

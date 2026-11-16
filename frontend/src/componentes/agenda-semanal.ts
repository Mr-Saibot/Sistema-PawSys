import { escaparHtml } from '../utilidades/formato-html.js';
import type { Agenda, DatosPanel, Rol, Turno } from '../tipos.js';

const DIAS_DE_LA_SEMANA = 7;

function fechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

function fechaComoTexto(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function inicioDeSemana(desplazamiento: number): Date {
  const fecha = new Date();
  const diasDesdeLunes = (fecha.getDay() + 6) % DIAS_DE_LA_SEMANA;
  fecha.setDate(fecha.getDate() - diasDesdeLunes);
  fecha.setDate(
    fecha.getDate() + desplazamiento * DIAS_DE_LA_SEMANA,
  );
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function nombreDia(fecha: Date): string {
  return new Intl.DateTimeFormat('es-PY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(fecha);
}

function opcionesMascotas(datos: DatosPanel): string {
  return datos.mascotas.map((mascota) => (
    `<option value="${mascota.id}">`
      + `${escaparHtml(mascota.nombre)}</option>`
  )).join('');
}

function nombreMascota(turno: Turno): string {
  if (typeof turno.mascota === 'string') {
    return turno.mascota;
  }
  return turno.mascota?.nombre || 'Paciente';
}

function renderizarTurno(turno: Turno): string {
  const motivo = escaparHtml(turno.motivo || 'Consulta');
  const paciente = escaparHtml(nombreMascota(turno));
  const estado = escaparHtml(turno.estado || 'PENDIENTE');
  const hora = escaparHtml(turno.hora || '');

  return `
    <article class="calendar-appointment">
      <strong>${hora} · ${paciente}</strong>
      <span>${motivo}</span>
      <span class="tag">${estado}</span>
    </article>
  `;
}

function renderizarReserva(
  agenda: Agenda,
  datos: DatosPanel,
): string {
  if (datos.mascotas.length === 0) {
    return `
      <article class="calendar-slot">
        <strong>
          ${escaparHtml(agenda.horario)} · ${agenda.duracionMinutos} min
        </strong>
        <span>Registra una mascota para reservar.</span>
      </article>
    `;
  }

  const veterinario = agenda.veterinario;
  const nombreVeterinario = veterinario
    ? `${veterinario.nombre} ${veterinario.apellido}`
    : 'Equipo veterinario';

  return `
    <article class="calendar-slot">
      <strong>
        ${escaparHtml(agenda.horario)} · ${agenda.duracionMinutos} min
      </strong>
      <span>${escaparHtml(nombreVeterinario)}</span>
      <form
        class="calendar-booking"
        data-reservar-agenda
        data-agenda-id="${agenda.id}"
      >
        <label class="field">
          Mascota
          <select name="mascotaId" required>
            ${opcionesMascotas(datos)}
          </select>
        </label>
        <label class="field">
          Motivo
          <input name="motivo" maxlength="160" />
        </label>
        <button class="primary-button" type="submit">
          Reservar horario
        </button>
        <div class="login-error" role="alert"></div>
      </form>
    </article>
  `;
}

function renderizarEspacioLibre(agenda: Agenda): string {
  const fechaTexto = escaparHtml(
    fechaLocal(agenda.fecha).toLocaleDateString('es-PY'),
  );
  const horario = escaparHtml(agenda.horario);

  return `
    <article class="calendar-slot">
      <strong>${horario} · ${agenda.duracionMinutos} min</strong>
      <span>Disponible</span>
      <button
        class="text-button danger-button"
        type="button"
        data-api-delete="/agendas/${agenda.id}"
        data-confirm="¿Eliminar el horario del ${fechaTexto} a las ${horario}?"
      >
        Eliminar horario
      </button>
    </article>
  `;
}

function obtenerTurnosDelDia(
  turnos: Turno[],
  fechaTexto: string,
): Turno[] {
  return turnos.filter(
    (turno) => turno.fecha?.slice(0, 10) === fechaTexto,
  );
}

function obtenerEspaciosDelDia(
  agenda: Agenda[],
  fechaTexto: string,
): Agenda[] {
  return agenda.filter((espacio) => (
    espacio.fecha.slice(0, 10) === fechaTexto
    && !espacio.turnos
  ));
}

function renderizarDia(
  fecha: Date,
  agenda: Agenda[],
  turnos: Turno[],
  datos: DatosPanel,
  rol: Rol,
): string {
  const fechaTexto = fechaComoTexto(fecha);
  const turnosDelDia = obtenerTurnosDelDia(turnos, fechaTexto);
  const espaciosDelDia = obtenerEspaciosDelDia(agenda, fechaTexto);
  const items = renderizarElementosDelDia(
    turnosDelDia,
    espaciosDelDia,
    datos,
    rol,
  );
  const contenido = items || (
    '<p class="calendar-empty">Sin citas ni horarios.</p>'
  );

  return `
    <section class="calendar-day">
      <h3>${escaparHtml(nombreDia(fecha))}</h3>
      <div class="calendar-day-items">${contenido}</div>
    </section>
  `;
}

function renderizarElementosDelDia(
  turnos: Turno[],
  agenda: Agenda[],
  datos: DatosPanel,
  rol: Rol,
): string {
  const turnosHtml = turnos.map(renderizarTurno);
  const espaciosHtml = agenda.map((espacio) => {
    if (rol === 'CLIENTE') {
      return renderizarReserva(espacio, datos);
    }
    return renderizarEspacioLibre(espacio);
  });
  return [...turnosHtml, ...espaciosHtml].join('');
}

function opcionesVeterinarios(datos: DatosPanel): string {
  return datos.veterinarios.map((veterinario) => (
    `<option value="${veterinario.id}">`
      + `${escaparHtml(veterinario.nombre)} `
      + `${escaparHtml(veterinario.apellido)}</option>`
  )).join('');
}

function selectorVeterinario(
  datos: DatosPanel,
  rol: Rol,
): string {
  if (rol !== 'ADMINISTRADOR') {
    return '';
  }

  return `
    <label class="field">
      Veterinario
      <select name="veterinarioId" required>
        ${opcionesVeterinarios(datos)}
      </select>
    </label>
  `;
}

function formularioHorario(
  datos: DatosPanel,
  rol: Rol,
): string {
  const fechaMinima = fechaComoTexto(new Date());
  const veterinario = selectorVeterinario(datos, rol);

  return `
    <form
      class="form-grid"
      data-api-form
      data-endpoint="/agendas"
      data-method="POST"
    >
      <label class="field">
        Fecha
        <input
          name="fecha"
          type="date"
          min="${fechaMinima}"
          required
        />
      </label>
      <label class="field">
        Hora
        <input name="horario" type="time" step="1800" required />
      </label>
      <label class="field">
        Duración
        <select name="duracionMinutos" required>
          <option value="30">30 minutos</option>
          <option value="60">1 hora</option>
        </select>
      </label>
      ${veterinario}
      <button class="primary-button" type="submit">
        Publicar horario
      </button>
      <div class="login-error" role="alert"></div>
    </form>
  `;
}

function formularioNuevoHorario(
  datos: DatosPanel,
  rol: Rol,
): string {
  if (rol === 'CLIENTE') {
    return '';
  }

  const sinVeterinarios = rol === 'ADMINISTRADOR'
    && datos.veterinarios.length === 0;
  const contenido = sinVeterinarios
    ? '<div class="notice">Primero registra un veterinario para crear horarios.</div>'
    : formularioHorario(datos, rol);

  return `
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>Crear un horario</h2>
          <p>Elige una duración de 30 minutos o una hora.</p>
        </div>
      </div>
      ${contenido}
    </section>
  `;
}

function renderizarColumnasSemana(
  inicio: Date,
  agenda: Agenda[],
  turnos: Turno[],
  datos: DatosPanel,
  rol: Rol,
): string {
  const columnas: string[] = [];

  for (let indice = 0; indice < DIAS_DE_LA_SEMANA; indice += 1) {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + indice);
    columnas.push(renderizarDia(fecha, agenda, turnos, datos, rol));
  }

  return columnas.join('');
}

function nombreSemana(inicio: Date, desplazamiento: number): string {
  if (desplazamiento === 0) {
    return 'Esta semana';
  }

  return `Semana del ${inicio.toLocaleDateString('es-PY', {
    day: 'numeric',
    month: 'long',
  })}`;
}

export function renderizarAgendaSemanal(
  agenda: Agenda[],
  turnos: Turno[],
  datos: DatosPanel,
  rol: Rol,
  desplazamiento = 0,
): string {
  const inicio = inicioDeSemana(desplazamiento);
  const columnas = renderizarColumnasSemana(
    inicio,
    agenda,
    turnos,
    datos,
    rol,
  );
  const titulo = nombreSemana(inicio, desplazamiento);

  return `
    ${formularioNuevoHorario(datos, rol)}
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>${escaparHtml(titulo)}</h2>
          <p>Horarios disponibles y turnos reservados</p>
        </div>
        <div class="calendar-navigation">
          <button
            class="secondary-button"
            type="button"
            data-semana-agenda="-1"
          >
            Semana anterior
          </button>
          <button
            class="secondary-button"
            type="button"
            data-semana-agenda="1"
          >
            Semana siguiente
          </button>
        </div>
      </div>
      <div class="weekly-calendar">${columnas}</div>
    </section>
  `;
}

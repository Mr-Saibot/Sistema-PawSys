import { BadRequestException } from '@nestjs/common';

const MINUTOS_APERTURA = 8 * 60;
const MINUTOS_CIERRE = 18 * 60;

export function convertirFechaUtc(fecha: string): Date {
  return new Date(`${fecha}T00:00:00.000Z`);
}

export function obtenerFechaParaguay(fecha: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha);
  const obtener = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value;

  return `${obtener('year')}-${obtener('month')}-${obtener('day')}`;
}

export function validarHorarioAgenda(
  horario: string,
  duracionMinutos: number,
): void {
  const inicio = minutosDesdeMedianoche(horario);
  const fin = inicio + duracionMinutos;

  if (inicio < MINUTOS_APERTURA || fin > MINUTOS_CIERRE) {
    throw new BadRequestException(
      'El horario debe estar entre las 08:00 y las 18:00.',
    );
  }
}

export function horariosSeSuperponen(
  primerHorario: string,
  primeraDuracion: number,
  segundoHorario: string,
  segundaDuracion: number,
): boolean {
  const inicioPrimero = minutosDesdeMedianoche(primerHorario);
  const finPrimero = inicioPrimero + primeraDuracion;
  const inicioSegundo = minutosDesdeMedianoche(segundoHorario);
  const finSegundo = inicioSegundo + segundaDuracion;

  return inicioPrimero < finSegundo && inicioSegundo < finPrimero;
}

export function fechaHoraAgendaEsFutura(
  fecha: Date,
  horario: string,
): boolean {
  const dia = fecha.toISOString().slice(0, 10);
  const inicio = new Date(`${dia}T${horario}:00-03:00`);
  return inicio.getTime() > Date.now();
}

function minutosDesdeMedianoche(horario: string): number {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}

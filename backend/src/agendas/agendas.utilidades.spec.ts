import { BadRequestException } from '@nestjs/common';
import {
  horariosSeSuperponen,
  validarHorarioAgenda,
} from './agendas.utilidades';

describe('reglas de agenda', () => {
  it('permite horarios consecutivos sin solaparlos', () => {
    expect(horariosSeSuperponen('09:00', 30, '09:30', 30)).toBe(false);
  });

  it('detecta el solapamiento entre turnos de distinta duración', () => {
    expect(horariosSeSuperponen('09:00', 60, '09:30', 30)).toBe(true);
  });

  it('rechaza horarios fuera de la jornada de atención', () => {
    expect(() => validarHorarioAgenda('17:30', 60))
      .toThrow(BadRequestException);
  });
});

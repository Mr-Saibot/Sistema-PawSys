import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, Matches } from 'class-validator';

export class CreateAgendaDto {
  @IsDateString()
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horario: string;
}

export class UpdateAgendaDto extends PartialType(CreateAgendaDto) {}
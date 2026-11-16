import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export class CreateAgendaDto {
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horario: string;

  @IsOptional()
  @IsIn([30, 60])
  duracionMinutos?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  veterinarioId?: number;
}

export class UpdateAgendaDto extends PartialType(CreateAgendaDto) {}
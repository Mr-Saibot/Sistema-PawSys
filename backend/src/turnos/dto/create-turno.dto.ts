import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateTurnoDto {
  @IsDateString()
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  hora: string;

  @IsInt()
  @Min(1)
  mascotaId: number;

  @IsInt()
  @Min(1)
  veterinarioId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  agendaId?: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class UpdateTurnoDto extends PartialType(CreateTurnoDto) {}

export class ReprogramarTurnoDto {
  @IsDateString()
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  hora: string;
}
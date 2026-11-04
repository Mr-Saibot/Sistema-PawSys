import { PartialType } from '@nestjs/mapped-types';

export class CreateTurnoDto {
  fecha: string;
  hora: string;
  mascotaId: number;
  veterinarioId: number;
  agendaId?: number;
}

export class UpdateTurnoDto extends PartialType(CreateTurnoDto) {}
import { PartialType } from '@nestjs/mapped-types';
export class CreateAgendaDto {
  fecha: string;
  horario: string;
}
export class UpdateAgendaDto extends PartialType(CreateAgendaDto) {}
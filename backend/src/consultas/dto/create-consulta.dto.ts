import { IsNotEmpty, IsOptional, IsString, IsInt, IsNumber, Min } from 'class-validator';

export class CreateConsultaDto {
  @IsNotEmpty({ message: 'El motivo de la consulta es obligatorio' })
  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsNotEmpty({ message: 'El costo de la consulta es obligatorio' })
  @IsNumber()
  @Min(1, { message: 'El costo de la consulta debe ser mayor a cero' })
  costo: number;

  @IsNotEmpty({ message: 'El ID del historial clínico es obligatorio' })
  @IsInt()
  historialId: number;

  @IsNotEmpty({ message: 'El ID del veterinario es obligatorio' })
  @IsInt()
  veterinarioId: number;
}
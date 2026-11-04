import { IsNotEmpty, IsOptional, IsString, IsInt, IsNumber, IsDateString } from 'class-validator';

export class CreateVacunacionDto {
  @IsNotEmpty({ message: 'El nombre de la vacuna es obligatorio' })
  @IsString()
  vacuna: string;

  @IsOptional()
  @IsDateString()
  proximaDosis?: string;

  @IsNotEmpty({ message: 'El costo de la vacunación es obligatorio' })
  @IsNumber()
  costo: number;

  @IsNotEmpty({ message: 'El ID del historial clínico es obligatorio' })
  @IsInt()
  historialId: number;

  @IsNotEmpty({ message: 'El ID del veterinario es obligatorio' })
  @IsInt()
  veterinarioId: number;
}
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class CreateMascotaDto {
  @IsNotEmpty({ message: 'El nombre de la mascota es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'La especie es obligatoria' })
  @IsString()
  especie: string;

  @IsOptional()
  @IsString()
  raza?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un valor numérico' })
  peso?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsNotEmpty({ message: 'El ID del cliente dueño es obligatorio' })
  @IsInt()
  clienteId: number;
}
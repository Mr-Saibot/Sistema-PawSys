import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateVeterinarioDto {
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  @IsString()
  especialidad: string;

  @IsNotEmpty({ message: 'El número de matrícula es obligatorio' })
  @IsString()
  nroMatricula: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  correo: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  @IsInt()
  usuarioId: number;
}
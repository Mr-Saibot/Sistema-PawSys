import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateAdministradorDto {
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

  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  @IsInt()
  usuarioId: number;
}
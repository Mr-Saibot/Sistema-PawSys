import { Rol } from '@prisma/client';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  correo: string;

  @MinLength(8)
  password: string;

  @IsIn([Rol.VETERINARIO, Rol.ADMINISTRADOR])
  rol: Rol;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(2)
  apellido: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  especialidad?: string;

  @IsOptional()
  @IsString()
  nroMatricula?: string;
}

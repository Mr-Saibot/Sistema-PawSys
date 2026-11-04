import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHistorialClinicoDto {
  @IsNotEmpty({ message: 'El ID de la mascota es obligatorio' })
  @IsInt()
  mascotaId: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
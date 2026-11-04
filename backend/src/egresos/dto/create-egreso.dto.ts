import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEgresoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto: number;

  @IsString()
  concepto: string;

  @IsString()
  categoria: string;

  @IsInt()
  @Min(1)
  cajaId: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;
}
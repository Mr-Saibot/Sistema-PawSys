import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateIngresoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto: number;

  @IsString()
  concepto: string;

  @IsIn(['EFECTIVO', 'TRANSFERENCIA_QR'])
  formaPago: string;

  @IsString()
  origen: string;

  @IsInt()
  @Min(1)
  cajaId: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
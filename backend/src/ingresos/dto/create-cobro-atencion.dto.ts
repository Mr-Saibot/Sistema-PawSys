import { IsIn, IsInt, Min } from 'class-validator';

export class CreateCobroAtencionDto {
  @IsInt()
  @Min(1)
  cajaId: number;

  @IsIn(['EFECTIVO', 'TRANSFERENCIA_QR'])
  formaPago: string;
}

import { IsNumber, Min } from 'class-validator';

export class CreateCajaDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  saldoInicial: number;
}
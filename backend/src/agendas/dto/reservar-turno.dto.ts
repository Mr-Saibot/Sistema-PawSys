import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class ReservarTurnoDto {
  @IsInt()
  @Min(1)
  mascotaId: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  motivo?: string;
}

import { IsString, MinLength } from 'class-validator';

export class ConfirmarTurnoDto {
  @IsString()
  @MinLength(20)
  token: string;
}

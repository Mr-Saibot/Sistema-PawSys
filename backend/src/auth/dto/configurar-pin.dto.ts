import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class ConfigurarPinDto {
  @IsString({ message: 'La contraseña debe ser texto.' })
  @IsNotEmpty({ message: 'Ingresá la contraseña actual de tu cuenta.' })
  password: string;

  @IsString({ message: 'El PIN debe estar compuesto por números.' })
  @Matches(/^\d{6}$/, {
    message: 'El PIN debe tener exactamente 6 dígitos numéricos.',
  })
  pinNuevo: string;

  @IsOptional()
  @IsString({ message: 'El PIN actual debe estar compuesto por números.' })
  @Matches(/^\d{6}$/, {
    message: 'El PIN actual debe tener exactamente 6 dígitos numéricos.',
  })
  pinActual?: string;
}
